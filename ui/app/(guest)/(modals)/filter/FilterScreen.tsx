import { ThemedText } from '@/components/ThemedText';
import CustomPriceRangeSlider from '@/components/ui/PriceRange';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListingType = 'rental' | 'purchase' | 'hotels';

const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const HANDLE_MIN_GAP = 100; // keep at least $100 between handles

const AMENITIES_BY_TYPE: Record<ListingType, Record<string, string[]>> = {
  rental: {
    "Key Amenities": ["Dryer", "Free parking", "Wifi", "Air conditioning", "TV", "Kitchen"],
    "Building Features": ["Pool", "Hot tub", "Gym", "Balcony"],
    "Safety": ["Smoke alarm", "Carbon monoxide alarm"],
  },
  purchase: {
    "Key Amenities": ["Garage", "Garden", "Air conditioning", "Heating"],
    "Building Features": ["Pool", "Elevator", "Gated", "24/7 Security"],
    "Safety": ["Smoke alarm"],
  },
  hotels: {
    "Key Amenities": ["Breakfast", "Wifi", "TV", "Air conditioning"],
    "Building Features": ["Pool", "Gym", "Doorman"],
    "Safety": ["Smoke alarm", "Carbon monoxide alarm"],
  },
};

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Wifi": "wifi-outline",
  "Air conditioning": "snow-outline",
  "Dryer": "shirt-outline",
  "Free parking": "car-outline",
  "TV": "tv-outline",
  "Kitchen": "restaurant-outline",
  "Washing machine": "refresh-outline",
  "Heating": "flame-outline",
  "Dedicated workspace": "briefcase-outline",
  "Hair dryer": "leaf-outline",
  "Iron": "construct-outline",
  "Pool": "water-outline",
  "Hot tub": "flask-outline",
  "Gym": "barbell-outline",
  "Balcony": "home-outline",
  "Garden": "leaf-outline",
  "Elevator": "swap-vertical-outline",
  "Gated": "lock-closed-outline",
  "24/7 Security": "shield-checkmark-outline",
  "Doorman": "person-outline",
  "Smoke alarm": "warning-outline",
  "Carbon monoxide alarm": "alert-circle-outline",
  "Breakfast": "cafe-outline",
  "Garage": "car-sport-outline",
  "Pet-friendly": "paw-outline",
};



export default function FilterScreen() {
	const insets = useSafeAreaInsets();
	const {theme} = useTheme()
	const navigation = useNavigation()
	

	const [listingType, setListingType] = useState<ListingType>('rental');
	const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 500, max: 5000});
	const [bedrooms, setBedrooms] = useState<number | 'any'>('any');
	const [bathrooms, setBathrooms] = useState<number | 'any'>('any');
	const [beds, setBeds] = useState<number | 'any'>('any');
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
	const [amenities, setAmenities] = useState<string[]>([]);
	const [features, setFeatures] = useState<string[]>([]);

	const histogramData = useMemo(() => [5, 12, 28, 45, 62, 78, 95, 88, 72, 58, 45, 35, 28, 22, 18, 12, 8, 5, 3, 2], []);
	const maxHistogramValue = useMemo(() => Math.max(...histogramData), [histogramData]);

	const propertyTypeOptions: Record<ListingType, string[]> = useMemo(
		() => ({
			rental: ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa'],
			purchase: ['House', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Land'],
			hotels: ['Resort', 'Boutique', 'Business', 'All-inclusive'],
		}),
		[]
	);

	const amenitiesOptions = useMemo(
		() => ['Parking', 'Pet-friendly', 'Pool', 'Gym', 'Garden', 'Balcony', 'AC', 'Laundry'],
		[]
	);
	const featuresOptions = useMemo(
		() => ['Elevator', 'Gated', '24/7 Security', 'Doorman', 'Renovated'],
		[]
	);

	const toggleSection = useCallback((section: string) => {
		setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
	}, []);

	const toggleSelection = useCallback((item: string, list: string[], setList: (v: string[]) => void) => {
		if (list.includes(item)) setList(list.filter(i => i !== item));
		else setList([...list, item]);
	}, []);

	const incrementCount = useCallback((value: number | 'any', setValue: (v: number | 'any') => void) => {
		if (value === 'any') setValue(1);
		else if (value < 8) setValue(value + 1);
	}, []);

	const decrementCount = useCallback((value: number | 'any', setValue: (v: number | 'any') => void) => {
		if (value === 'any') return;
		else if (value > 1) setValue(value - 1);
		else setValue('any');
	}, []);

	const getActiveFilterCount = useCallback(() => {
		let count = 0;
		if (bedrooms !== 'any') count++;
		if (bathrooms !== 'any') count++;
		if (beds !== 'any') count++;
		if (propertyTypes.length > 0) count++;
		if (amenities.length > 0) count++;
		if (features.length > 0) count++;
		return count;
	}, [amenities.length, bathrooms, beds, bedrooms, features.length, propertyTypes.length]);

	const clearAll = useCallback(() => {
		setBedrooms('any');
		setBathrooms('any');
		setBeds('any');
		setPropertyTypes([]);
		setAmenities([]);
		setFeatures([]);
		setPriceRange({min: 500, max: 5000});
	}, []);

	const getPriceLabel = useCallback(() => {
		if (listingType === 'rental') return 'per month';
		if (listingType === 'purchase') return 'total';
		return 'per night';
	}, [listingType]);

	const formatPrice = useCallback((price: number) => {
		if (price >= 1000) return `$${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
		return `$${price}`;
	}, []);

	const propertyPrices = [
    800, 1200, 1500, 2000, 2500, 900, 1100, 1800, 2200, 2800,
    750, 1300, 1600, 2100, 2600, 850, 1250, 1900, 2300, 2900,
    // ... more prices
  ];

  const handleRangeChange = (min: number, max: number) => {
    console.log('Price range changed:', min, max);
    setPriceRange({ min, max });
    
    // Apply filters to your property list
    // filterProperties(min, max);
  };

	// Slider via external library handled in JSX below

	return (
		<View style={[styles.safe, { backgroundColor: theme.colors.backgroundSec }]}> 
			<View style={styles.container}>
				{/* Header */}
				<View style={[styles.header, {borderColor: theme.colors.border}]}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={[styles.shadow1, {padding: 8, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.shadow, backgroundColor: theme.mode == 'light'? theme.colors.background: 'transparent'}]}>
						<ChevronLeft size={24} color={theme.colors.text}/>
					</TouchableOpacity>
					<View style={{gap: 5, alignItems:'center',}}>
						<ThemedText secondary style={styles.headerTitle}>Filter Property</ThemedText>
						{getActiveFilterCount() > 0 && (
							// <View >
								<ThemedText type='defaultSemiBold' style={{color: theme.colors.primary}}>{getActiveFilterCount()} • active</ThemedText>
							// </View>
						)}
					</View>
					<TouchableOpacity style={[styles.headerRight,  {padding: 8, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.shadow, backgroundColor: theme.mode == 'light'? theme.colors.background: 'transparent'}]} onPress={clearAll}>
                        <Ionicons name='refresh-outline' size={24} color={theme.colors.text} style={{fontWeight: '900',}} />
					</TouchableOpacity>
				</View>

				{/* Content */}
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Listing Type */}
					<View style={[styles.section, {borderBottomColor: theme.colors.border}]}>
						<View style={[styles.segment, {backgroundColor: theme.mode == 'light'? '#E5E7EB': theme.colors.background2}]}
						>
							{(['rental', 'purchase', 'hotels'] as ListingType[]).map(type => {
								const isActive = listingType === type;
								return (
									<TouchableOpacity key={type} style={[styles.segmentBtn, isActive && styles.segmentBtnActive, isActive && {backgroundColor: theme.colors.background}]} onPress={() => setListingType(type)}>
									    <ThemedText style={[styles.segmentText, isActive && styles.segmentTextActive]}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</ThemedText>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					{/* Price Range */}
					<View style={[styles.section, {borderBottomColor: theme.colors.border}]}>
						<ThemedText style={styles.label}>Price Range <ThemedText style={styles.labelSub}>({getPriceLabel()})</ThemedText></ThemedText>

						{/* Histogram */}
						<View style={[styles.histContainer,]}>
							{/* <View style={styles.histBars}>
								{histogramData.map((value, index) => {
									const heightPct = (value / maxHistogramValue) * 100;
									const barPositionPct = (index / histogramData.length) * 100;
									const minPosition = (priceRange.min / MAX_PRICE) * 100;
									const maxPosition = (priceRange.max / MAX_PRICE) * 100;
									const isInRange = barPositionPct >= minPosition && barPositionPct <= maxPosition;
									return (
										<View key={index} style={[styles.histBar, { height: `${heightPct}%`, backgroundColor: isInRange ? theme.colors.primary : '#E5E7EB' }]} />
									);
								})}
							</View> */}
							{/* <MultiSlider
								values={priceRange}
								onValuesChange={(vals: number[]) => {
									const min = Math.max(MIN_PRICE, Math.min(vals[0], vals[1] - HANDLE_MIN_GAP));
									const max = Math.min(MAX_PRICE, Math.max(vals[1], vals[0] + HANDLE_MIN_GAP));
									setPriceRange([min, max]);
								}}
								min={MIN_PRICE}
								max={MAX_PRICE}
								step={50}
								trackStyle={{backgroundColor: 'red'}}
								allowOverlap={false}
								containerStyle={{ maxHeight: 20, }}
								markerContainerStyle={{margin:0, padding:0, }}
								pressedMarkerStyle={{margin:0, padding:0, }}
								selectedStyle={{ backgroundColor: theme.colors.text,  }}
								unselectedStyle={{ backgroundColor: '#E5E7EB',  }}
								markerStyle={{ height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.primary, backgroundColor: '#FFFFFF' }}
							/> */}
							<CustomPriceRangeSlider showChart min={0} max={500} values={priceRange} onChange={(value) => setPriceRange(value)} histogramData={histogramData} />
						</View>

					</View>
					{/* Counters */}
					<View style={[styles.section, {borderBottomColor: theme.colors.border}]}>
						<ThemedText style={styles.label}>{listingType === 'hotels' ? 'Rooms & Bathrooms' : 'Bedrooms & Bathrooms'}</ThemedText>

						{/* Bedrooms/Rooms */}
						<CounterRow
							label={listingType === 'hotels' ? 'Rooms' : 'Bedrooms'}
							value={bedrooms}
							onDecrement={() => decrementCount(bedrooms, setBedrooms)}
							onIncrement={() => incrementCount(bedrooms, setBedrooms)}
						/>

						{/* Beds */}
						{(listingType === 'rental' || listingType === 'hotels') && (
							<CounterRow
								label="Beds"
								value={beds}
								onDecrement={() => decrementCount(beds, setBeds)}
								onIncrement={() => incrementCount(beds, setBeds)}
							/>
						)}

						{/* Bathrooms */}
						<CounterRow
							label="Bathrooms"
							value={bathrooms}
							onDecrement={() => decrementCount(bathrooms, setBathrooms)}
							onIncrement={() => incrementCount(bathrooms, setBathrooms)}
						/>
					</View>

					{/* Property Type - Collapsible */}
					<View style={[styles.section, {borderBottomColor: theme.colors.border}]}>
			            <ThemedText style={styles.label}>Property Type</ThemedText>
						<View style={styles.chipsWrap}>
							{propertyTypeOptions[listingType].map(type => (
								<Chip
									key={type}
									label={type}
									active={propertyTypes.includes(type)}
									onPress={() => toggleSelection(type, propertyTypes, setPropertyTypes)}
								/>
							))}
						</View>
					</View>

					{/* Amenities Section */}
                    {/* <View style={[styles.section, {borderBottomColor: theme.colors.border}]}>
                        <CollapseHeader
                            title="Amenities"
                            expanded={!!expandedSections.amenities}
                            onToggle={() => toggleSection('amenities')}
							children={(
								<View></View>
							)}
                        />
                        {expandedSections.amenities && (
                            <View style={{ marginTop: 15 }}>
                                {Object.entries(AMENITIES_BY_TYPE[listingType]).map(([subSection, items]) => (
                                    <View key={subSection} style={{ marginBottom: 20 }}>
                                        <ThemedText style={[ {fontSize: 16, fontWeight: 600, marginBottom: 8 }]}>{subSection}</ThemedText>
                                        <View style={styles.chipsWrap}>
                                            {items.map((amenity) => (
                                                <Chip
                                                    key={amenity}
                                                    label={amenity}
                                                    active={amenities.includes(amenity)}
                                                    onPress={() => toggleSelection(amenity, amenities, setAmenities)}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View> */}
					{/* Amenities Section */}
<View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
  <CollapseHeader
    showIcon={false}
    title="Amenities"
    expanded={!!expandedSections.amenities}
    onToggle={() => toggleSection('amenities')}
    children={(
      <View style={{ marginTop: 12 }}>
        {/* ✅ Key Amenities stay visible even when collapsed */}
        <View>
          <ThemedText style={[{ fontSize: 16, fontWeight: 600, marginBottom: 8 }]}>
            Key Amenities
          </ThemedText>
          <View style={styles.chipsWrap}>
            {AMENITIES_BY_TYPE[listingType]["Key Amenities"].map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                active={amenities.includes(amenity)}
                onPress={() => toggleSelection(amenity, amenities, setAmenities)}
              />
            ))}
          </View>
        </View>
      </View>
    )}
  />

  {/* Only show these when expanded */}
  {expandedSections.amenities && (
    <View style={{ marginTop: 20 }}>
      {Object.entries(AMENITIES_BY_TYPE[listingType])
        .filter(([subSection]) => subSection !== "Key Amenities")
        .map(([subSection, items]) => (
          <View key={subSection} style={{ marginBottom: 20 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {subSection}
            </ThemedText>
            <View style={styles.chipsWrap}>
              {items.map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  active={amenities.includes(amenity)}
                  onPress={() => toggleSelection(amenity, amenities, setAmenities)}
                />
              ))}
            </View>
          </View>
        ))}

		<Pressable onPress={() => toggleSection('amenities')}>
			<ThemedText secondary style={{textDecorationLine: 'underline', fontSize: 16}}>Show All Amenities</ThemedText>
		</Pressable>
    </View>
  )}
</View>

				</ScrollView>

				{/* Footer */}
				<View style={[styles.footer, {backgroundColor: theme.colors.background}]}> 
    				<TouchableOpacity style={{}}>
						<ThemedText style={styles.secondaryBtnText}>Save</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.primaryBtn, {backgroundColor: theme.mode == 'dark'? theme.colors.background2: theme.colors.text}]}>
						<ThemedText style={[styles.primaryBtnText, ]}>Show 247 places</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

function CollapseHeader({ title, expanded, onToggle, children , showIcon=true}: { title: string; expanded: boolean; children?: any, onToggle: () => void, showIcon?: boolean }) {
	const {theme} = useTheme()
	return (<>
		<TouchableOpacity onPress={onToggle} style={styles.collapseHeader}>
			<ThemedText style={styles.label}>{title}</ThemedText>
			{/* {showIcon && (expanded ? <ChevronUp size={20} color={theme.colors.text} /> : <ChevronDown size={20} color={theme.colors.text} />)} */}
			{expanded ? (showIcon ?<ChevronUp size={20} color={theme.colors.text} /> : null) : <ChevronDown size={20} color={theme.colors.text} />}
		</TouchableOpacity>
		{children}
	</>);
}


function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  const iconName = AMENITY_ICONS[label] || 'ellipse-outline'; // fallback icon

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        styles.shadow1,
        active && { backgroundColor: theme.colors.text },
        { borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
      ]}
    >
      <Ionicons
        name={iconName}
        size={22}
        color={active ? theme.colors.background : theme.colors.text}
      />
      <ThemedText style={{ color: active ? theme.colors.background : theme.colors.text }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}


function CounterRow({ label, value, onDecrement, onIncrement }: { label: string; value: number | 'any'; onDecrement: () => void; onIncrement: () => void }) {
	const isMin = value === 'any';
	const isMax = value === 8;
	const {theme} = useTheme()

	return (
		<View style={styles.counterRow}>
			<ThemedText style={styles.counterLabel}>{label}</ThemedText>
			<View style={styles.counterControls}>
				<TouchableOpacity onPress={onDecrement} disabled={isMin} style={[styles.counterBtn, {borderColor: theme.colors.border}, isMin && styles.counterBtnDisabled]}>
					<ThemedText style={styles.counterBtnText}>−</ThemedText>
				</TouchableOpacity>
				<ThemedText style={styles.counterValue}>{value === 'any' ? 'Any' : value}</ThemedText>
				<TouchableOpacity onPress={onIncrement} disabled={isMax} style={[styles.counterBtn, {borderColor: theme.colors.border}, isMax && styles.counterBtnDisabled]}>
					<ThemedText style={styles.counterBtnText}>+</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, paddingTop: 54 },
	container: { flex: 1, justifyContent: 'flex-end' },
	header: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 16,
		paddingTop: 0,
		paddingBottom: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		// borderBottomColor: '#E5E7EB',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 2,
	},
	shadow1: {
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
    
  },
  shadow: {
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
	headerLeft: { flexDirection: 'row', alignItems: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '600', marginRight: 8 },
	activeBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
	// activeBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
	headerRight: { flexDirection: 'row', alignItems: 'center' },
	clearText: { color: '#4B5563', fontSize: 14, fontWeight: '600', marginRight: 12 },

	scrollContent: { paddingHorizontal: 16, paddingBottom: 70 },
	section: { paddingVertical: 30, borderBottomWidth: StyleSheet.hairlineWidth },
	label: { fontSize: 18, fontWeight: '600' },
	labelSub: { fontWeight: '400' },

	segment: { backgroundColor: '#F3F4F6', padding: 4, borderRadius: 12, flexDirection: 'row' },
	segmentBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
	segmentBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
    segmentText: { fontSize: 14, fontWeight: '600' },
    segmentTextActive: {},

	histContainer: { marginTop: 12, marginBottom: 0, paddingHorizontal: 2, },
	histBars: { height: 96, flexDirection: 'row', alignItems: 'flex-end', columnGap: 2 },
	histBar: { flex: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2 },

	priceLabelsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
	pricePill: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, },
	pricePillText: { fontSize: 14, fontWeight: '700' },
	// dash: { paddingHorizontal: 8 },

	track: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 999 },
	activeTrack: { position: 'absolute', top: 0, bottom: 0, backgroundColor: '#2563EB', borderRadius: 999 },
	sliderOverlay: { position: 'relative', height: 24, marginTop: -16, justifyContent: 'center' },
	handle: {
		position: 'absolute',
		top: 4,
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#FFFFFF',
		borderWidth: 2,
		borderColor: '#2563EB',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 2,
	},

	counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
	counterLabel: { fontSize: 16 },
	counterControls: { flexDirection: 'row', alignItems: 'center', columnGap: 4 },
	counterBtn: { width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', borderWidth: 1,  },
	counterBtnDisabled: { opacity: 0.4 },
	counterBtnText: { fontSize: 18, fontWeight: '600' },
	counterValue: { width: 64, textAlign: 'center', fontSize: 14, fontWeight: '700' },

	collapseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, rowGap: 10 },
	chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
	chipInactive: { backgroundColor: '#F3F4F6' },
	chipActive: { backgroundColor: '#2563EB' },
	chipText: { fontSize: 14, fontWeight: '600' },
	chipTextInactive: {},
	chipTextActive: {},

	footer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 25,
		backgroundColor: '#FFFFFF',
		borderTopColor: '#E5E7EB',
		// borderTopWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 20,
		// paddingTop: 12,
		height: 65,
		marginHorizontal: 22,
		borderRadius: 30,
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 12,
		justifyContent:'space-between'
	},
	primaryBtn: { width: 170, borderRadius: 20,  paddingVertical: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 },
	primaryBtnText: { color: '#FFFFFF', fontWeight: '700', },
	secondaryBtn: { paddingHorizontal: 12,},
	secondaryBtnText: { fontWeight: '600',  },
});



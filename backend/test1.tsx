import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListingType = 'rental' | 'purchase' | 'hotels';

const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const HANDLE_MIN_GAP = 100; // keep at least $100 between handles

export default function FilterScreen() {
	const insets = useSafeAreaInsets();
	const {theme} = useTheme()
	const navigation = useNavigation()
	

	const [listingType, setListingType] = useState<ListingType>('rental');
	const [priceRange, setPriceRange] = useState<[number, number]>([500, 5000]);
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
		setPriceRange([500, 5000]);
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

	// Slider via external library handled in JSX below

	return (
		<View style={[styles.safe, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.background }]}> 
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={[styles.shadow1, {padding: 8, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.shadow, backgroundColor: theme.mode == 'light'? theme.colors.background: 'transparent'}]}>
						<ChevronLeft size={24} color={theme.colors.text}/>
					</TouchableOpacity>
					<View style={{gap: 5, alignItems:'center',}}>
						<ThemedText style={styles.headerTitle}>Filters</ThemedText>
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
					<View style={styles.section}>
						<View style={[styles.segment, {backgroundColor: theme.colors.backgroundSec}]}
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
					<View style={styles.section}>
						<ThemedText style={styles.label}>Price Range <ThemedText style={styles.labelSub}>({getPriceLabel()})</ThemedText></ThemedText>

						{/* Histogram */}
						<View style={styles.histContainer}>
							<View style={styles.histBars}>
								{histogramData.map((value, index) => {
									const heightPct = (value / maxHistogramValue) * 100;
									const barPositionPct = (index / histogramData.length) * 100;
									const minPosition = (priceRange[0] / MAX_PRICE) * 100;
									const maxPosition = (priceRange[1] / MAX_PRICE) * 100;
									const isInRange = barPositionPct >= minPosition && barPositionPct <= maxPosition;
									return (
										<View key={index} style={[styles.histBar, { height: `${heightPct}%`, backgroundColor: isInRange ? '#2B5BF5' : '#E5E7EB' }]} />
									);
								})}
							</View>
							<MultiSlider
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
								containerStyle={{ maxHeight: 20, width: '100%'}}
								markerContainerStyle={{margin:0, padding:0, }}
								pressedMarkerStyle={{margin:0, padding:0, }}
								selectedStyle={{ backgroundColor: theme.colors.text }}
								unselectedStyle={{ backgroundColor: '#E5E7EB' }}
								markerStyle={{ height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2563EB', backgroundColor: '#FFFFFF' }}
							/>
						</View>


						{/* Price Labels */}
						<View style={styles.priceLabelsRow}>
						    <View style={[styles.pricePill, {borderColor: theme.colors.border}]}><ThemedText style={styles.pricePillText}>{formatPrice(priceRange[0])}</ThemedText></View>
						    {/* <ThemedText secondary style={styles.dash}>—</ThemedText> */}
						    <View style={[styles.pricePill, {borderColor: theme.colors.border}]}><ThemedText style={styles.pricePillText}>{formatPrice(priceRange[1])}</ThemedText></View>
						</View>

					</View>
					{/* Counters */}
					<View style={styles.section}>
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
					<View style={styles.section}>
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

					{/* Key Amenities - Collapsible */}
					<View style={styles.section}>
						<CollapseHeader
							title="Key Amenities"
							expanded={!!expandedSections.amenities}
							onToggle={() => toggleSection('amenities')}
						/>
						{expandedSections.amenities && (
							<View style={styles.chipsWrap}>
								{amenitiesOptions.map(amenity => (
									<Chip
										key={amenity}
										label={amenity}
										active={amenities.includes(amenity)}
										onPress={() => toggleSelection(amenity, amenities, setAmenities)}
									/>
								))}
							</View>
						)}
					</View>

					{/* Building Features - Collapsible */}
					<View style={[styles.section, { paddingBottom: 120 }]}> 
						<CollapseHeader
							title="Building Features"
							expanded={!!expandedSections.features}
							onToggle={() => toggleSection('features')}
						/>
						{expandedSections.features && (
							<View style={styles.chipsWrap}>
								{featuresOptions.map(feature => (
									<Chip
										key={feature}
										label={feature}
										active={features.includes(feature)}
										onPress={() => toggleSelection(feature, features, setFeatures)}
									/>
								))}
							</View>
						)}
					</View>
				</ScrollView>

				{/* Footer */}
				<View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
					<TouchableOpacity style={styles.primaryBtn}>
						<ThemedText style={styles.primaryBtnText}>Show 247 properties</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryBtn}>
						<ThemedText style={styles.secondaryBtnText}>Save</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

function CollapseHeader({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
	const {theme} = useTheme()
	return (
		<TouchableOpacity onPress={onToggle} style={styles.collapseHeader}>
			<ThemedText style={styles.label}>{title}</ThemedText>
			{expanded ? <ChevronUp size={20} color={theme.colors.text} /> : <ChevronDown size={20} color={theme.colors.text} />}
		</TouchableOpacity>
	);
}

function Chip({ label, active, onPress, }: { label: string; active: boolean; onPress: () => void }) {
	const {theme} = useTheme()
	return (
		<TouchableOpacity onPress={onPress} style={[styles.chip, styles.shadow1, active && {backgroundColor: theme.colors.text}, {borderWidth: 1, borderColor: theme.colors.border}]}>
		{/* <TouchableOpacity onPress={onPress} style={[styles.chip, styles.shadow1, active ? styles.chipActive : styles.chipInactive]}> */}
			<ThemedText style={[ {color: active ? theme.colors.background: theme.colors.text}]}>{label}</ThemedText>
			{/* <ThemedText style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>{label}</ThemedText> */}
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
		borderBottomColor: '#E5E7EB',
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

	scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
	section: { paddingVertical: 16, borderBottomColor: '#E5E7EB', borderBottomWidth: StyleSheet.hairlineWidth },
	label: { fontSize: 14, fontWeight: '600' },
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
	counterLabel: { fontSize: 14 },
	counterControls: { flexDirection: 'row', alignItems: 'center', columnGap: 4 },
	counterBtn: { width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', borderWidth: 1,  },
	counterBtnDisabled: { opacity: 0.4 },
	counterBtnText: { fontSize: 18, fontWeight: '600' },
	counterValue: { width: 64, textAlign: 'center', fontSize: 14, fontWeight: '700' },

	collapseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
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
		bottom: 0,
		backgroundColor: '#FFFFFF',
		borderTopColor: '#E5E7EB',
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 16,
		paddingTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 12,
	},
	primaryBtn: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 },
	primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
	secondaryBtn: { paddingHorizontal: 12, paddingVertical: 14 },
	secondaryBtnText: { color: '#374151', fontWeight: '600' },
});

// 1. Realtor (User) by realtor_id
const realtorLoader = new DataLoader(async (realtorIds: number[]) => {
  const users = await db.users.find({ id: { $in: realtorIds } });
  return realtorIds.map(id => users.find(u => u.id === id) || null);
});

// 2. Address by address_id
const addressLoader = new DataLoader(async (addressIds: number[]) => {
  const addresses = await db.addresses.find({ id: { $in: addressIds } });
  return addressIds.map(id => addresses.find(a => a.id === id));
});

// 3. Property Images
const propertyImagesLoader = new DataLoader(async (propertyIds: bigint[]) => {
  const images = await db.property_images.find({ property_id: { $in: propertyIds } });
  return propertyIds.map(id => images.filter(img => img.property_id === id));
});

// 4. Room Types by property_id
const roomTypesLoader = new DataLoader(async (propertyIds: number[]) => {
  const types = await db.room_types.find({ property_id: { $in: propertyIds } });
  return propertyIds.map(id => types.filter(t => t.property_id === id));
});

// 5. Room Units by room_type_id
const roomUnitsLoader = new DataLoader(async (typeIds: number[]) => {
  const units = await db.room_units.find({ room_type_id: { $in: typeIds } });
  return typeIds.map(id => units.filter(u => u.room_type_id === id));
});

// 6. Pricing Rules
const pricingRulesLoader = new DataLoader(async (typeIds: number[]) => {
  const rules = await db.room_pricing_rules.find({ room_type_id: { $in: typeIds } });
  return typeIds.map(id => rules.filter(r => r.room_type_id === id));
});

// 7. Duration Discounts
const durationDiscountsLoader = new DataLoader(async (typeIds: number[]) => {
  const discounts = await db.room_duration_discounts.find({ room_type_id: { $in: typeIds } });
  return typeIds.map(id => discounts.filter(d => d.room_type_id === id));
});

// 8. Rate Calendar (with date range)
const rateCalendarLoader = new DataLoader(async (keys: { typeId: number; start: string; end: string }[]) => {
  const typeIds = keys.map(k => k.typeId);
  const calendars = await db.rate_calendar.find({
    room_type_id: { $in: typeIds },
    date: { $gte: min(keys, 'start'), $lte: max(keys, 'end') }
  });
  return keys.map(({ typeId, start, end }) =>
    calendars.filter(c => c.room_type_id === typeId && c.date >= start && c.date <= end)
  );
});

// 9. Room Blocks
const roomBlocksLoader = new DataLoader(async (typeIds: number[]) => {
  const blocks = await db.room_blocks.find({ room_type_id: { $in: typeIds } });
  return typeIds.map(id => blocks.filter(b => b.room_type_id === id));
});

// 10. Bookings by unit_id
const bookingsLoader = new DataLoader(async (unitIds: number[]) => {
  const bookings = await db.bookings.find({ unit_id: { $in: unitIds } });
  return unitIds.map(id => bookings.filter(b => b.unit_id === id));
});

const resolvers = {
  Property: {
    realtor: (parent, _, { loaders }) => loaders.realtorLoader.load(parent.realtor_id),
    address: (parent, _, { loaders }) => parent.address_id ? loaders.addressLoader.load(parent.address_id) : null,
    images: (parent, _, { loaders }) => loaders.propertyImagesLoader.load(parent.id),
    roomTypes: (parent, _, { loaders }) => loaders.roomTypesLoader.load(parent.id),
  },
  RoomType: {
    roomUnits: (parent, _, { loaders }) => loaders.roomUnitsLoader.load(parent.id),
    pricingRules: (parent, _, { loaders }) => loaders.pricingRulesLoader.load(parent.id),
    durationDiscounts: (parent, _, { loaders }) => loaders.durationDiscountsLoader.load(parent.id),
    rateCalendar: (parent, { start, end }, { loaders }) =>
      loaders.rateCalendarLoader.load({ typeId: parent.id, start, end }),
    blocks: (parent, _, { loaders }) => loaders.roomBlocksLoader.load(parent.id),
  },
  RoomUnit: {
    bookings: (parent, _, { loaders }) => loaders.bookingsLoader.load(parent.id),
  }
};

searchProperties: async (_: any, { input, first, after }: { input: any; first: number; after?: string }, __: any, info: any) => {
	  const requestedFields = getNodeFields(info);
	  // console.log('searchProperties requestedFields:', requestedFields);
	  return await PropertyModel.searchPaginated(input, first, after, requestedFields);
	},


	async searchPaginated(input: PropertySearchInput, first: number, after?: string, requestedFields: string[] = []): Promise<{
		edges: { node: Property; cursor: string }[];
		pageInfo: { hasNextPage: boolean; endCursor: string | null };
		totalCount: number;
	  }> {
		const cacheKey = `properties:search:${JSON.stringify(input)}:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
		const cached = await this.redisClient.get(cacheKey);
		// if (cached && typeof cached === 'string') return JSON.parse(cached);
	
		const fields = this.mapGraphQLFieldsToColumns(requestedFields);
		let whereClauses = ["(p.status = 'draft' OR p.status = 'published')"];
		const params: any[] = [];
		let paramIndex = 1;
	
		if (input?.query) {
		  whereClauses.push(`(p.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex} OR a.street ILIKE $${paramIndex})`);
		  params.push(`%${input.query}%`);
		  paramIndex++;
		}
	
		if (input.minPrice !== undefined) {
		  whereClauses.push(`p.price >= $${paramIndex}`);
		  params.push(input.minPrice);
		  paramIndex++;
		}
	
		if (input.maxPrice !== undefined) {
		  whereClauses.push(`p.price <= $${paramIndex}`);
		  params.push(input.maxPrice);
		  paramIndex++;
		}
	
		if (input.speciality) {
		  whereClauses.push(`p.speciality ILIKE $${paramIndex}`);
		  params.push(`%${input.speciality}%`);
		  paramIndex++;
		}
	
		if (input.amenities && input.amenities.length > 0) {
		  whereClauses.push(`p.amenities @> $${paramIndex}::jsonb`);
		  params.push(JSON.stringify(input.amenities));
		  paramIndex++;
		}
	
		if (input.minRating !== undefined) {
		  whereClauses.push(`COALESCE((SELECT AVG(r.rating) FROM property_reviews r WHERE r.property_id = p.id), 0) >= $${paramIndex}`);
		  params.push(input.minRating);
		  paramIndex++;
		}
	
		let availabilityClause = '';
		let dateParamsCount = 0;
		if (input.startDate && input.endDate) {
		  availabilityClause = ` AND NOT EXISTS (
			SELECT 1 FROM property_bookings b 
			WHERE b.property_id = p.id AND b.status = 'confirmed' 
			AND (b.start_date, b.end_date) OVERLAPS ($${paramIndex}::date, $${paramIndex + 1}::date)
		  )`;
		  params.push(input.startDate, input.endDate);
		  paramIndex += 2;
		  dateParamsCount = 2;
		}
	
		if (after) {
		  // console.log({paramIndex, after})
		  whereClauses.push(`p.id > $${paramIndex}`);
		  params.push(parseInt(after));
		  paramIndex++;
		}
	
		const fullWhere = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
		// console.log({fullWhere, params})
		const query = `
		  SELECT ${fields.join(', ')}
		  FROM properties p
		  LEFT JOIN addresses a ON p.address_id = a.id
		  LEFT JOIN cities c ON a.city_id = c.id
		  LEFT JOIN countries co ON c.country_id = co.id
		  ${fullWhere}${availabilityClause}
		  ORDER BY p.id ASC
		  LIMIT $${paramIndex}
		`;
		params.push(first + 1);
	
		const countQuery = `
		  SELECT COUNT(DISTINCT p.id) as total
		  FROM properties p
		  LEFT JOIN addresses a ON p.address_id = a.id
		  LEFT JOIN cities c ON a.city_id = c.id
		  LEFT JOIN countries co ON c.country_id = co.id
		  ${fullWhere}${availabilityClause}
		`;
		const countParams = params.slice(0, paramIndex - 1);
		console.log({params, query: query.split('properties')[1]})
		const [result, countResult] = await Promise.all([
		  this.pool.query(query, params),
		  this.pool.query(countQuery, countParams)
		]);
	
		const properties = result.rows;
		const totalCount = parseInt(countResult.rows[0].total);
		const hasNextPage = properties.length > first;
		const edges = properties.slice(0, first).map(property => ({
		  node: property,
		  cursor: property.id.toString()
		}));
		const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
	
		const response = {
		  edges,
		  pageInfo: { hasNextPage, endCursor },
		  totalCount
		};
	
		console.log({edges: edges.map((edge) => edge.node)})
	
		await this.redisClient.setEx(cacheKey, 300, JSON.stringify(response)); // Shorter TTL for searches
		return response;
	  }
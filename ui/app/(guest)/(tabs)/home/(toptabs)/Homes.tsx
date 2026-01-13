import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/ui/Card';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme/theme';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

type Property = any;

type MixedRow =
  | { kind: 'property'; item: Property }
  | { kind: 'featured'; items: Property[]; title: string };

  const FALLBACK_IMAGES = [
    'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
    'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
    'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
  ];

const PropertyCard = ({ property, width_ }: { property: Property, width_?: number }) => {
  const { theme } = useTheme();

  const price = property?.price ?? 0;
  const city = property?.address?.city || 'Unknown';
  const country = property?.address?.country || '';
  const type = (property?.category || property?.type || 'Home') as string;

  const beds = property?.beds ?? ((price % 3) + 2);
  const baths = property?.baths ?? ((price % 2) + 1);
  const sqft = property?.sqft ?? (900 + (price % 5) * 120);

  const tags: string[] = useMemo(() => {
    const t: string[] = [];
    if (price && price < 100) t.push('Deal');
    if ((property?.images?.length || 0) > 1) t.push('3D Walkthrough');
    if ((property?.status || 'ACTIVE') === 'PENDING') t.push('New');
    return t;
  }, [price, property]);

  const images = (property?.images?.map((i: any) => i.url) || FALLBACK_IMAGES) as any;

  return (
    <Card elevated style={[styles.card, { backgroundColor: theme.colors.backgroundSec }]}>
      <ImageCarousel images={FALLBACK_IMAGES} imageHeight={220} width={width_ || width - 20} uri />

      <View style={styles.cardBody}>
        <View style={{flexDirection:'row', alignItems: 'center'}}>
          <View style={{flex:1}}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ${price?.toLocaleString?.() || price} {type === 'apartment' ? 'mo' : ''}
            </ThemedText>

            <View style={styles.row}>
              <ThemedText type="body" secondary>{beds} beds</ThemedText>
              <View style={styles.dot} />
              <ThemedText type="body" secondary>{baths} baths</ThemedText>
              <View style={styles.dot} />
              <ThemedText type="body" secondary>{sqft} sq.ft</ThemedText>
            </View>
          </View>
          <View style={{flexDirection:'row', gap: 5}}>
            <Entypo
              name={true ? 'heart' : 'heart-outlined'}
              color={true ? theme.colors.primary : theme.colors.text}
              size={26} 
            />
            {/* <Entypo name="share-alternative" color={theme.colors.text} size={24} /> */}
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
            <ThemedText type="caption" secondary>{city}{country ? `, ${country}` : ''}</ThemedText>
          </View>
          <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}> 
            <ThemedText type="caption">{type.charAt(0).toUpperCase() + type.slice(1)}</ThemedText>
          </View>
        </View>

        
      </View>
      {!!tags.length && (
          <View style={{position:'absolute', top: 8, left: 8, flexDirection: 'row', gap: 10}}>
            {tags.map((t, idx) => (
              <View key={`${property.id}-tag-${idx}`} style={[styles.tag, { backgroundColor: theme.colors.background }]}> 
                <ThemedText type="caption">{t}</ThemedText>
              </View>
            ))}
          </View>
        )}
    </Card>
  );
};

function HomesTab() {
  const { theme } = useTheme();
  // const { data: properties, loading } = useProperties();
  // console.log(properties)
  const properties: any = []

  const cityKey = properties?.[0]?.address?.city;
  console.warn(cityKey)

  const {isAuthenticated, isLoading, mode, accessToken, loadAuth} = useAuthStore()
  // loadAuth
  // console.warn({isAuthenticated, isLoading, accessToken, mode})

  const mixed: MixedRow[] = useMemo(() => {
    const list: MixedRow[] = [];
    if (!properties?.length) return list;

    const sameCity = properties.filter((p: any) => p.address?.city === cityKey);
    const others = properties.filter((p: any) => p.address?.city !== cityKey);

    sameCity.forEach((p: any, idx: number) => {
      list.push({ kind: 'property', item: p });
      if ((idx + 1) % 3 === 0) {
        const slice = properties.slice(0, 6);
        list.push({ kind: 'featured', items: slice, title: 'Featured near you' });
      }
    });

    others.forEach((p: any, idx: number) => {
      if (idx === 0) list.push({ kind: 'featured', items: properties.slice(3, 9), title: 'Popular picks' });
      list.push({ kind: 'property', item: p });
    });
    return list;
  }, [properties, cityKey]);

  const renderFeatured = (title: string, items: Property[]) => (
    <View style={{ gap: 8 }}>
      <ThemedText type="subtitle" style={{ paddingHorizontal: 16 }}>{title}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {items.map((it: any) => (
          <View key={`featured-${it.id}`} style={{ width: Math.min(280, width * 0.72) }}>
            <PropertyCard property={it} width_={Math.min(280, width * 0.72)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      data={mixed}
      keyExtractor={(row, index) => ('kind' in row ? `${row.kind}-${index}` : `${index}`)}
      // ListHeaderComponent={
      //   <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      //     <ThemedText type="title">Homes</ThemedText>
      //     <ThemedText type="caption" secondary>
      //       {cityKey ? `Showing places in ${cityKey} first` : 'Recommended for you'}
      //     </ThemedText>
      //   </View>
      // }
      renderItem={({ item }) => {
        if (item.kind === 'featured') {
          return renderFeatured(item.title, item.items);
        }
        return (
          <View style={{ paddingHorizontal: 12 }}>
            <PropertyCard property={item.item} />
          </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={{ paddingBottom: 100, backgroundColor: theme.colors.background, paddingTop: 16 }}
      refreshing={false}
      onRefresh={() => {}}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    paddingLeft:0,
    margin:0
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(140,140,140,0.6)',
  },
  price: {
    fontSize: 18,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});

export default HomesTab;

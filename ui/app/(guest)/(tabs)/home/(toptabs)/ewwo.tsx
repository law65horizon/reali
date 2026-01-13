
import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/ui/Card';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useMapAnimation } from '@/hooks/useMapAnimation';
import { useProperties } from '@/hooks/useProperties';
import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Skeleton } from 'moti/skeleton';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const images = [
  'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
  'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
  'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
];

function HomesTab() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { loading, data, error, hasNextPage, loadMore } = useProperties();
  const scrollViewRef = useRef<ScrollView>(null);
  const { onScroll } = useMapAnimation(scrollViewRef);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({});
  const [isRefreshing, setRefreshing] = useState(false)

  console.log(favorites)
  // console.warn(properties[0], loading, error);

  // Handle share icon press
  const handleSharePress = useCallback(async (property: any) => {
    try {
      const shareMessage = `Check out this property: ${property.title || 'Amazing Property'} in ${property.address?.city || 'Unknown City'}!`;
      const shareUrl = `https://yourapp.com/listing/${property.id}`; // Replace with your app's deep link
      await Share.share({
        message: `${shareMessage}\n${shareUrl}`,
        url: shareUrl,
        title: property.title || 'Property Listing',
      });
    } catch (err) {
      console.error(`Failed to share property ${property.id}:`, err);
    }
  }, []);

  // Handle heart icon press
  const handleFavoritePress = useCallback(async (propertyId: string) => {
    setLoadingFavorites((prev) => ({ ...prev, [propertyId]: true }));
    try {
      // await toggleFavorite(propertyId);
      setFavorites((prev) => ({
        ...prev,
        [propertyId]: !prev[propertyId],
      }));
    } catch (err) {
      console.error(`Failed to toggle favorite for property ${propertyId}:`, err);
    } finally {
      setLoadingFavorites((prev) => ({ ...prev, [propertyId]: false }));
    }
  }, []);

  const renderPropertyItem = useCallback(
    ({ item }: { item: any }) => (
      <Card elevated style={styles.propertyCard} onPress={() => router.push(`/listing/${item.id}`)}>
        {/* <ImageCarousel images={images} width={'100%'} imageHeight={300} uri /> */}
        <ImageCarousel images={images} width={width - 20} imageHeight={300} uri />
        {/* <ImageCarousel images={item.images.map((img: any) => img.url)} width={width - 20} imageHeight={300} uri /> */}
        <View style={styles.cardContent}>
          <View style={styles.priceContainer}>
            <ThemedText type="defaultSemiBold" style={styles.priceText}>
              ${item.price || 100}
            </ThemedText>
            <View style={styles.iconContainer}>
              <Entypo 
                onPress={() => handleFavoritePress(item.id)}
                name={favorites[item.id] ? 'heart' : 'heart-outlined'}
                color={favorites[item.id]? theme.colors.primary : theme.colors.text}
                size={28} />
              <Entypo onPress={() => handleSharePress(item)} name="share-alternative" color={theme.colors.text} size={24} />
            </View>
          </View>
          <ThemedText style={styles.detailsText}>2 beds 3 bathrooms 1323 sq ft.</ThemedText>
          <ThemedText style={styles.descriptionText}>Lorem ipsum dolor sit amet consectetur</ThemedText>
          {/* <ThemedText style={styles.detailsText}>
            {item.address?.city}, {item.address?.country}
          </ThemedText>
          <ThemedText style={styles.descriptionText}>{item.description || 'No description available'}</ThemedText> */}
        </View>
      </Card>
    ),
    [theme.colors.text, width, favorites]
  );

  const renderFooter = useCallback(() => {
    if (!hasNextPage) return null;
    return (
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.text} />
        ) : (
          <Pressable  style={styles.loadMoreButton}>
            <ThemedText type="defaultSemiBold">Load More</ThemedText>
          </Pressable>
        )}
      </View>
    );
  }, [hasNextPage, loading]);

  console.log('data', data)
 
  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={isRefreshing} />}
    >
      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderPropertyItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.flatListContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={() => (
            // <ActivityIndicator style={{ flex: 1, height: height / 2 }} size="large" color={theme.colors.text} animating={loading} />
            <View style={{gap: 10}}>
              {[0,1,2,3,4,5].map((item, index) => (
                <Skeleton key={index} colorMode={theme.mode!} transition={{type: 'no-animation',}} width={'100%'} height={300}  />
              ))}
            </View>
          )}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && loadMore()}
          onEndReachedThreshold={0.5}
          getItemLayout={(data, index) => ({
            length: 400,
            offset: 400 * index,
            index,
          })}
        />
      </View>
      <View style={{ paddingBottom: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10 },
  flatListContent: { paddingTop: 20, paddingBottom: 30 },
  separator: { height: 10 },
  propertyCard: { width: '100%', height: 400, paddingHorizontal: 0, paddingTop: 0, borderRadius: 12 },
  cardContent: { padding: 10, paddingRight: 20 },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 19 },
  iconContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconButton: { padding: 5 },
  iconLoading: { position: 'absolute', right: -20 },
  detailsText: { fontSize: 15 },
  descriptionText: { fontSize: 15, fontFamily: 'ROBOTO' },
  footer: { padding: 20, alignItems: 'center' },
  loadMoreButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});

const sstyles = StyleSheet.create({
  container: { paddingHorizontal: 10 },
  flatListContent: { paddingTop: 20, paddingBottom: 30 },
  separator: { height: 10 },
  propertyCard: { width: '100%', height: 400, paddingHorizontal: 0, paddingTop: 0, borderRadius: 12 },
  cardContent: { padding: 10, paddingRight: 20 },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 19 },
  iconContainer: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
  detailsText: { fontSize: 15 },
  descriptionText: { fontSize: 15, fontFamily: 'ROBOTO' },
  footer: { padding: 20, alignItems: 'center' },
  loadMoreButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
});

export default HomesTab;

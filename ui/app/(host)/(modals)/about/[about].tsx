import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('screen');
const CARD_PADDING = 16;
const IMAGE_SIZE = 100;

export default function NModal() {
    const navigation = useNavigation()
    const {theme} = useTheme()
    // const pa: any = useLocalSearchParams()
    
    const about = [
        {
            id: 1,
            title: '',
            text: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates corporis aliquid doloribus, excepturi temporibus optio a autem doloremque commodi blanditiis eveniet neque, laudantium sint animi dicta dolores quaerat ea nam eius at architecto natus unde. Molestiae nulla voluptatem placeat quia?`,
        },
        {
            id: 2,
            title: 'The space',
            text: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates corporis aliquid doloribus, excepturi temporibus optio a autem doloremque commodi blanditiis eveniet neque, laudantium sint animi dicta dolores quaerat ea nam eius at architecto natus unde. Molestiae nulla voluptatem placeat quia?`,
        },
        {
            id: 3,
            title: 'Guest access',
            text: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates corporis aliquid doloribus, excepturi temporibus optio a autem doloremque commodi blanditiis eveniet neque, laudantium sint animi dicta dolores quaerat ea nam eius at architecto natus unde. Molestiae nulla voluptatem placeat quia?`,
        },
        {
            id: 4,
            title: 'Other things to note',
            text: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates corporis aliquid doloribus, excepturi temporibus optio a autem doloremque commodi blanditiis eveniet neque, laudantium sint animi dicta dolores quaerat ea nam eius at architecto natus unde. Molestiae nulla voluptatem placeat quia?`,
        },
    ]

    return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]} contentContainerStyle={{ paddingBottom: 20 }}>
       {/* Header Card */}
       <View style={{gap: 4, marginTop: 20}}>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Entypo name='cross' size={24} color={theme.colors.text} />
        </View>
        <ThemedText style={{fontWeight: '700', fontSize: 24, marginTop: 20 }}>
            About this space
        </ThemedText>
       </View>
        <FlatList 
            data={about}
            renderItem={({item}) => (
              <View>
                  <ThemedText type='defaultSemiBold'> {item.title} </ThemedText>
                  <ThemedText > {item.text} </ThemedText>
              </View>
            )}
            ItemSeparatorComponent={() => (
                <View style={{height: 10}} />
            )}
            scrollEnabled={false}
          />   
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20},
  card: { 
    margin: CARD_PADDING, 
    borderRadius: 12, padding: CARD_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    marginTop: 30,
    paddingLeft: 60,
    shadowRadius: 4,
    elevation: 5
  },
  avatar: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 },
  headerInfo: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: 'bold' },
  sub: { fontSize: 14, color: '#666' },
  stats: { flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 },
  statItem: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  section: { marginVertical: 8, marginHorizontal: CARD_PADDING },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoText: { marginLeft: 8, fontSize: 14, flex: 1 },
  footerText: { fontStyle: 'italic', marginTop: 8, color: '#444' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  reviewCard: { 
    width: width * 0.896, padding: 12, marginRight: 12, 
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'gray',
    height: 200
    // borderRightWidth: 2
  },
  reviewAvatar: { width: 60, height: 60, borderRadius: 20 },
  reviewName: { fontWeight: 'bold', marginTop: 8 },
  reviewLoc: { fontSize: 12, color: '#666' },
  reviewText: { marginTop: 4, fontSize: 14 },
  reviewMeta: { marginTop: 4, fontSize: 12, color: 'black' },
  link: { marginTop: 8, textDecorationLine: 'underline', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 3, marginTop: 10 },
  gridItem: { width: (width - CARD_PADDING *2) / 2 - 8, alignItems: 'center', marginBottom: 12, flexDirection: 'row'},
  gridText: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  listingCard: { width: width * 0.4, marginRight: 12, marginTop: 12},
  listingImage: { width: '100%', height: 180, borderRadius: 8 },
  listingTitle: { fontWeight: 'bold', marginTop: 8 },
  listingSub: { fontSize: 12, color: '#666' },
  listingMeta: { fontSize: 12, color: '#666', marginTop: 4 },
});

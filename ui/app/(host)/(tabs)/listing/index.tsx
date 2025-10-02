import { Dimensions, FlatList, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Dropdown from '@/components/ui/DropDownMenu';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSession } from '@/context/ctx';
import { useTheme } from '@/theme/theme';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';

const {width} = Dimensions.get('screen')
const data = [
  {
    title: 'USA',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'France',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Germany',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Italy',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Rome',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  
];


export default function Listings() {
  const {theme} = useTheme()
  const {signOut: removeSesssion} = useSession()
  const perform = async() => {
    // try {
    //   signOut()
    //   removeSesssion()
    // } catch (error:any) {
    //   Alert.alert('Error', error.message)
    // }
  }
  
  return(
    <ThemedView plain secondary style={{paddingHorizontal: 20, paddingTop: 32}} >
      <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 20, gap: 5, }}>
        <ThemedText type='title' >Listings</ThemedText>
        {/* <Pressable onPress={perform} style={{padding: 5, borderRadius: 5, borderColor: theme.colors.border, borderWidth: 2, flexDirection: 'row', gap: 4 }}>
          <MaterialCommunityIcons name='chevron-double-down' size={24} color={theme.colors.text} />
          <ThemedText > {'homes'} </ThemedText>
        </Pressable> */}
        <Dropdown options={['Listings', 'Homes', 'Events', 'Services']} defaultValue='Listings' />
      </View>
      <FlatList 
                  data={data}
                  // scrollEnabled={false}
                  renderItem={({item}) => (
                    <Link href={{
                      pathname: '/(host)/(tabs)/home/[listing]',
                      // pathname: '/(host)/(auth)/auth_form',
                      params: {listing: item.title}
                    }} style={{width: '100%', }}>
                    <View style={{gap: 10, width: '100%', }}>
                      <View style={{position: 'relative', alignItems: 'center'}}>
                        <Image
                          source={require('@/assets/images/image.png')}
                          // borderRadius={20}
                          style={{width: '100%', height: 270, borderRadius: 20}}
                          contentFit='cover'
                        />
                        <View style={{position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between'}}>
                          <ThemedText style={{padding: 10, borderRadius: 20, backgroundColor: 'white', color: 'black', fontSize:10, fontWeight: 'bold'}}>
                            Guest Favourite
                          </ThemedText>
                          <IconSymbol name='heart' style={{fontWeight: 'bold'}} size={30} color='white' />
                        </View>
                      </View>
                      {/* <View style={}> */}
                        <ThemedText type='subtitle' >
                          Your house was listed on 20 June 2025 
                        </ThemedText>
                        <ThemedText secondary>Home in novi MI</ThemedText>
                      {/* </View> */}
                    </View>
                    </Link>
                  )}
                  contentContainerStyle={{marginTop: 10, paddingBottom: 190}}
                  ItemSeparatorComponent={() => (
                    <View style={{height: 20}}></View>
                  )}
                  ListHeaderComponent={() => (
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                      <View style={{flex: 1, justifyContent: 'flex-end', gap: 10, flexDirection: 'row',}}>
                        <Pressable style={{backgroundColor: theme.colors.text, padding:10, borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                          <Entypo name='magnifying-glass' size={24} color={theme.colors.background} />
                        </Pressable>
                        <Pressable style={{backgroundColor: theme.colors.text, padding:10, borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                          {true ? <Entypo name='grid' size={24} color={theme.colors.background} /> : <Entypo name='list' size={24} color={theme.colors.background} />}
                        </Pressable>
                        <Pressable onPress={() => router.push('/listing/start')} style={{backgroundColor: theme.colors.text, padding:10, borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                          <MaterialCommunityIcons name='plus' size={24} color={theme.colors.background} />
                        </Pressable>
                      </View> 
                    </View>
               )}
                  showsVerticalScrollIndicator={false}
                />
    </ThemedView >
  )
}


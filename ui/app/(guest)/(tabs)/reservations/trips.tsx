import { useTheme } from '@/theme/theme';
// import { Image } from 'expo-image';
import DraggableModal from '@/components/DraggableModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ItemCard from '@/components/ui/ItemCard';
import { Line } from '@/components/ui/Line';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Upcoming() {
  const { theme } = useTheme();
  const { width, height } = Dimensions.get('screen');
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height
  const [isModalVisible, setModalVisible] = useState(false)
  const [type, setType] = useState<'properties' | 'experiences' | 'all'>('all');
  const [showRecent, setShowRecent] = useState(false);
  const [sort, setSort] = useState('')

  const reset = () => {
        setType('all')
        setSort('')
    }

  return (
    <ThemedView style={{paddingTop: 60}}>
        <View style={{paddingBottom: 10, paddingHorizontal:20, justifyContent: 'space-between', flexDirection: 'row', }}>
            <View>
                <Text style={{fontSize: 26, fontWeight: 'bold', color: theme.colors.text}} >Trips</Text>
            </View>
            <View style={{flexDirection: 'row', gap:8, alignItems:'center'}}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{backgroundColor: theme.colors.background2, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <Ionicons name='options-outline' size={24} color={theme.colors.text} />
                    <DraggableModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} height={height * 0.7}>
                        <View style={{flex: 1, gap: 10, padding: 20}} >
                            <ThemedText type='title'> Type</ThemedText>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
                                <Pressable style={{borderWidth: 1, borderColor: type == 'properties'? theme.colors.accent : theme.colors.border, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center',gap: 5}}
                                  onPress={() => {
                                    if(type == 'properties') {
                                        setType('all')
                                    } else setType('properties')
                                  }}
                                >
                                    <FontAwesome5 name='home' size={24} color={true ? theme.colors.primary : theme.colors.text} />
                                    <ThemedText>Properties</ThemedText>
                                </Pressable>
                                <Pressable style={{borderWidth: 1, borderColor: type == 'experiences'? theme.colors.accent : theme.colors.border, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center',gap: 5}}
                                  onPress={() => {
                                    if(type == 'experiences') {
                                        setType('all')
                                    } else setType('experiences')
                                  }}
                                >
                                    <FontAwesome5 name='star' size={24} color={true ? theme.colors.primary : theme.colors.text} />
                                    <ThemedText>Experiences</ThemedText>
                                </Pressable>
                            </View>

                            <View style={[{width: 150, backgroundColor: theme.mode == 'light' ? theme.colors.border: theme.colors.background2, borderRadius: 7}]} >
                                <Pressable onPress={() => setShowRecent(!showRecent)} style={{backgroundColor: showRecent ? theme.colors.backgroundSec: 'transparent', margin: 2, padding: 8, borderRadius: 7}}>
                                    <ThemedText type='defaultSemiBold' style={{fontSize: 17}}> Show Recent</ThemedText>
                                </Pressable>
                            </View>
                            <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border, marginVertical: 10}} />
                            <View>
                                <ThemedText type='title'> Sort</ThemedText>
                                {['Recent', 'Oldest', 'nom', 'Price (min)', 'Price (max)'].map((item, index) => (
                                    <TouchableOpacity onPress={() => setSort(item)} key={index} style={{borderBottomWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10,}}>
                                        <ThemedText type='defaultSemiBold'> {item === 'nom'? 'Newest on market': item} </ThemedText>
                                        {sort == item && <Ionicons name='checkmark' color={theme.colors.text} size={20} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity style={{position: 'absolute', top:15, right: 15,}} onPress={reset}>
                            <Ionicons name='refresh-outline' color={theme.colors.text} style={{fontWeight: '900', fontSize: 30}} />
                        </TouchableOpacity>
                    </DraggableModal>
                    {/* <ThemedText style={{position: 'absolute', color: theme.colors.accent, fontWeight: '900', top:0, right: 5}} >1</ThemedText> */}
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: theme.colors.background2, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <MaterialCommunityIcons name='bell-badge' size={24} color={theme.colors.text} />
                </TouchableOpacity>
                
            </View>
        </View>
        <FlatList 
            data={[1,2,3,4]}
            renderItem={({item}) => (<ItemCard property={item} />)}
            keyExtractor={(item) => item.toString()}
            // ItemSeparatorComponent={() => (
            //   <View style={{height: 20,}}></View>
            // )}
            contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 10}}
            showsVerticalScrollIndicator={false}
        />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    tabItem2: {padding: 5, flex:1, justifyContent: 'center', alignItems: 'center', borderRadius: 7},
})
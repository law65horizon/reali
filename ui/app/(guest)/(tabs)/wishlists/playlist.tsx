import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Line } from '@/components/ui/Line';
import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const data = [
    {
        title: 'All favourites',
    },
    {
        title: 'My Saved Homes',
    },
    {
        title: 'My Saved Experiences',
    },
]

const data2 = [
    {
        title: 'Jenn',
        
    },
    {
        title: 'Misissipi',
    },
    
]

const {width} = Dimensions.get('screen')

const Playlist = () => {
    const {theme} = useTheme()
    const [editing, setIsEditing] = useState(false) 
    const [selected, setSelected] = useState<string[]>([])
    return (
        <ThemedView secondary style={styles.container}>
            <TouchableOpacity onPress={() => setIsEditing(!editing)} style={[styles.editButton, {backgroundColor: theme.mode == 'light'? theme.colors.border: theme.colors.background2}]}>
                <ThemedText type='subtitle'> {editing ? 'Done' : 'Edit'} </ThemedText>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText style={{marginBottom:10}} type='title'>WishLists</ThemedText>
                {data.map((item, index) => (
                    <View key={index} style={{flexDirection: 'row', gap: 10, alignItems:'center', marginVertical: 8}}>
                        <Image source={require('@/assets/images/image.png')} style={{width: 130, height: 70, borderRadius: 8}} />
                        <ThemedText type='defaultSemiBold' style={{fontSize: 18}}> {item.title} </ThemedText>
                    </View>
                ))}

                <Line orientation='horizontal' style={{marginVertical: 10}} />

                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <ThemedText type='subtitle'>Lists</ThemedText>
                    <MaterialCommunityIcons name='plus' color={theme.colors.accent} style={{fontWeight: '900'}} size={28} />
                </View>
                <FlatList 
                  data={data2}
                  renderItem={({item}) => (
                    <View style={{flexDirection: 'row', gap: 10, alignItems:'center', marginVertical: 8}}>
                        <Image source={require('@/assets/images/image.png')} style={{width: 130, height: 70, borderRadius: 8}} />
                        <ThemedText type='defaultSemiBold' style={{fontSize: 18}}> {item.title} </ThemedText>
                        {editing && (
                           <>
                            {!selected.includes(item.title) ? 
                                <MaterialCommunityIcons name='circle-outline' style={[styles.selectButton, ]} color={theme.colors.text} size={24} />
                               : <MaterialCommunityIcons name='circle' style={[styles.selectButton, {borderColor: theme.colors.text, borderWidth:1, borderRadius: '50%'}]} color={theme.colors.accent} size={20} />
                            }
                           </> 
                        )}
                    </View>
                  )}
                  contentContainerStyle={{paddingBottom: 140}}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
            </ScrollView>

            {selected && editing &&<View style={[styles.deleteButton, { backgroundColor: theme.colors.background2}]}>
                <ThemedText type='subtitle'>Delete</ThemedText>
                <TouchableOpacity>
                    <MaterialCommunityIcons name='trash-can-outline' size={26} color={theme.colors.text} />
                </TouchableOpacity>
            </View>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 22,
    },
    editButton: {
        alignSelf: 'flex-end', paddingHorizontal: 16,paddingVertical: 10, borderRadius: 20, marginTop: 10,
    },
    selectButton: {position: 'absolute', right: 0, top: 0,},
    deleteButton: {position: 'absolute', paddingHorizontal: 20, paddingTop: 10, marginBottom: 5, bottom: 20, height: 100, left:0, width, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, zIndex: 2 }
})

export default Playlist;

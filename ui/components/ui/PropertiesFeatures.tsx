import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedText } from '../ThemedText';


interface PropertiesFeatures {
    pid: string;
    isVisible:  boolean;
    setModalVisible: (param: boolean) => void;
}

const mockData = [
    {
        id: 'Interior',
        data: [
            {
                id: 'Bedrooms & bathrooms',
                data: ['Bedrooms: 5', 'Bathrooms: 5']
            },
            {
                id: 'Kithcen',
                data: ['Features: Breakfask Bar, Pantry']
            },
            {
                id: 'Heating',
                data: ['See remarks']
            }
        ]
    },
    
    {
        id: 'Property',
        data: [
            {
                id: 'Parking',
                data: ['Total spaces: 12', 'Parking features: Crushed Stone, Attached Garage, Detached Garage, Finished Garage, Underground Oversize', 'Attached garage spaces: 12']
            },
            {
                id: 'Features',
                data: ['Patio & porch: Deck, Patio', 'Private pool: yes', 'Pool features: Gunite, In Ground']
            }
        ]
    },
    
    {
        id: 'Property',
        data: [
            {
                id: 'Parking',
                data: ['Total spaces: 12', 'Parking features: Crushed Stone, Attached Garage, Detached Garage, Finished Garage, Underground Oversize', 'Attached garage spaces: 12']
            },
            {
                id: 'Features',
                data: ['Patio & porch: Deck, Patio', 'Private pool: yes', 'Pool features: Gunite, In Ground']
            }
        ]
    },

    {
        id: 'Property',
        data: [
            {
                id: 'Parking',
                data: ['Total spaces: 12', 'Parking features: Crushed Stone, Attached Garage, Detached Garage, Finished Garage, Underground Oversize', 'Attached garage spaces: 12']
            },
            {
                id: 'Features',
                data: ['Patio & porch: Deck, Patio', 'Private pool: yes', 'Pool features: Gunite, In Ground']
            }
        ]
    },
]

const PropertiesFeatures = ({ pid, isVisible,  setModalVisible }: PropertiesFeatures) => {
    const {theme} = useTheme()
    return (
        <Modal isVisible={isVisible} style={{margin:0, backgroundColor: theme.colors.background, paddingTop: 55}} animationIn={'slideInRight'} animationOut={'slideOutRight'}>
            <View style={{paddingLeft: 16, paddingBottom: 10, borderBottomWidth:1, borderColor: theme.colors.border}}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name='arrow-back' size={30} />
                </TouchableOpacity>
            </View>
            <ScrollView style={{paddingHorizontal: 16, paddingTop: 10}}>
                {/* <ThemedText type='title'>Features</ThemedText> */}

                <View style={{gap: 10}}>
                    {mockData.map((item, index) => (
                        <View key={index} style={{gap: 10, borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 10, }}>
                            <ThemedText style={{paddingBottom: 0}} type='subtitle'>{item.id} </ThemedText>
                            {item.data.map((subItem, index) => (
                                <View key={index} style={{gap: 10}}>
                                    <ThemedText type='defaultSemiBold' style={{fontSize: 17}}>{subItem.id}</ThemedText>
                                    {subItem.data.map((item, index) => (
                                        <View key={index} style={{paddingLeft: 10, flexDirection:'row', alignItems: 'baseline', gap: 5, }}>
                                            <View style={{width: 5, height: 5, borderRadius: '50%', backgroundColor: theme.colors.text}} />
                                            <ThemedText type='defaultSemiBold' style={{flex:1, flexWrap: 'wrap', fontSize: 16, lineHeight: 20}}>{item}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    icon: {
    padding: 6,
    borderRadius: 50,
  },
})

export default PropertiesFeatures;

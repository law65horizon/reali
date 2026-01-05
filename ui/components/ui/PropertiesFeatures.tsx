import { amenities } from '@/constants/featureIcons';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedText } from '../ThemedText';

// Define the type for an individual amenity
interface Amenity {
  id: string;
  label: string;
  icon: string;
  library: any;
  section: string;
}

interface AmenitiesModalProps {
    isVisible: boolean,
    onClose: () => void
}

const rawData = [
    { section: "Bathroom", amenities: ["Shower", "Toilet", "Bathtub", "Sink", "Mirror"] },
    { section: "Bedroom", amenities: ["Bed", "Wardrobe", "Nightstand", "Desk", "Lamp"] },
    { section: "Kitchen", amenities: ["Fridge", "Microwave", "Oven", "Dishwasher", "Coffee Maker"] },
    { section: "Entertainment", amenities: ["TV", "Speaker", "Game Console"] },
    { section: "Safety", amenities: ["Smoke Detector", "Fire Extinguisher", "First Aid Kit", "Security System", "CCTV"] },
    { section: "Connectivity", amenities: ["WiFi", "Ethernet"] },
    { section: "Laundry", amenities: ["Washing Machine", "Dryer"] },
    { section: "Comfort", amenities: ["Air Conditioning", "Heater", "Balcony"] },
    { section: "Pets", amenities: ["Pet Friendly"] },
    { section: "Parking & Transportation", amenities: ["Parking", "Elevator"] }
  ];

// Sample predefined amenities list (this would be your larger static list of amenities)
const amenitiesList = [
  { label: 'Shower', icon: 'ios-shower', library: Ionicons },
  { label: 'Toilet', icon: 'ios-close-circle', library: Ionicons },
  { label: 'Bathtub', icon: 'ios-bath', library: Ionicons },
  { label: 'Sink', icon: 'ios-water', library: Ionicons },
  { label: 'Mirror', icon: 'ios-eye', library: Ionicons },
  { label: 'Bed', icon: 'md-bed', library: Ionicons },
  { label: 'Wardrobe', icon: 'md-shirt', library: Ionicons },
  { label: 'Nightstand', icon: 'md-bed', library: Ionicons },
  { label: 'Desk', icon: 'md-desktop', library: Ionicons },
  { label: 'Lamp', icon: 'md-lamp', library: Ionicons },
  { label: 'Fridge', icon: 'md-ice-cream', library: Ionicons },
  { label: 'Microwave', icon: 'md-microwave', library: Ionicons },
  { label: 'Oven', icon: 'md-oven', library: Ionicons },
  { label: 'Dishwasher', icon: 'md-wash', library: Ionicons },
  { label: 'Coffee Maker', icon: 'md-cup', library: Ionicons },
  { label: 'TV', icon: 'md-tv', library: Ionicons },
  { label: 'Speaker', icon: 'md-headset', library: Ionicons },
  { label: 'Game Console', icon: 'md-game-controller', library: Ionicons },
  { label: 'Smoke Detector', icon: 'ios-alert', library: Ionicons },
  { label: 'Fire Extinguisher', icon: 'ios-flame', library: Ionicons },
  { label: 'First Aid Kit', icon: 'md-medkit', library: Ionicons },
  { label: 'Security System', icon: 'md-lock', library: Ionicons },
  { label: 'CCTV', icon: 'ios-videocam', library: Ionicons },
  { label: 'WiFi', icon: 'md-wifi', library: Ionicons },
  { label: 'Ethernet', icon: 'md-cable', library: Ionicons },
  { label: 'Washing Machine', icon: 'ios-wash', library: Ionicons },
  { label: 'Dryer', icon: 'ios-thermometer', library: Ionicons },
  { label: 'Air Conditioning', icon: 'md-snow', library: Ionicons },
  { label: 'Heater', icon: 'md-thermometer', library: Ionicons },
  { label: 'Balcony', icon: 'md-airplane', library: Ionicons },
  { label: 'Parking', icon: 'md-car', library: Ionicons },
  { label: 'Elevator', icon: 'md-arrow-up', library: Ionicons },
  { label: 'Pet Friendly', icon: 'md-paw', library: Ionicons }
];

const AmenitiesModal = ({isVisible, onClose}: AmenitiesModalProps) => {
  const [amenitiesData, setAmenitiesData] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const {theme: {colors}} = useTheme()

  
  const findIcon = (label:string) => {
    const match = amenities.find(item => item.label == label)

    if (match) {
        const {library: IconLibrary, icon, label} = match
        return <View style={{paddingVertical: 20, flexDirection: 'row', gap: 10, alignItems:'center', borderBottomWidth: 1, borderColor: colors.border}}>
            <IconLibrary name={icon} size={26}/>
            <ThemedText >{label}</ThemedText>
        </View>
    }
}
  console.log(amenitiesData[0])

  // Render Item for FlatList
  const renderItem = ({ item }: { item: Amenity }) => {
    const { label, icon, library: IconLibrary, section } = item;

    return (
      <View style={styles.itemContainer}>
      </View>
    );
  };

  return (
    <Modal 
      isVisible={isVisible} 
      
      style={{margin:0, backgroundColor: colors.background, paddingTop: 60}} 
      animationIn={'slideInRight'} animationOut={'slideOutRight'} 
    >
      <View style={{ paddingLeft: 20, paddingBottom: 10, borderBottomWidth: 1, borderColor: colors.border}}>
        <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      
      </View>
      <FlatList 
        data={rawData}
        renderItem={({item}) => (
            <View>
                <ThemedText style={{fontWeight: 600, fontSize: 18}}>{item.section}</ThemedText>
                {item.amenities.map((item, index) => (
                    <View key={index} >
                        {findIcon(item)}
                    </View>
                ))}
            </View>
        ) }
        ListHeaderComponent={() => (
            <ThemedText style={{fontSize: 24, paddingVertical: 10, fontWeight: 700}}>Amenities</ThemedText>
        )}

        contentContainerStyle={{paddingHorizontal: 20, gap: 20, paddingBottom: 30}}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {},
    itemContainer: {}
})

export default AmenitiesModal

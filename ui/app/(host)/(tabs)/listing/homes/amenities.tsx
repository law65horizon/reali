import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useHomeStore } from '@/store/homeStore';
import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { EventRegister } from "react-native-event-listeners";

const { width, height } = Dimensions.get('screen');

const Amenities = () => {
  const { theme } = useTheme();
  const { setField, amenities } = useHomeStore();
  const [selections, setSelections] = useState<string[]>(amenities);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  

  const residenciesIcons = [
    { id: 1, icon: () => <MaterialCommunityIcons name="fridge" color={theme.colors.text} size={50} />, name: 'Kitchen' },
    { id: 2, icon: () => <MaterialCommunityIcons name="wifi" color={theme.colors.text} size={50} />, name: 'WiFi' },
    // ... other icons
  ];

  useEffect(() => {
      const unsubscribe: any = EventRegister.addEventListener('SAVE_ERROR', data => {
        setIsLoading(false)
      } )
  
      return () => {
        EventRegister.removeEventListener(unsubscribe)
      };
    }, []);

  const handleInputChange = (value: string) => {
    let newSelections: string[];
    if (!selections.includes(value)) {
      newSelections = [...selections, value];
    } else {
      newSelections = selections.filter((item) => item !== value);
    }
    setSelections(newSelections);
    setField('amenities', newSelections); // Sync with formStore immediately
  };

  const handleSave = () => {
    setIsLoading(true)
    EventRegister.emit('SAVE_PROJECT', selections)
  };
  const handle_navigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setField('amenities', selections); // Ensure amenities are saved
      handleSave();
      // router.push('/listing');
    } else {
      router.push('/listing/homes/title_description');
    }
  };

  return (
    <ThemedView plain secondary style={{ width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22 }}>
      <FlatList
        data={residenciesIcons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.shadow,
              {
                width: width / 2 - 30,
                height: 100,
                backgroundColor: theme.colors.background2,
                justifyContent: 'center',
                paddingLeft: 10,
                borderRadius: 5,
                marginRight: 15,
                borderWidth: selections.includes(item.name) ? 2.5 : 1,
                borderColor: selections.includes(item.name) ? theme.colors.text : 'gray',
              },
            ]}
          >
            <Pressable onPress={() => handleInputChange(item.name)} style={{ width: '100%' }}>
              {item.icon()}
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ gap: 15, marginBottom: 150, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        ListFooterComponent={() => <View style={{ height: 150 }} />}
        ListHeaderComponent={() => <ThemedText type="subtitle">Tell guests why your place stands out</ThemedText>}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
      />
      <PreviousNextUI
        style={{ position: 'absolute', width, bottom: 100, zIndex: 1 }}
        prevFunc={() => handle_navigation('prev')}
        nextFunc={() => handle_navigation('next')}
        nextLabel="Publish"
        nextLoading={isLoading}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderWidth: 1,
  },
});

export default Amenities;
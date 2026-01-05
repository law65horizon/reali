import { ThemedView } from '@/components/ThemedView';
import InputField from '@/components/ui/InputField';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const categories = ['Tour', 'Workshop', 'Class', 'Adventure', 'Other'];

const {width } = Dimensions.get('screen')

const ExperienceBasicsScreen = () => {
  const { theme } = useTheme();
  const { setField, title, category, briefBio } = useExperienceStore();
  const [localTitle, setLocalTitle] = useState(title || '');
  const [localCategory, setLocalCategory] = useState(category || '');
  const [localBio, setLocalBio] = useState(briefBio || '');

  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('EXPE_SAVE', data => {
      console.log('isojswio')
      save_state()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, [localBio, localTitle]);

  const save_state = () => {
    setField('title', localTitle);
    // console.log('SAVING BIO:', localBio);
    if (localBio === briefBio) return;
    setField('briefBio', localBio);
  }

  const handleNavigation = (dir: 'next' | 'prev') => {
    save_state()
    router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/location' : '/listing/experiences');
  };

  return (
    <ThemedView plain secondary style={styles.container}>
      {/* <TouchableOpacity style={styles.tipButton}>
        <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.text} />
      </TouchableOpacity> */}

      <InputField title='Title' 
        value={localTitle} placeholder='e.g., Sunset Photography Walk' 
        handleChangeText={setLocalTitle} 
        inputStyle={[styles.input, {backgroundColor: theme.colors.background, color: theme.colors.text}]}
        titleStyle={{marginVertical: 5}}
        showTitle
      />

      <InputField title='Brief Bio (About the Experience)' 
        value={localBio} placeholder='Describe what makes this experience unique...' 
        handleChangeText={setLocalBio} 
        inputStyle={[styles.textarea, {backgroundColor: theme.colors.background, color: theme.colors.text}]} multiline numberOfLines={5}
        titleStyle={{marginVertical: 5}}
        showTitle
     />

      {/* <InputFieldx /> */}

      <PreviousNextUI
        style={styles.navigation}
        // prevFunc={() => handleNavigation('prev')}
        disabled={!localTitle || !localBio}
        nextFunc={() => handleNavigation('next')}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 10 },
  header: { marginBottom: 12 },
  tipButton: { alignItems: 'flex-end', marginRight: 10 },
  input: { height: 40, borderRadius: 8, paddingHorizontal: 12, marginBottom:10 },
  picker: { height: 40, borderRadius: 8 },
  textarea: { height: 120, borderRadius: 8, paddingHorizontal: 12, textAlignVertical: 'top' },
  navigation: { position: 'absolute', width, bottom: 0, zIndex: 1 },
});

export default ExperienceBasicsScreen;
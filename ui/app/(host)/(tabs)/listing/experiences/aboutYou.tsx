import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

const data = [
  {
    tag: 'yoe',
    title: 'years of experience',
    placeholder: 'e.g., %',
  },
  {
    tag: 'pt',
    title: 'professional title',
    placeholder: 'e.g., Certified Photography Guide',
  },
  {
    tag: 'eo',
    title: 'Experience Overview',
    placeholder: 'Give a concise summary of what guests will do...',
  },
  {
    tag: 'add',
    title: 'Host Details',
    placeholder: 'Category-Specific Host Details',
  },
];

interface QA {
  question: string;
  answer: string;
  baseQA?: boolean;
}

const AboutExperienceAndHostScreen = () => {
  const { theme } = useTheme();
  const { setField, yearsOfExperience, professionalTitle, experienceOverview } = useExperienceStore();
  const [localYears, setLocalYears] = useState(yearsOfExperience || '12');
  const [localTitle, setLocalTitle] = useState(professionalTitle || '');
  const [localOverview, setLocalOverview] = useState(experienceOverview || '');
  const [localQA, setLocalQA] = useState<QA[]>([
    {
      question: 'Certifications',
      answer: '',
      baseQA: true,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('ABOU_SAVE', data => {
      console.log('isojswio')
      save_state()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, [ localTitle, localYears, localOverview, localQA]);

  const save_state = () => {
    setField('professionalTitle', localTitle);
    setField('yearsOfExperience', localYears);
    // console.log('SAVING BIO:', localBio);
    if (localOverview === experienceOverview) return;
    setField('experienceOverview', localOverview);
    // setField('hostDetails', localQA);
  }

  const handleNavigation = (dir: 'next' | 'prev') => {
    setField('yearsOfExperience', localYears);
    setField('professionalTitle', localTitle);
    setField('experienceOverview', localOverview);
    router.push(
      dir === 'next'
        ? '/(host)/(tabs)/listing/experiences/upload_media'
        : '/(host)/(tabs)/listing/experiences/location'
    );
  };

//   const onChangeDate = (event: any, date?: Date) => {
//   setShowPicker(null);
//   if (!date) return;

//   setEventDays((prev) => {
//     return prev.map((day) => {
//       // Update only the event day that matches the focused ID
//       if (focused === `d-${day.id}` && pickerMode === 'singleDate') {
//         return { ...day, startDate: date };
//       }
//       if (focused === `t-${day.id}` && pickerMode === 'startTime') {
//         return { ...day, startTime: date };
//       }
//       if (focused === `t-${day.id}` && pickerMode === 'endTime') {
//         return { ...day, endTime: date };
//       }
//       return day;
//     });
//   });
// };

  const getValue = (tag: string) => {
    switch (tag) {
      case 'yoe':
        return localYears;
      case 'pt':
        return localTitle;
      case 'eo':
        return localOverview;
      default:
        return null;
    }
  };

  // Handler for updating the question in a QA pair
  const handleQuestionChange = (text: string, index: number) => {
    setLocalQA((prev) =>
      prev.map((qa, i) =>
        i === index ? { ...qa, question: text } : qa
      )
    );
  };

  // Handler for updating the answer in a QA pair
  const handleAnswerChange = (text: string, index: number) => {
    setLocalQA((prev) =>
      prev.map((qa, i) =>
        i === index ? { ...qa, answer: text } : qa
      )
    );
  };

  // Handler for adding a new empty QA pair
  const handleAddQA = () => {
    setLocalQA((prev) => [
      ...prev,
      { question: '', answer: '', baseQA: false },
    ]);
  };

  // Handler for deleting a QA pair
  const handleDeleteQA = (index: number) => {
    setLocalQA((prev) => prev.filter((qa, i) => i !== index || qa.baseQA));
  };

  return (
    <ThemedView plain style={styles.container}>
      <TouchableOpacity style={styles.tipButton}>
        <MaterialCommunityIcons name="information-variant" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: 'flex-end', gap: 10, paddingBottom: 100 }}>
        {data.map((item, index) => (
          <Card
            onPress={() => {
              setIsModalOpen(true);
              setModalState(item.tag);
            }}
            key={index}
            style={{
              padding: 10,
              flexDirection: 'row',
              gap: 0,
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderRadius: 12,
              backgroundColor: theme.colors.background2,
              opacity: 0.9,
            }}
          >
            <View style={{ padding: 0, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="plus" size={40} color={theme.colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ textTransform: 'capitalize' }}>{item.title}</ThemedText>
              <ThemedText secondary style={{ fontSize: 14 }}>
                {getValue(item.tag) || item.placeholder}
              </ThemedText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text} />
          </Card>
        ))}
      </View>

      <Modal visible={isModalOpen} animationType="slide">
        <SafeAreaView style={{ backgroundColor: theme.colors.background, paddingHorizontal: 10, height }}>
          <Pressable onPress={() => setIsModalOpen(false)} style={{ alignItems: 'flex-end', paddingRight: 10 }}>
            <Entypo name="cross" color={theme.colors.text} size={24} />
          </Pressable>

          <View style={{ flex: 1 }}>
            {modalState === 'yoe' && (
              <View style={{ alignItems: 'center', height: '100%' }}>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', height: '100%' }}>
                  <Pressable
                    onPress={() => {
                      let eiwo = parseInt(localYears) - 1;
                      setLocalYears(eiwo.toString());
                    }}
                  >
                    <MaterialCommunityIcons name="minus" size={40} color={theme.colors.textSecondary} />
                  </Pressable>
                  <TextInput
                    value={localYears.toString()}
                    keyboardType="numeric"
                    onChangeText={setLocalYears}
                    style={{ fontSize: 40, fontWeight: 'bold', color: theme.colors.text }}
                  />
                  <Pressable
                    onPress={() => {
                      let eiwo = parseInt(localYears) + 1;
                      setLocalYears(eiwo.toString());
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={40} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>
              </View>
            )}

            {modalState === 'pt' && (
              <View style={{ paddingHorizontal: 25, justifyContent: 'center', alignItems: 'center', flex: 1, paddingBottom: 160 }}>
                <TextInput
                  value={localTitle}
                  onChangeText={setLocalTitle}
                  style={{ height: 'auto', fontSize: 30, color: theme.colors.text, width: localTitle ? '100%' : 'auto'  }}
                  placeholder="Artist or historian"
                  onSubmitEditing={() => {
                    setLocalTitle(localTitle.trim());
                  }}
                />
              </View>
            )}

            {modalState === 'eo' && (
              <View style={{ padding: 22, paddingTop: 30 }}>
                <TextInput
                  value={localOverview}
                  onChangeText={setLocalOverview}
                  style={{ height: 'auto', fontSize: 22, lineHeight: 26, color: theme.colors.text }}
                  multiline
                  placeholder="Tell about yourself"
                  onSubmitEditing={() => setLocalOverview(localOverview.trim())}
                />
              </View>
            )}

            {modalState === 'add' && (
              <View style={{ height: '100%', paddingTop: 30, paddingHorizontal: 10 }}>
                <View style={{gap: 10}}>
                  {localQA.map((qa, index) => (
                    <View key={index} style={{ gap: 5 }}>
                      {!qa.baseQA && (
                        <Pressable
                          onPress={() => handleDeleteQA(index)}
                          style={{ alignItems: 'flex-end', paddingRight: 10 }}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" color={theme.colors.text} size={24} />
                        </Pressable>
                      )}
                      <View style={{ width: '100%' }}>
                        {qa.baseQA ? (
                          <ThemedText
                            style={[
                              styles.question,
                              { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.backgroundSec },
                            ]}
                          >
                            {qa.question}
                          </ThemedText>
                        ) : (
                          <TextInput
                            value={qa.question}
                            onChangeText={(text) => handleQuestionChange(text, index)}
                            style={[
                              styles.question,
                              { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.backgroundSec },
                            ]}
                            placeholder="Question"
                          />
                        )}
                        <InputField
                          value={qa.answer}
                          handleChangeText={(text) => handleAnswerChange(text, index)}
                          inputStyle={{
                            width: '100%',
                            backgroundColor: theme.colors.backgroundSec,
                            padding: 7, 
                            paddingTop: 0,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            color: theme.colors.text,
                            fontSize: 20,
                          }}
                          placeholder="Answer"
                          multiline
                        />
                      </View>
                    </View>
                  ))}
                </View>
                <Pressable
                  onPress={handleAddQA}
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 15,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={30} color={'#fff'} />
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <PreviousNextUI
        style={styles.navigation}
        prevFunc={() => handleNavigation('prev')}
        nextFunc={() => handleNavigation('next')}
        disabled={!localYears || !localTitle || !localOverview}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10 },
  header: { marginBottom: 12 },
  tipButton: { alignItems: 'flex-end',},
  inputWrapper: { marginBottom: 20, gap: 10 },
  input: { height: 40, borderRadius: 8, paddingHorizontal: 12 },
  textarea: { height: 100, borderRadius: 8, paddingHorizontal: 12, textAlignVertical: 'top' },
  navigation: { position: 'absolute', bottom: 0, width, zIndex: 1 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    opacity: 0.,
    shadowRadius: 4,
    elevation: 5,
  },
  question: {
    width: '100%',
    padding: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    fontSize: 20,
  },
});

export default AboutExperienceAndHostScreen;


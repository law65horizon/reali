// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { useTheme } from "@/theme/theme";
// import { Ionicons } from "@expo/vector-icons";
// import React, { useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Easing,
//   Modal,
//   Pressable,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";

// const { height: screenHeight } = Dimensions.get("window");

// export default function ExtrasScreen() {
//   const { theme } = useTheme();

//   const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
//   const [faqDraft, setFaqDraft] = useState({ question: "", answer: "" });
//   const [faqModalVisible, setFaqModalVisible] = useState(false);
//   const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

//   // Animations
//   const translateY = useRef(new Animated.Value(screenHeight)).current;
//   const backdropOpacity = useRef(new Animated.Value(0)).current;

//   const openFaqModal = (faq?: { question: string; answer: string }, index?: number) => {
//     if (faq) {
//       setFaqDraft(faq);
//       setEditingFaqIndex(index!);
//     } else {
//       setFaqDraft({ question: "", answer: "" });
//       setEditingFaqIndex(null);
//     }

//     setFaqModalVisible(true);

//     // Run animations
//     Animated.parallel([
//       Animated.timing(backdropOpacity, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(translateY, {
//         toValue: 0,
//         duration: 250,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const closeFaqModal = () => {
//     Animated.parallel([
//       Animated.timing(backdropOpacity, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(translateY, {
//         toValue: screenHeight,
//         duration: 250,
//         easing: Easing.in(Easing.ease),
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setFaqModalVisible(false);
//     });
//   };

//   const saveFaq = () => {
//     if (!faqDraft.question || !faqDraft.answer) return;

//     if (editingFaqIndex !== null) {
//       const updated = [...faqs];
//       updated[editingFaqIndex] = faqDraft;
//       setFaqs(updated);
//     } else {
//       setFaqs([...faqs, faqDraft]);
//     }

//     setFaqDraft({ question: "", answer: "" });
//     setEditingFaqIndex(null);
//     closeFaqModal();
//   };

//   return (
//     <>
//       {/* FAQs Section */}
//       <Section title="FAQs">
//         {faqs.map((faq, idx) => (
//           <View
//             key={idx}
//             style={{
//               backgroundColor: theme.colors.background2,
//               padding: 12,
//               borderRadius: 10,
//               marginBottom: 10,
//             }}
//           >
//             <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//               <ThemedText type="defaultSemiBold">{faq.question}</ThemedText>
//               <View style={{ flexDirection: "row", gap: 15 }}>
//                 <TouchableOpacity onPress={() => openFaqModal(faq, idx)}>
//                   <Ionicons name="create-outline" size={20} color={theme.colors.accent} />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setFaqs(faqs.filter((_, i) => i !== idx))}>
//                   <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <ThemedText style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
//               {faq.answer}
//             </ThemedText>
//           </View>
//         ))}

//         <TouchableOpacity
//           onPress={() => openFaqModal()}
//           style={{
//             padding: 12,
//             borderRadius: 8,
//             borderWidth: 1,
//             borderColor: theme.colors.border,
//             alignItems: "center",
//             marginTop: 8,
//           }}
//         >
//           <ThemedText style={{ color: theme.colors.accent }}>+ Add FAQ</ThemedText>
//         </TouchableOpacity>
//       </Section>

//       {/* Animated FAQ Modal */}
//       <Modal transparent visible={faqModalVisible} animationType="none" statusBarTranslucent>
//         {/* Backdrop */}
//         <Pressable
//           onPress={closeFaqModal}
//           style={{ flex: 1 }}
//         >
//           <Animated.View
//             style={{
//               flex: 1,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               opacity: backdropOpacity,
//             }}
//           />
//         </Pressable>

//         {/* Bottom Sheet */}
//         <Animated.View
//           style={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             backgroundColor: theme.colors.card,
//             borderTopLeftRadius: 20,
//             borderTopRightRadius: 20,
//             padding: 20,
//             transform: [{ translateY }],
//           }}
//         >
//           <ThemedText type="defaultSemiBold" style={{ fontSize: 16, marginBottom: 12 }}>
//             {editingFaqIndex !== null ? "Edit FAQ" : "Add FAQ"}
//           </ThemedText>

//           <Input
//             placeholder="Question"
//             value={faqDraft.question}
//             onChangeText={(t:any) => setFaqDraft({ ...faqDraft, question: t })}
//           />
//           <Input
//             placeholder="Answer"
//             value={faqDraft.answer}
//             onChangeText={(t:any) => setFaqDraft({ ...faqDraft, answer: t })}
//             multiline
//           />

//           <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 12 }}>
//             <TouchableOpacity onPress={closeFaqModal}>
//               <ThemedText style={{ color: theme.colors.textSecondary }}>Cancel</ThemedText>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={saveFaq}>
//               <ThemedText style={{ color: theme.colors.accent, fontWeight: "bold" }}>
//                 Save
//               </ThemedText>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </Modal>
//     </>
//   );
// }

// const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
//   const { theme } = useTheme();
//   return (
//     <ThemedView
//       style={{
//         backgroundColor: theme.colors.card,
//         padding: 16,
//         borderRadius: 16,
//         shadowColor: theme.colors.shadow,
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 2,
//         marginBottom: 16,
//       }}
//     >
//       <ThemedText type="defaultSemiBold" style={{ marginBottom: 12, fontSize: 16 }}>
//         {title}
//       </ThemedText>
//       {children}
//     </ThemedView>
//   );
// };

// const Input = (props: any) => {
//   const { theme } = useTheme();
//   return (
//     <TextInput
//       {...props}
//       style={{
//         borderWidth: 1,
//         borderColor: theme.colors.border,
//         borderRadius: 10,
//         padding: 12,
//         fontSize: 14,
//         color: theme.colors.text,
//         backgroundColor: theme.colors.background,
//         marginBottom: 10,
//       }}
//       placeholderTextColor={theme.colors.textSecondary}
//     />
//   );
// };


import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import InputField from "@/components/ui/InputField";
import PreviousNextUI from "@/components/ui/PreviousNextUI";
import { useExperienceStore } from "@/store/experienceStore";
import { useTheme } from "@/theme/theme";
import { FAQ } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";

export default function ExtrasScreen() {
  const { theme } = useTheme();
  const { setField,price: ppp, whatsIncluded, whatToBring, faqs: initialFaqs, groupSizeMax } = useExperienceStore();

  // State
  const [price, setPrice] = useState(ppp ||"");
  const [groupSize, setGroupSize] = useState(groupSizeMax ||"");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discounts, setDiscounts] = useState<{ people: string; percent: string }[]>([]);
  const [requirements, setRequirements] = useState(whatToBring ||"");

  // const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([initialFaqs || []]);
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs || []);
  const [faqDraft, setFaqDraft] = useState({ question: "", answer: "" });
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
      const unsubscribe: any = EventRegister.addEventListener('EXTR_SAVE', data => {
        console.log('isojswio')
        save_state()
      } )
  
      return () => {
        EventRegister.removeEventListener(unsubscribe)
      };
    }, [faqs, price, groupSize, requirements]);
  
    const save_state = () => {
      setField('price', price);
      setField('groupSizeMax', groupSize);
      if (requirements === whatToBring) return;
      setField('whatsIncluded', requirements);
      if (faqs === initialFaqs) return;
      setField('faqs', faqs);
    }

  const openFaqModal = (faq?: { question: string; answer: string }, index?: number) => {
    if (faq) {
      setFaqDraft(faq);
      setEditingFaqIndex(index!);
    } else {
      setFaqDraft({ question: "", answer: "" });
      setEditingFaqIndex(null);
    }
    setFaqModalVisible(true);
  };

  const saveFaq = () => {
    if (!faqDraft.question || !faqDraft.answer) return;

    if (editingFaqIndex !== null) {
      const updated = [...faqs];
      updated[editingFaqIndex] = faqDraft;
      setFaqs(updated);
    } else {
      setFaqs([...faqs, faqDraft]);
    }

    setFaqDraft({ question: "", answer: "" });
    setEditingFaqIndex(null);
    setFaqModalVisible(false);
  };

  const handleSave = () => {
    setIsLoading(true)
    EventRegister.emit('SAVE_PROJECT', {price, groupSizeMax: groupSize, whatsIncluded: requirements, faqs})
  };

  const handleNavigation = useCallback(
    (dir: 'next' | 'prev') => {
      setField('price', price);
      setField('groupSizeMax', groupSize);
      setField('whatsIncluded', requirements);
      setField('faqs', faqs);
      // setField('images', images.map((img) => img.uri));
      console.log('sjio')
      if (dir === 'next') {
        handleSave()
        // router.push('/listing');
      } else {
        router.back();
      }
    },
    [price, groupSize, requirements, faqs, setField]
  );

  return (<>
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 200 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Price per person */}
      <Section title="Price per Person">
        <InputField
          placeholder="Enter price"
          value={price}
          handleChangeText={setPrice}
          keyboardType="numeric"
          inputStyle={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background}]}
        />
      </Section>

      {/* Max group size */}
      <Section title="Maximum Group Size">
        <InputField
          placeholder="Enter maximum guests"
          value={groupSize}
          handleChangeText={setGroupSize}
          keyboardType="numeric"
          inputStyle={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background}]}
        />
      </Section>

      {/* Discounts */}
      <Section title="Group Discounts">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <ThemedText style={{ color: theme.colors.textSecondary }}>
            Offer group discounts?
          </ThemedText>
          <TouchableOpacity
            onPress={() => setDiscountEnabled(!discountEnabled)}
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              backgroundColor: discountEnabled ? theme.colors.accent : theme.colors.border,
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: theme.colors.card,
                alignSelf: discountEnabled ? "flex-end" : "flex-start",
              }}
            />
          </TouchableOpacity>
        </View>

        {discountEnabled && (
          <View style={{ marginTop: 12, gap: 12 }}>
            {discounts.map((d, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: theme.colors.background2,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <ThemedText>{`${d.people}+ people → ${d.percent}% off`}</ThemedText>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.error}
                  onPress={() => setDiscounts(discounts.filter((_, i) => i !== idx))}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setDiscounts([...discounts, { people: "5", percent: "10" }])}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <ThemedText style={{ color: theme.colors.accent }}>+ Add Discount</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </Section>

      {/* Requirements */}
      <Section title="What Guests Should Bring">
        <InputField
          placeholder="E.g. Comfortable shoes, sunscreen..."
          value={requirements}
          handleChangeText={setRequirements}
          multiline
          title="iowiwjojoijj"
          inputStyle={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background}]}
        />
      </Section>

      {/* FAQs */}
      <Section title="FAQs">
        {faqs.map((faq, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: theme.colors.background2,
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <ThemedText type="defaultSemiBold">{faq.question}</ThemedText>
              <View style={{ flexDirection: "row", gap: 15 }}>
                <TouchableOpacity onPress={() => openFaqModal(faq, idx)}>
                  <Ionicons name="create-outline" size={20} color={theme.colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFaqs(faqs.filter((_, i) => i !== idx))}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <ThemedText style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
              {faq.answer}
            </ThemedText>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => openFaqModal()}
          style={{
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <ThemedText style={{ color: theme.colors.accent }}>+ Add FAQ</ThemedText>
        </TouchableOpacity>
      </Section>

      {/* FAQ Modal */}
      <Modal
        transparent
        visible={faqModalVisible}
        animationType="slide"
        onRequestClose={() => setFaqModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <ThemedView
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 20,
              gap: 12,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
              {editingFaqIndex !== null ? "Edit FAQ" : "Add FAQ"}
            </ThemedText>

            <Input
              placeholder="Question"
              value={faqDraft.question}
              onChangeText={(t:any) => setFaqDraft({ ...faqDraft, question: t })}
            />
            <InputField
              placeholder="Answer"
              value={faqDraft.answer}
              handleChangeText={(t:any) => setFaqDraft({ ...faqDraft, answer: t })}
              multiline
              title={faqDraft.question.slice(0,3)}
              inputStyle={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background}]}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setFaqModalVisible(false)}>
                <ThemedText style={{ color: theme.colors.textSecondary }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveFaq}>
                <ThemedText style={{ color: theme.colors.accent, fontWeight: "bold" }}>
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      
    </ScrollView>
    <PreviousNextUI 
        prevFunc={() => handleNavigation('prev')}
        nextFunc={() => handleNavigation('next')}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, }}
        nextLabel="Finish"
        disabled={!price || !groupSize || !requirements || faqs.length === 0}
    />
  </>);
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <ThemedView
      style={{
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        shadowColor: theme.colors.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <ThemedText type="defaultSemiBold" style={{ marginBottom: 12, fontSize: 16 }}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
};

const Input = (props: any) => {
  const { theme } = useTheme();
  return (
    <TextInput
      {...props}
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
      }}
      placeholderTextColor={theme.colors.textSecondary}
    />
  );
};


const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    // borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    // color: theme.colors.text,
    // backgroundColor: theme.colors.background,
  }
})
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { ImageProps } from '@/types/type';
import { gql, useMutation } from '@apollo/client';
import { router, Stack, useNavigation, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';

// // Define route names for type safety
type RouteName = 'landing' | 'experienceBasics' | 'location'| 'aboutYou' | 'upload_media' | 'availability'| 'extras' ;

let screens: RouteName[] = ['experienceBasics' , 'location', 'aboutYou' , 'upload_media' , 'availability', 'extras']


export default function Edit_Project_Experiences() {
  const CREATE_EXPERIENCE = gql`
     mutation CreateExperience($input: ExperienceInput!) {
      createExperience(input: $input) {
        id
      }
    }
  `

  const GENERATE_CLOUDINARY_SIGNATURE = gql`
    mutation GenerateCloudinarySignature {
      generateCloudinarySignature {
          signature
        timestamp
        cloudName
        apiKey
      }
    }
  `;

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useTheme();
  const navigation = useNavigation();
  const segments = useSegments();
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showTab, setShowTab] = useState(false);
  const [createExperienceData, { data, loading, error }] = useMutation(CREATE_EXPERIENCE)
  const [generateSignature, { loading:signature_loading, error:signature_error }] = useMutation(GENERATE_CLOUDINARY_SIGNATURE)
  // const [formData, setFormData] = useState<any>({});

  // <- note: this is static access (not reactive)


  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('SAVE_PROJECT', data => {
      // console.log('cios', address, title, data)
      save()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, []);
   

  async function uploadToCloudinary(uri: string, signatureData: any) {
  const { signature, timestamp, cloudName, apiKey } = signatureData;

  const formData = new FormData();

  formData.append("file", {
    uri,
    name: `upload_${Date.now()}.png`,
    type: "image/png",
  } as any);

  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", "properties");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Cloudinary upload error:", errorText);
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
  }
   

  async function uploadAllImages(base64Array: ImageProps[], signatureData: any) {
    const uploadPromises = base64Array.map((base64) => {
      return uploadToCloudinary(base64.uri, signatureData)
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log("Upload results:", results);
      return results; // Array of uploaded image metadata
    } catch (err) {
      console.error("Error uploading images:", err);
      throw err;
    }
  }


//   const save = async () => {
//     console.log('diosoisp')
//     try {
//       // router.replace('/listing')
//       // navigation.reset({
//       //   index: 0,
//       //   routes: [{ name: 'listing' as never }]
//       // })

//       console.log('address', address?.city, address?.country)
//       if (isSubmitting || !address?.city) return;
//       setIsSubmitting(true)
//       const signatureData = await (await generateSignature()).data?.generateCloudinarySignature
//       console.log(signatureData, 'wiwowi')
//       const image_urls = await uploadAllImages(images, signatureData)
//       const experienceInput = {
//   real: 1, // or from user context
//   address: {
//     street: address.display_name,
//     city: address.city,
//     postal_code: address.postcode,
//     country: address.country,
//     latitude: address.latitude,
//     longitude: address.longitude,
//   },
//   title: title,
//   brief_bio: briefBio,
//   category: category,
//   years_of_experience: yearsOfExperience,
//   professional_title: professionalTitle,
//   price: parseFloat(price),
//   group_size_max: parseInt(groupSizeMax) || 1,
//   duration_minutes: parseInt(duration) || 60,
//   experience_overview: experienceOverview,
//   cancellation_policy: '24-hour cancellation accepted',
//   image_urls,
//   itineraries: [
//     {
//       day: 1,
//       description: 'Welcome and orientation',
//       start_time: '10:00',
//       end_time: '12:00',
//     },
//   ],
//   itinerary_days: [
//     {
//       date: '2025-08-22',
//       activities: [
//         {
//           title: 'Golden Gate Bridge Shoot',
//           description: 'Take iconic shots of the bridge',
//           start_time: '10:00',
//           end_time: '11:30',
//           url: '',
//           location: 'Golden Gate Bridge',
//         },
//       ],
//     },
//   ],
//   // itinerary_days: availability[0],
//   faqs,
//   // whats_included: whatsIncluded,
// };

//       // const result = await createExperienceData({
//       //   variables: {
//       //     input: {
//       //      price: 902,
//       //      address: {
//       //       city: address?.city,
//       //       country: address?.country,
//       //       street: address?.display_name,
//       //       postal_code: address?.postcode,
//       //       longitude: address?.longitude,
//       //       latitude: address?.latitude
//       //      },
//       //      image_urls,
//       //      title,
//       //      description,
//       //      speciality: specialize,
//       //      amenities,
//       //      realtor_id:1
//       //     }
//       //   }
//       // })
//       const result = await createExperienceData({variables: {input: experienceInput}})
//       console.log('successfull', result.data.id)
//       // router.replace('/listing')
//        navigation.reset({
//         index: 0,
//         routes: [{ name: 'listing' as never }]
//       })
//     } catch (err: any) {
//       console.log('1, ',err.message)
//       console.log(error)
//       EventRegister.emit('SAVE_ERROR')
//     } finally {
//       setIsSubmitting(false)
//     }
//   } 
 
const save = async () => {
  try {
    EventRegister.emit(`${currentScreen.slice(0, 4).toUpperCase()}_SAVE`, {})
    const {
    title,
    briefBio,
    category,
    images,
    videos,
    yearsOfExperience,
    professionalTitle,
    experienceOverview,
    availability,
    price,
    groupSizeMin,
    groupSizeMax,
    duration,
    address,
    whatsIncluded,
    whatToBring,
    faqs,
    cancellationPolicy,
    itenerary,
    } = useExperienceStore.getState(); 
    console.log('idow', title)
    // if(1 < 2) return;
    // if (!address?.city || !address?.country) {
    //   console.error("Missing required address fields");
    //   EventRegister.emit("SAVE_ERROR", "Missing address information");
    //   return;
    // }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const signatureData = await generateSignature().then((res) => res.data?.generateCloudinarySignature);
    if (!signatureData) {
      throw new Error("Failed to generate Cloudinary signature");
    }

    const image_urls = await uploadAllImages(images, signatureData);
    if (!image_urls || !image_urls.length) {
      throw new Error("Failed to upload images to Cloudinary");
    }

    // const experienceInput:FormState = {
    //   // host_id: "1", // Replace with actual user ID from context
    //   address: {
    //     // street: address?.display_name || "Okpanam, Oshimili North, Delta State, Nigeria",
    //     city: address?.city || "Okpanam",
    //     // postal_code: address?.postcode || "",
    //     country: address?.country || "Nigeria",
    //     latitude: address?.latitude || 6.254655179515746,
    //     longitude: address?.longitude || 6.672471064299166,
    //   },
    //   title: title || "Banana",
    //   briefBio: briefBio || "A brief bio about the host",
    //   category: category ? String(category) : "General",
    //   // years_of_experience: parseInt(yearsOfExperience) || 12,
    //   // professional_title: professionalTitle || "Jenner",
    //   // price: parseFloat(price) || 100.0,
    //   // group_size_min: parseInt(groupSizeMin) || 1,
    //   // group_size_max: parseInt(groupSizeMax) || 1,
    //   // duration_minutes: parseInt(duration) || 60,
    //   // experience_overview: experienceOverview || "A detailed overview of the experience",
    //   // cancellation_policy: cancellationPolicy || "24-hour cancellation accepted",
    //   // image_urls,
    //   availability: [
    //     {
    //       date: "2025-08-22",
    //       start_timie: "10:00",
    //       end_time: "11:30",
    //       activities: [
    //         {
    //           title: "Golden Gate Bridge Shoot",
    //           description: "Take iconic shots of the bridge",
    //           thumbnail_url: "",
    //           duration_minutes: 90,
    //           locatioin: "Golden Gate Bridge",
    //         },
    //       ],
    //     },
    //   ],
    //   faqs: JSON.parse(JSON.stringify(faqs || [])),
    // };

    const experienceInput = {
      host_id: "1", // Replace with actual user ID from context
      address: {
        street: address?.display_name || "Okpanam, Oshimili North, Delta State, Nigeria",
        city: address?.city || "Okpanam",
        postal_code: address?.postcode || "",
        country: address?.country || "Nigeria",
        latitude: address?.latitude || 6.254655179515746,
        longitude: address?.longitude || 6.672471064299166,
      },
      title: title || "Banana",
      brief_bio: briefBio || "A brief bio about the host",
      category: category ? String(category) : "General",
      years_of_experience: parseInt(yearsOfExperience) || 12,
      professional_title: professionalTitle || "Jenner",
      price: parseFloat(price) || 100.0,
      group_size_min: parseInt(groupSizeMin) || 1,
      group_size_max: parseInt(groupSizeMax) || 1,
      duration_minutes: parseInt(duration) || 60,
      experience_overview: experienceOverview || "A detailed overview of the experience",
      cancellation_policy: cancellationPolicy || "24-hour cancellation accepted",
      image_urls,
      itineraries: [
        {
          day: 1,
          description: "Welcome and orientation",
          start_time: "10:00",
          end_time: "12:00",
        },
      ],
      itinerary_days: availability.map((day, index) => ({
        date: day.date.toISOString().split('T')[0], // Format as YYYY-MM
        start_time: day.startTime.toISOString().split('T')[1].substring(0,5), // Format as HH:MM
        end_time: day.endTime.toISOString().split('T')[1].substring(0,5), // Format as HH:MM
        activities: day.activities.map((activity) => ({
          title: activity.title,
          description: activity.description || "",
          thumbnail_url: activity.thumbnail_url || "",
          location: "Golden Gate Bridge",
        })),
      })),
      // itinerary_days: [
      //   {
      //     date: "2025-08-22",
      //     start_timie: "10:00",
      //     end_time: "11:30",
      //     activities: [
      //       {
      //         title: "Golden Gate Bridge Shoot",
      //         description: "Take iconic shots of the bridge",
      //         thumbnail_url: "",
      //         duration_minutes: 90,
      //         locatioin: "Golden Gate Bridge",
      //       },
      //     ],
      //   },
      // ],
      faqs: JSON.parse(JSON.stringify(faqs || [])),
    };

    console.log("Sending mutation with input:", JSON.stringify(experienceInput, null, 2));

    const result = await createExperienceData({
      variables: { input: experienceInput },
    });

    console.log("Successfully created experience:", result.data.createExperience.id);
    navigation.reset({
      index: 0,
      routes: [{ name: "listing" as never }],
    });
  
  } catch (err:any) {
    console.error("Full error:", JSON.stringify(err, null, 2));
    EventRegister.emit("SAVE_ERROR", err.message);
  } finally {
    setIsSubmitting(false);
  }
};
  
const currentScreen = segments[segments.length - 1] as RouteName

  return (<>
    { currentScreen !== 'landing' && <>
      <ThemedView
        plain
        secondary
        style={[{ borderBottomWidth: 0, justifyContent: 'space-between',  paddingTop: 45, flexDirection: 'row', }]}
      >
        <TouchableOpacity
          onPress={() => save()}
          style={{ borderRadius: 15, padding: 10,  borderColor: theme.colors.backgroundSec, borderWidth: 1 }}
        >
          <ThemedText style={{fontSize: 14,}}>Save & Exit</ThemedText>
        </TouchableOpacity>

        <View style={{position: 'absolute', left:0, top: 55, alignItems: 'center', width: '100%',}}>
          {isSubmitting ? (
            <ActivityIndicator 
              animating={true} 
              color={theme.colors.text}
              size={'small'}
            />
          ): (
            <TouchableOpacity onPress={() => setShowTab(!showTab)} >
              <ThemedText style={{textTransform: 'capitalize'}}>{currentScreen}</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={{ borderRadius: 15, padding: 10,  borderColor: theme.colors.backgroundSec, borderWidth: 1 }}
        >
          <ThemedText>FAQ</ThemedText>
        </TouchableOpacity>
      </ThemedView> 
      
      {showTab && <View style={{height: 70, width: '100%', backgroundColor: theme.colors.background2, flexDirection: 'row', flexWrap: 'wrap', gap:5, paddingHorizontal:5}} >
      {/* {showTab && <View style={{height: 70, width: '100%', backgroundColor: theme.colors.background2, opacity: 0.9, flexDirection: 'row', flexWrap: 'wrap', gap:5, paddingHorizontal:5}} > */}
        {screens.map((screen) => (
          <TouchableOpacity key={screen.slice(0,3)} onPress={async() => {
            setShowTab(false)
            console.log(`${currentScreen.slice(0, 4).toUpperCase()}_SAVE`)
            EventRegister.emit(`${currentScreen.slice(0, 4).toUpperCase()}_SAVE`, {})
            router.push(`/(host)/(tabs)/listing/experiences/${screen}`)
          }}>
            <ThemedText type='defaultSemiBold' style={{color: screen == currentScreen? theme.colors.accent: theme.colors.text, textTransform: 'capitalize'}}> {screen.replace('_', '-')} </ThemedText>
          </TouchableOpacity>
        ))}
      </View>}
    </>}
      <Stack >
        <Stack.Screen name="experienceBasics" options={{ headerShown: false, }} />
        <Stack.Screen name="location" options={{ headerShown: false }} />
        <Stack.Screen name="aboutYou" options={{ headerShown: false }} />
        <Stack.Screen name="upload_media" options={{ headerShown: false }} />
        <Stack.Screen name="extras" options={{ headerShown: false }} />
        <Stack.Screen name="availability" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="exe" options={{ headerShown: false, presentation: 'transparentModal' }} />
      </Stack>
      
 </> );
}

const styles = StyleSheet.create({
  shadow: {
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -2 },
    // shadowOpacity: 0.4,
    // opacity: 0.9,
    // shadowRadius: 4,
    // elevation: 5,
    height: 90,
  },
});

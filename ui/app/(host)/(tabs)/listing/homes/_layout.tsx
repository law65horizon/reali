


import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useHomeStore } from '@/stores/homeStore';
import { useTheme } from '@/theme/theme';
import { ImageProps } from '@/types/type';
import { gql, useMutation } from '@apollo/client';
import { router, Stack, useNavigation, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';

// // Define route names for type safety
type RouteName = 'landing' | 'upload_media' | 'title_description' | 'specialize' | 'amenities';

// const routes_line = {
//   homes: ['upload_media', 'title_description', 'specialize', 'amenities'] as RouteName[],
//   experiences: [] as RouteName[],
// };

export default function Edit_Project_Homes() {
  const CREATE_PROPERTY = gql`
     mutation CreateProperty($input: PropertyInput!) {
      createProperty(input: $input) {
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
  const [createPropertyData, { data, loading, error }] = useMutation(CREATE_PROPERTY)
  const [generateSignature, { loading:signature_loading, error:signature_error }] = useMutation(GENERATE_CLOUDINARY_SIGNATURE)
  // const [formData, setFormData] = useState<any>({});
  const {setField, description, title, images,address, videos, specialize, amenities} = useHomeStore()

  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('SAVE_PROJECT', data => {
      console.log('cios', address, title)
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


  const save = async () => {
    console.log('diosoisp')
    try {
      console.log('address', address?.city, address?.country)
      if (isSubmitting || !address?.city) return;
      setIsSubmitting(true)
      const signatureData = await (await generateSignature()).data?.generateCloudinarySignature
      console.log(signatureData, 'wiwowi')
      const image_urls = await uploadAllImages(images, signatureData)
      const result = await createPropertyData({
        variables: {
          input: {
           price: 902,
           address: {
            city: address?.city,
            country: address?.country,
            street: address?.display_name,
            postal_code: address?.postcode,
            longitude: address?.longitude,
            latitude: address?.latitude
           },
           image_urls,
           title,
           description,
           speciality: specialize,
           amenities,
           realtor_id:1
          }
        }
      })
      console.log('successfull', result.data.id)
      router.replace('/listing')
    } catch (err: any) {
      console.log('1, ',err.message)
      console.log(error)
      EventRegister.emit('SAVE_ERROR')
    } finally {
      setIsSubmitting(false)
    }
  } 

  // useEffect(() => {
  //   const currentScreen = segments[segments.length - 1] as RouteName;
  //   const index = routes_line.homes.indexOf(currentScreen);
  //   if (index !== -1 && index !== currentScreenIndex) {
  //     setCurrentScreenIndex(index);
  //   }
  // }, [segments]);

  const currentScreen = segments[segments.length - 1] as RouteName

  return (<>
    { currentScreen !== 'landing' &&
      <ThemedView
        plain
        secondary
        style={[styles.shadow, { borderBottomWidth: 0, justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingHorizontal: 15, flexDirection: 'row' }]}
      >
        <TouchableOpacity
          onPress={() => save()}
          // onPress={() => navigation.goBack()}
          style={{ borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.backgroundSec, borderWidth: 1 }}
        >
          <ThemedText>Save & Exit</ThemedText>
        </TouchableOpacity>

        <ActivityIndicator 
          animating={isSubmitting}
          color={theme.colors.text}
          size={'small'}
        />

        <TouchableOpacity
          style={{ borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.backgroundSec, borderWidth: 1 }}
        >
          <ThemedText>FAQ</ThemedText>
        </TouchableOpacity>
      </ThemedView> 
    }
      <Stack>
        <Stack.Screen name="upload_media" options={{ headerShown: false }} />
        <Stack.Screen name="title_description" options={{ headerShown: false }} />
        <Stack.Screen name="specialize" options={{ headerShown: false }} />
        <Stack.Screen name="amenities" options={{ headerShown: false }} />
        <Stack.Screen name="location" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
      </Stack>
 </> );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    opacity: 0.9,
    shadowRadius: 4,
    elevation: 5,
    height: 100,
  },
});
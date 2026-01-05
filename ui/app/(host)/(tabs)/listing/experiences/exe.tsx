import { useExperienceStore } from '@/stores/experienceStore';
import { ImageProps } from '@/types/type';
import { gql, useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';

const Exe = () => {
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

  const [createExperienceData, { data, loading, error }] = useMutation(CREATE_EXPERIENCE)
  const [generateSignature, { loading:signature_loading, error:signature_error }] = useMutation(GENERATE_CLOUDINARY_SIGNATURE)
     const [isSubmitting, setIsSubmitting] = useState(false)
     const navigation = useNavigation();
   

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
  try {
    console.log('idow', title)
    if(1 < 2) return;
    if (!address?.city || !address?.country) {
      console.error("Missing required address fields");
      EventRegister.emit("SAVE_ERROR", "Missing address information");
      return;
    }
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
      itinerary_days: [
        {
          date: "2025-08-22",
          activities: [
            {
              title: "Golden Gate Bridge Shoot",
              description: "Take iconic shots of the bridge",
              start_time: "10:00",
              end_time: "11:30",
              url: "",
              location: "Golden Gate Bridge",
            },
          ],
        },
      ],
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
    router.back()
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    const unsubscribe = async() => {
        await save
    }
    
  })
  return (
        <View style={{backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#38383dff" animating={isSubmitting} />
        </View>
    );
}

const styles = StyleSheet.create({})

export default Exe;

import { ThemedText } from "@/components/ThemedText";
import { useExperienceStore } from "@/stores/experienceStore";
import { View } from "react-native";



export default function Images ()  {
    const {images} = useExperienceStore()
    return (
        <View><ThemedText>ioipo</ThemedText></View>
    )
}
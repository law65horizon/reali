import { ThemedText } from "@/components/ThemedText";
import { useExperienceStore } from "@/store/experienceStore";
import { View } from "react-native";



export default function Images ()  {
    const {images} = useExperienceStore()
    return (
        <View><ThemedText>ioipo</ThemedText></View>
    )
}
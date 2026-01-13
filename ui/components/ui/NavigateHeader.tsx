import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

const NavigateHeader = () => {
  const {theme} = useTheme()
  const navigation = useNavigation()

  return (
    <Pressable onPress={() => navigation.goBack()}>
        <Entypo name='cross' size={24} color={theme.colors.text} />
    </Pressable>
  );
};


export default NavigateHeader;
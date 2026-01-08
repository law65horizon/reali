import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Button } from 'react-native';

const FilePicker = () => {
  // Request permissions for photo library
  const requestPhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo library permissions to select images.');
      return false;
    }
    return true;
  };

  // Pick multiple images from the photo album
  const pickImage = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to images only
      allowsMultipleSelection: true, // Enable multiple selection
      selectionLimit: 10, // Optional: Limit the number of images (0 for no limit)
      allowsEditing: false, // Disable editing for multiple selection
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      console.log('Selected Images:', uris);
      return result.assets;
    }
    return null;
  };

  // Pick a document
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
      });

      if (result.type !== 'cancel') {
        console.log('Selected Document:', result.assets[0].uri);
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Document Picker Error:', error);
      return null;
    }
  };

  // Show a picker to choose between photo or document
  const chooseFileType = () => {
    Alert.alert(
      'Select File Type',
      'Would you like to pick photos or a document?',
      [
        {
          text: 'Photos',
          onPress: async () => {
            const files = await pickImage();
            if (files && files.length > 0) {
              const uris = files.map(file => file.uri).join(', ');
              Alert.alert('Success', `Selected files: ${uris}`);
            }
          },
        },
        {
          text: 'Document',
          onPress: async () => {
            const file = await pickDocument();
            if (file) {
              Alert.alert('Success', `Selected file: ${file.uri}`);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return <Button title="Pick a File" onPress={chooseFileType} />;
};

export default FilePicker;
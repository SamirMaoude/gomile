import { Alert, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

async function pickImageFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Nous avons besoin d’accéder à votre galerie pour ajouter une photo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

async function takeImageWithCamera() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Nous avons besoin d’accéder à votre caméra pour prendre une photo.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

export async function pickImageSource() {
  const options = ['Prendre une photo', 'Depuis la photothèque', 'Annuler'];

  const openPicker = async (index) => {
    if (index === 0) {
      return takeImageWithCamera();
    }

    if (index === 1) {
      return pickImageFromLibrary();
    }

    return null;
  };

  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        async (buttonIndex) => {
          try {
            resolve(await openPicker(buttonIndex));
          } catch (error) {
            Alert.alert('Erreur', error.message || 'Impossible d’ouvrir le sélecteur.');
            resolve(null);
          }
        },
      );
    });
  }

  return new Promise((resolve) => {
    Alert.alert('Photo', 'Choisis une source.', [
      { text: 'Prendre une photo', onPress: async () => {
        try {
          resolve(await openPicker(0));
        } catch (error) {
          Alert.alert('Erreur', error.message || 'Impossible d’ouvrir le sélecteur.');
          resolve(null);
        }
      } },
      { text: 'Depuis la photothèque', onPress: async () => {
        try {
          resolve(await openPicker(1));
        } catch (error) {
          Alert.alert('Erreur', error.message || 'Impossible d’ouvrir le sélecteur.');
          resolve(null);
        }
      } },
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export async function pickDocument() {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error("Nous avons besoin d'acceder a votre galerie pour selectionner un document.");
    }

    // expo-image-picker.launchImageLibraryAsync avec MediaTypeOptions.All
    // supporte les PDFs et images selon la plateforme
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    if (result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    throw new Error(error.message || "Impossible de selectionner le document.");
  }
}
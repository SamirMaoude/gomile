import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

// Import de l'image de fond
import backgroundImage from '../../assets/background_login.png';

const ScreenWrapper = ({ children, style }) => {
  return (
    <View style={styles.container}>
      {/* On utilise l'image en fond absolu pour qu'elle couvre tout, 
         même derrière le header si besoin 
      */}
      <ImageBackground 
        source={backgroundImage} 
        defaultSource={backgroundImage}
        style={styles.background} 
        fadeDuration={0}
        resizeMode="cover"
      >
        {/* ICI : pour le moement,  On retire SafeAreaView. 
           C'est ton composant Header qui gérera l'encoche.
        */}
        <View style={[styles.content, style]}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F253D',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;
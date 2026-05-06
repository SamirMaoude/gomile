import React from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from 'react-native';
import Header from './Header';
import { COLORS, SIZES } from '../constants/theme';

export default function FormLayout({ title, children, variant = 'form', showAvailabilityToggle = false }) {
  const isLogin = variant === 'login';

  return (
    <View style={styles.container}>
      <Header title={title} showAvailabilityToggle={showAvailabilityToggle} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            isLogin && styles.loginCenter // on applique le centrage spécifique
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
          {/* remonte la carte de 10% sur le login a revoir par @ousmane */}
          {isLogin && <View style={{ height: 80 }} />} 
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { 
    padding: SIZES.padding,
    flexGrow: 1, // centrage vertical
  },
  loginCenter: {
    justifyContent: 'center', // Centre la carte
  }
});
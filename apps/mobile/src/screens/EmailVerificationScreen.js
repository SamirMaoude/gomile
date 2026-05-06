import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { FormLayout } from '../components/FormLayout';
import { GoMileButton } from '../components/GoMileButton';
import { getEmailStatus } from '../../lib/auth-client';
import { useRegistrationStore } from '../store/useRegistrationStore';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  emailBold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 12,
  },
  successEmoji: {
    fontSize: 48,
    color: '#4CAF50',
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 12,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export function EmailVerificationScreen({ navigation }) {
  const email = useRegistrationStore((state) => state.email);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  // Polling pour vérifier le statut d'email
  useEffect(() => {
    let pollInterval;
    let isMounted = true;

    const checkEmailStatus = async () => {
      try {
        const status = await getEmailStatus();
        if (isMounted) {
          if (status.emailVerified) {
            setIsVerified(true);
            setIsChecking(false);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erreur lors de la vérification d\'email:', err);
          setError(err.message);
        }
      }
    };

    // Premier check tout de suite
    checkEmailStatus();

    // Polling toutes les 2 secondes
    pollInterval = setInterval(checkEmailStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  const handleContinue = () => {
    if (isVerified) {
      navigation.navigate('RegisterStep2');
    }
  };

  const handleSkip = () => {
    // Optionnel: permettre de continuer sans confirmer l'email
    Alert.alert(
      'Continuer sans confirmer?',
      'Veuillez confirmer votre email pour continuer la inscription',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Oui, continuer',
          onPress: () => navigation.navigate('RegisterStep2'),
        },
      ]
    );
  };

  return (
    <FormLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Icône ou indicateur */}
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>✉️</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Vérifie ton adresse email</Text>

          {/* Message d'explication */}
          <Text style={styles.description}>
            Un email de confirmation a été envoyé à{' '}
            <Text style={styles.emailBold}>{email}</Text>
          </Text>

          {/* Status du polling */}
          <View style={styles.statusContainer}>
            {isChecking && !error && (
              <>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.statusText}>
                  Vérification en cours...
                </Text>
              </>
            )}

            {isVerified && (
              <>
                <Text style={styles.successEmoji}>✓</Text>
                <Text style={styles.successText}>Email confirmé!</Text>
              </>
            )}

            {error && (
              <>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </>
            )}
          </View>

          {/* Instructions supplémentaires */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Besoin d'aide?</Text>
            <Text style={styles.instructions}>
              • Vérifie ton dossier SPAM{'\n'}
              • Attends quelques secondes et réessaye{'\n'}
              • Assure-toi d'avoir utilisé la bonne adresse email
            </Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <GoMileButton
            label="Continuer"
            onPress={handleContinue}
            disabled={!isVerified}
            style={!isVerified ? styles.disabledButton : {}}
          />

          {!isVerified && (
            <GoMileButton
              label="Continuer sans confirmer"
              onPress={handleSkip}
              variant="secondary"
            />
          )}
        </View>
      </ScrollView>
    </FormLayout>
  );
}

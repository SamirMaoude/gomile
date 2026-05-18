import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import FormLayout from '../components/FormLayout';
import GoMileButton from '../components/GoMileButton';
import { getEmailStatus } from '../../lib/auth-client';
import { updateSessionVehicle } from '../../lib/driver-client';
import { useRegistrationStore } from '../store/useRegistrationStore';

export function EmailVerificationScreen({ navigation }) {
  const email = useRegistrationStore((state) => state.email);
  const transportType = useRegistrationStore((state) => state.transportType);
  const resetForm = useRegistrationStore((state) => state.resetForm);
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
        if (isMounted && status.emailVerified) {
          setIsVerified(true);
          setIsChecking(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    checkEmailStatus();
    pollInterval = setInterval(checkEmailStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Dès que l'email est vérifié : synchroniser le véhicule, nettoyer le store, naviguer
  useEffect(() => {
    if (!isVerified) return;

    const finalize = async () => {
      const vehicleMap = { velo: 'BIKE', moto: 'SCOOTER', voiture: 'CAR', utilitaire: 'TRUCK' };
      const vehicleType = vehicleMap[transportType] || null;
      if (vehicleType) {
        await updateSessionVehicle(vehicleType).catch(() => {});
      }
      resetForm();
      navigation.replace('Login');
    };

    const timer = setTimeout(finalize, 1200);
    return () => clearTimeout(timer);
  }, [isVerified, navigation, transportType, resetForm]);

  return (
    <FormLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>✉️</Text>
          </View>

          <Text style={styles.title}>Vérifie ton adresse email</Text>

          <Text style={styles.description}>
            Un email de confirmation a été envoyé à{' '}
            {email ? (
              <Text style={styles.emailBold}>{email}</Text>
            ) : (
              'ton adresse email'
            )}
            . Clique sur le lien dans le mail pour continuer.
          </Text>

          <View style={styles.statusContainer}>
            {isChecking && !isVerified && !error && (
              <>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.statusText}>En attente de confirmation…</Text>
              </>
            )}

            {isVerified && (
              <>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={styles.successText}>Email confirmé ! Redirection…</Text>
              </>
            )}

            {error && !isVerified && (
              <>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>
                  Impossible de vérifier le statut. Assure-toi d'être connecté à internet.
                </Text>
              </>
            )}
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Besoin d'aide ?</Text>
            <Text style={styles.instructions}>
              • Vérifie ton dossier SPAM{'\n'}
              • Attends quelques secondes et réessaye{'\n'}
              • Assure-toi d'avoir utilisé la bonne adresse email
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <GoMileButton
            title={isVerified ? 'Continuer…' : 'En attente de confirmation'}
            onPress={() => {}}
            disabled={!isVerified}
            style={!isVerified ? styles.disabledButton : {}}
          />
        </View>
      </ScrollView>
    </FormLayout>
  );
}

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
    paddingHorizontal: 8,
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

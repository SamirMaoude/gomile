import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

//  composants factorisés
import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileButton from '../components/GoMileButton';

// Thème et constantes
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import {
  getDriverProfile,
  getMyKycStatus,
  getMyReferral,
} from '../../lib/driver-client';
import { logout } from '../../lib/auth-client';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore';
import {
  clearCachedProfileAvatarUrl,
  getCachedProfileAvatarUrl,
} from '../../lib/profile-cache';

const DEFAULT_AVATAR = require('../../assets/livreur.jpg');
const SIGNED_AVATAR_CACHE = new Map();
let avatarS3Client = null;

function resolveApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    'http://localhost:3000'
  );
}

function resolveAvatarSource(avatarUrl) {
  const cleanedUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';

  if (!cleanedUrl) {
    return DEFAULT_AVATAR;
  }

  if (
    cleanedUrl.includes('placehold.co') ||
    cleanedUrl.includes('text=GoMile') ||
    cleanedUrl.includes('text=Gomile')
  ) {
    return DEFAULT_AVATAR;
  }

  if (
    cleanedUrl.startsWith('http://') ||
    cleanedUrl.startsWith('https://') ||
    cleanedUrl.startsWith('file://') ||
    cleanedUrl.startsWith('data:')
  ) {
    return { uri: cleanedUrl };
  }

  try {
    const resolvedUri = new URL(cleanedUrl, resolveApiBaseUrl()).toString();
    return { uri: resolvedUri };
  } catch (e) {
    console.error('resolveAvatarSource - Erreur lors de la résolution de l\'URL:', e); // Debug log
    return DEFAULT_AVATAR;
  }
}

function isAbsoluteUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://') || url.startsWith('data:');
}

function isS3Url(url) {
  return url.includes('.s3.') && url.includes('amazonaws.com');
}

function getAvatarS3Client() {
  if (avatarS3Client) return avatarS3Client;

  const region = process.env.EXPO_PUBLIC_AWS_REGION;
  const accessKeyId = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    console.error('Avatar signing env check:', {
      hasRegion: Boolean(region),
      hasAccessKey: Boolean(accessKeyId),
      hasSecret: Boolean(secretAccessKey),
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || null,
    });
    throw new Error('Missing AWS env for avatar signing');
  }

  avatarS3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return avatarS3Client;
}

function parseS3BucketAndKey(s3Url) {
  const url = new URL(s3Url);
  const key = url.pathname.replace(/^\//, '');

  const hostMatch = url.hostname.match(/^(.*?)\.s3\./);
  const bucket = hostMatch?.[1] || process.env.EXPO_PUBLIC_S3_BUCKET_NAME;

  if (!bucket || !key) {
    throw new Error('Invalid S3 URL for avatar');
  }

  return { bucket, key };
}

async function getSignedAvatarUrl(rawUrl) {
  const cached = SIGNED_AVATAR_CACHE.get(rawUrl);
  if (cached && cached.expiresAt > Date.now() + 15_000) {
    return cached.url;
  }

  const { bucket, key } = parseS3BucketAndKey(rawUrl);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const client = getAvatarS3Client();
  const expiresIn = 300;
  const signedUrl = await getSignedUrl(client, command, { expiresIn });

  SIGNED_AVATAR_CACHE.set(rawUrl, {
    url: signedUrl,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  return signedUrl;
}


export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [referral, setReferral] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState('BIKE');
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [signedAvatarUrl, setSignedAvatarUrl] = useState(null);
  const isOnline = useAvailabilityStore((state) => state.isOnline);
  const setOnlineStatus = useAvailabilityStore((state) => state.setOnlineStatus);
  const cachedAvatarUrl = getCachedProfileAvatarUrl();

  const vehicleOptions = [
    { label: 'Vélo', value: 'BIKE' },
    { label: 'Moto', value: 'SCOOTER' },
    { label: 'Voiture', value: 'CAR' },
    { label: 'Utilitaire', value: 'TRUCK' },
  ];

  const vehicleValue = String(profile?.activeVehicle || activeVehicle || 'BIKE').toUpperCase();
  const vehicleLabel = vehicleOptions.find((v) => v.value === vehicleValue)?.label || 'Vélo';

  const vehicleIcon =
    vehicleValue === 'BIKE'
      ? 'bike'
      : vehicleValue === 'SCOOTER'
      ? 'moped'
      : vehicleValue === 'TRUCK'
      ? 'truck-outline'
      : 'car';

  const loadProfileData = useCallback(async () => {
    try {
      const [profileData, kycData, referralData] = await Promise.all([
        getDriverProfile(),
        getMyKycStatus(),
        getMyReferral(),
      ]);

      setProfile(profileData);
      setReferral(referralData);
      const kycNormalizedStatus = String(kycData?.status || 'NOT_SUBMITTED').toLowerCase();
      if (kycNormalizedStatus === 'accepted') setKycStatus('approved');
      else if (kycNormalizedStatus === 'pending') setKycStatus('in_progress');
      else if (kycNormalizedStatus === 'rejected') setKycStatus('rejected');
      else setKycStatus('not_submitted');

      setActiveVehicle(profileData?.activeVehicle || 'BIKE');

      const profileStatus = String(profileData?.status || '').toUpperCase();
      setOnlineStatus(profileStatus === 'ONLINE' || profileStatus === 'AVAILABLE');
    } catch (error) {
      const normalizedMessage = String(error?.message || '').toUpperCase();
      if (
        normalizedMessage.includes('AUTH_TOKEN_MISSING') ||
        normalizedMessage.includes('UNAUTHORIZED') ||
        normalizedMessage.includes('UNAUTHORISED')
      ) {
        navigation.replace('Login');
        return;
      }

      Alert.alert('Erreur', error.message || 'Chargement profil impossible.');
    }
  }, [navigation, setOnlineStatus]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      // Rafraîchit les données chaque fois qu'on revient sur cet écran
      loadProfileData();
    }, [loadProfileData])
  );

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [profile?.avatarUrl]);

  const avatarSourceUrl = profile?.avatarUrl || cachedAvatarUrl;

  useEffect(() => {
    let isMounted = true;

    const resolveSignedAvatar = async () => {
      const rawAvatarUrl = typeof avatarSourceUrl === 'string' ? avatarSourceUrl.trim() : '';

      if (!rawAvatarUrl) {
        if (isMounted) setSignedAvatarUrl(null);
        return;
      }

      if (
        !isAbsoluteUrl(rawAvatarUrl) ||
        !isS3Url(rawAvatarUrl) ||
        rawAvatarUrl.includes('X-Amz-Signature=')
      ) {
        if (isMounted) setSignedAvatarUrl(rawAvatarUrl);
        return;
      }

      try {
        const readUrl = await getSignedAvatarUrl(rawAvatarUrl);
        if (isMounted) setSignedAvatarUrl(readUrl);
      } catch (error) {
        console.error('Failed to generate signed avatar URL:', error);
        if (isMounted) setSignedAvatarUrl(rawAvatarUrl);
      }
    };

    void resolveSignedAvatar();

    return () => {
      isMounted = false;
    };
  }, [avatarSourceUrl]);

  const kycStatusConfig = {
    not_submitted: {
      label: 'Non soumis',
      color: '#F57C00',
      icon: 'alert-circle-outline',
      message: 'Ajoute tes documents pour activer toutes les fonctionnalités.',
      cta: 'Compléter mon KYC',
    },
    in_progress: {
      label: 'En cours de vérification',
      color: '#1E88E5',
      icon: 'progress-clock',
      message: 'Tes documents ont été reçus. Vérification en cours.',
      cta: 'Voir mes documents',
    },
    approved: {
      label: 'Vérifié',
      color: '#2E7D32',
      icon: 'check-decagram',
      message: 'Ton compte est validé. Tu as accès à toutes les missions.',
      cta: 'Voir les détails',
    },
    rejected: {
      label: 'Refusé',
      color: '#D32F2F',
      icon: 'close-octagon-outline',
      message: 'Un ou plusieurs documents sont invalides. Mets-les à jour.',
      cta: 'Corriger mes documents',
    },
  };

  const currentKyc = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;

  const handleInvite = async () => {
    try {
      await Share.share({
        title: 'Deviens livreur GoMile',
        message: `Rejoins-moi sur GoMile ! Utilise mon code "${referral?.code || 'GOMILE'}" pour un bonus.`,
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de partager.");
    }
  };

  return (
    <FormLayout title="MON ESPACE" showAvailabilityToggle>
      
      {/* --- CARTE D'IDENTITÉ & SCORING --- */}
      <View style={styles.idCard}>
        <View style={styles.cardTop}>
          <Image
            source={avatarLoadFailed ? DEFAULT_AVATAR : resolveAvatarSource(signedAvatarUrl || avatarSourceUrl)}
            style={styles.avatar}
            resizeMode="cover"
            onError={() => {
              console.error('Image failed to load for URL:', signedAvatarUrl || avatarSourceUrl); // Debug log
              setAvatarLoadFailed(true);
            }}
          />
          <View style={styles.scoringContainer}>
            <View style={styles.scoreBadge}>
              <MaterialCommunityIcons name="star" size={14} color={COLORS.primary} />
              <Text style={styles.scoreText}>{profile?.rating ?? 0}</Text>
            </View>
            <Text style={styles.tripsText}>{profile?.totalTrips ?? 0} courses</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.nameText}>
            {profile ? `${profile.firstName} ${profile.lastName}` : 'Profil GoMile'}
          </Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons 
                name={vehicleIcon}
                size={16} 
                color={COLORS.primary} 
            />
            <Text style={[styles.infoText, {color: COLORS.white}]}>
                En service : {vehicleLabel}
            </Text>
          </View>
          <Text style={styles.secondaryText}>{profile?.phone || 'Téléphone indisponible'}</Text>
          <Text style={styles.secondaryText}>{profile?.email || 'Email indisponible'}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.idText}>ID: {profile?.gomileCode || 'N/A'}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.statusText, isOnline ? styles.statusOnline : styles.statusOffline]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>
      </View>

      {/* --- CHANGEMENT DE VÉHICULE (Action rapide) --- */}
      <SectionTitle style={{ marginTop: 25 }}>Véhicule pour cette session</SectionTitle>
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdownTrigger}>
          <View style={styles.dropdownTriggerLeft}>
            <MaterialCommunityIcons name={vehicleIcon} size={18} color={COLORS.secondary} />
            <Text style={styles.dropdownTriggerText}>{vehicleLabel}</Text>
          </View>
        </View>
      </View>

      {/* --- KYC --- */}
      <SectionTitle style={{ marginTop: 25 }}>Vérification KYC</SectionTitle>
      <View style={styles.kycCard}>
        <View style={styles.kycHeader}>
          <View style={[styles.kycBadge, { backgroundColor: `${currentKyc.color}1A` }]}>
            <MaterialCommunityIcons name={currentKyc.icon} size={16} color={currentKyc.color} />
            <Text style={[styles.kycBadgeText, { color: currentKyc.color }]}>{currentKyc.label}</Text>
          </View>
        </View>

        <Text style={styles.kycMessage}>{currentKyc.message}</Text>

        <TouchableOpacity
          style={styles.kycCta}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('KYC')}
        >
          <Text style={styles.kycCtaText}>{currentKyc.cta}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* --- SECTION PARRAINAGE --- */}
      <TouchableOpacity style={styles.inviteBox} onPress={handleInvite}>
        <MaterialCommunityIcons name="gift-outline" size={28} color={COLORS.primary} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.inviteTitle}>Parrainez un ami</Text>
          <Text style={styles.inviteSub}>
            {referral?.code ? `Code: ${referral.code}` : 'Parrainage indisponible pour le moment'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.placeholder} />
      </TouchableOpacity>

      {/* --- MENU D'ACTIONS (Grille) --- */}
      <SectionTitle style={{ marginTop: 25 }}>Ma Logistique</SectionTitle>
      
      <View style={styles.menuGrid}>
        <MenuTile
          icon="shopping-outline"
          label="Boutique Équipement"
          onPress={() => Linking.openURL('https://store.pgn2vid.com/')}
        />
        <MenuTile 
          icon="cash-multiple" 
          label="Historique Gains" 
          onPress={() => navigation.navigate('Portefeuille')} 
        />
        <MenuTile
          icon="file-certificate-outline"
          label="Mes Documents"
          onPress={() => navigation.navigate('KYC')}
        />
        <MenuTile 
          icon="shield-lock-outline" 
          label="Sécurité" 
          onPress={() => {}} 
        />
      </View>

      {/* BOUTON DÉCONNEXION */}
      <GoMileButton 
        title="SE DÉCONNECTER" 
        outline
        style={styles.logoutBtn}
        onPress={async () => {
          if (useMissionStore.getState().missionQueue.length > 0) {
            Alert.alert('Mission en cours', 'Termine ta mission avant de te déconnecter.');
            return;
          }
          try {
            await logout();
          } catch {
            // we Ignore logout API errors and force local exit.
          } finally {
            clearCachedProfileAvatarUrl();
            navigation.replace('Login');
          }
        }}
      />
      
    </FormLayout>
  );
}

// Composant local pour les tuiles du menu
const MenuTile = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={24} color={COLORS.secondary} />
    </View>
    <Text style={styles.tileLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Carte d'Identité améliorée
  idCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  cardTop: { ...COMMON_STYLE_VALUES.rowBetween },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary },
  
  scoringContainer: { alignItems: 'flex-end' },
  scoreBadge: { 
    ...COMMON_STYLE_VALUES.rowCenter,
    backgroundColor: COLORS.white, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  scoreText: { fontWeight: '800', marginLeft: 4, color: COLORS.secondary, fontSize: 14 },
  tripsText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },

  cardBody: { marginTop: 15 },
  nameText: { color: COLORS.white, fontSize: 22, fontWeight: '900' },
  infoRow: { ...COMMON_STYLE_VALUES.rowCenter, marginTop: 5 },
  infoText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
  secondaryText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 3 },

  cardFooter: { 
    marginTop: 20, 
    ...COMMON_STYLE_VALUES.rowBetween,
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.1)', 
    paddingTop: 15,
  },
  idText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1 },
  statusBadge: { ...COMMON_STYLE_VALUES.rowCenter },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  dotOnline: { backgroundColor: '#8CE99A' },
  dotOffline: { backgroundColor: '#D5DCE6' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusOnline: { color: '#8CE99A' },
  statusOffline: { color: '#D5DCE6' },

  // Parrainage
  dropdownContainer: {
    marginTop: 10,
  },
  dropdownTrigger: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerLeft: {
    ...COMMON_STYLE_VALUES.rowCenter,
    gap: 10,
  },
  dropdownTriggerText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    ...COMMON_STYLE_VALUES.rowBetween,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: '#F8F9FF',
  },
  dropdownItemText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
  },
  kycCard: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },
  kycHeader: {
    ...COMMON_STYLE_VALUES.rowBetween,
  },
  kycBadge: {
    ...COMMON_STYLE_VALUES.rowCenter,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kycBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  kycMessage: {
    marginTop: 12,
    ...COMMON_STYLE_VALUES.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  kycCta: {
    marginTop: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 12,
    ...COMMON_STYLE_VALUES.rowBetween,
  },
  kycCtaText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  inviteBox: { 
    backgroundColor: COLORS.white, 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 15, 
    ...COMMON_STYLE_VALUES.rowCenter,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  inviteTitle: { fontWeight: 'bold', color: COLORS.secondary, fontSize: 15 },
  inviteSub: { color: COLORS.placeholder, fontSize: 12 },

  // Grille
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  tile: { 
    width: '48%', 
    backgroundColor: COLORS.white, 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  tileLabel: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: COLORS.secondary },

  logoutBtn: { marginTop: 20, borderColor: '#FF5252' },
  versionText: { textAlign: 'center', color: COLORS.placeholder, fontSize: 10, marginTop: 15, marginBottom: 20 }
});
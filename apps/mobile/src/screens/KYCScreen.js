import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/theme';
import GoMileButton from '../components/GoMileButton';
import { pickImageSource } from '../lib/media-picker';
import {
  getMyKycStatus,
  submitMyKyc,
  presignDocument,
  createMyDocument,
  deleteDocument,
  updateDriverProfile,
} from '../../lib/driver-client';
import { uploadFileToPresignedUrl } from '../../lib/upload-client';

// ── Amélioration 1 : PASSPORT comme alternative à CNI ─────────────────────────
// Chaque slot représente un emplacement logique dans le formulaire KYC.
// Le slot IDENTITY accepte CNI OU PASSPORT (un seul suffit).
const DOC_SLOTS = [
  {
    slot: 'IDENTITY',
    types: ['CNI', 'PASSPORT'],
    label: "Pièce d'identité",
    icon: 'card-account-details-outline',
    typeLabels: {
      CNI: "Carte nationale d'identité",
      PASSPORT: 'Passeport',
    },
  },
  {
    slot: 'DRIVING_LICENSE',
    types: ['DRIVING_LICENSE'],
    label: 'Permis de conduire',
    icon: 'steering',
    typeLabels: { DRIVING_LICENSE: 'Permis de conduire' },
  },
  {
    slot: 'REGISTRATION_CARD',
    types: ['REGISTRATION_CARD'],
    label: 'Carte grise',
    icon: 'car-info',
    typeLabels: { REGISTRATION_CARD: 'Carte grise' },
  },
  {
    slot: 'RIB',
    types: ['RIB'],
    label: 'Relevé bancaire (RIB)',
    icon: 'bank-outline',
    typeLabels: { RIB: 'Relevé bancaire' },
  },
  {
    slot: 'JUSTIFICATIF_DOMICILE',
    types: ['OTHER'],
    label: 'Justificatif de domicile',
    icon: 'home-outline',
    typeLabels: { OTHER: 'Justificatif de domicile (- 3 mois)' },
  },
];

const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    color: '#E65100',
    bg: '#FFF3E0',
    icon: 'file-document-edit-outline',
    title: 'KYC à compléter',
    subtitle: 'Téléverse tes documents pour activer toutes tes fonctionnalités GoMile.',
  },
  PENDING: {
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: 'clock-check-outline',
    title: 'Vérification en cours',
    subtitle: "Tes documents ont été reçus et sont en cours d'examen par notre équipe (sous 48h).",
  },
  ACCEPTED: {
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'check-decagram',
    title: 'Compte vérifié',
    subtitle: "Ton identité a été confirmée. Tu as accès à l'ensemble des missions GoMile.",
  },
  REJECTED: {
    color: '#B71C1C',
    bg: '#FFEBEE',
    icon: 'close-octagon-outline',
    title: 'Documents refusés',
    subtitle: "Certains documents n'ont pas été acceptés. Corrige-les et resoumets ta demande.",
  },
};

function inferContentType(uri) {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

// ── Amélioration 3 : 4 états visuels distincts par document ───────────────────
function DocStatusChip({ doc, isUploading }) {
  if (isUploading) {
    return (
      <View style={styles.chipRow}>
        <ActivityIndicator size={10} color={COLORS.secondary} />
        <Text style={[styles.chipText, { color: COLORS.secondary, marginLeft: 5 }]}>
          Envoi en cours…
        </Text>
      </View>
    );
  }
  if (!doc) {
    return (
      <View style={styles.chipRow}>
        <View style={[styles.chipDot, { backgroundColor: '#BDBDBD' }]} />
        <Text style={[styles.chipText, { color: COLORS.placeholder }]}>Non fourni</Text>
      </View>
    );
  }
  if (doc.verified) {
    return (
      <View style={styles.chipRow}>
        <MaterialCommunityIcons name="check-circle" size={13} color="#2E7D32" />
        <Text style={[styles.chipText, { color: '#2E7D32' }]}>Vérifié </Text>
      </View>
    );
  }
  if (doc.rejectionReason) {
    return (
      <View style={styles.chipRow}>
        <MaterialCommunityIcons name="close-circle" size={13} color="#B71C1C" />
        <Text style={[styles.chipText, { color: '#B71C1C' }]}>Refusé — à corriger</Text>
      </View>
    );
  }
  return (
    <View style={styles.chipRow}>
      <MaterialCommunityIcons name="clock-outline" size={13} color="#1565C0" />
      <Text style={[styles.chipText, { color: '#1565C0' }]}>En attente d'examen</Text>
    </View>
  );
}

export default function KYCScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});
  const [siret, setSiret] = useState('');
  const [savingSiret, setSavingSiret] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getMyKycStatus();
      setKycData(data);
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de charger le statut KYC.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveSiret = async () => {
    const value = siret.trim().replace(/\s/g, '');
    if (!value) return;
    if (!/^\d{14}$/.test(value)) {
      return Alert.alert('SIRET invalide', 'Le numéro SIRET doit contenir exactement 14 chiffres.');
    }
    setSavingSiret(true);
    try {
      await updateDriverProfile({ siret: value });
      Alert.alert('Enregistré', 'Numéro SIRET sauvegardé.');
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de sauvegarder le SIRET.');
    } finally {
      setSavingSiret(false);
    }
  };

  const rawStatus = String(kycData?.status || 'NOT_SUBMITTED').toUpperCase();
  const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.NOT_SUBMITTED;
  const documents = kycData?.documents || [];
  const canModify = rawStatus === 'NOT_SUBMITTED' || rawStatus === 'REJECTED';

  // Retourne le document uploadé pour un slot donné (vérifie tous les types du slot)
  const getDocForSlot = (slotDef) =>
    documents.find((d) => slotDef.types.includes(d.type)) ?? null;

  // ── Amélioration 4 : indicateur de progression ────────────────────────────
  const uploadedCount = DOC_SLOTS.filter((s) => getDocForSlot(s) !== null).length;
  const totalCount = DOC_SLOTS.length;
  const progressPct = uploadedCount / totalCount;
  const canSubmit = canModify && uploadedCount === totalCount;

  // ── Amélioration 1 : gestion du slot IDENTITY (CNI ou PASSPORT) ──────────
  const pickIdentityType = (existingDoc, onChosen) => {
    if (existingDoc) {
      // Remplace avec le même type par défaut, ou propose de changer
      Alert.alert(
        "Remplacer la pièce d'identité",
        'Veux-tu garder le même type ou changer ?',
        [
          { text: existingDoc.type === 'CNI' ? "Nouvelle CNI" : 'Nouveau passeport',
            onPress: () => onChosen(existingDoc.type) },
          { text: existingDoc.type === 'CNI' ? 'Passer au passeport' : 'Passer à la CNI',
            onPress: () => onChosen(existingDoc.type === 'CNI' ? 'PASSPORT' : 'CNI') },
          { text: 'Annuler', style: 'cancel' },
        ],
      );
    } else {
      Alert.alert(
        "Type de pièce d'identité",
        'Quel document veux-tu utiliser ?',
        [
          { text: "Carte nationale d'identité", onPress: () => onChosen('CNI') },
          { text: 'Passeport', onPress: () => onChosen('PASSPORT') },
          { text: 'Annuler', style: 'cancel' },
        ],
      );
    }
  };

  const handleUpload = async (slotDef) => {
    const existingDoc = getDocForSlot(slotDef);

    const doUpload = async (backendType) => {
      const uri = await pickImageSource();
      if (!uri) return;

      const contentType = inferContentType(uri);
      const ext = uri.split('.').pop() || 'jpg';
      const filename = `${backendType.toLowerCase()}_${Date.now()}.${ext}`;

      setUploading((prev) => ({ ...prev, [slotDef.slot]: true }));
      try {
        const { uploadUrl, fileUrl } = await presignDocument(filename, contentType);
        await uploadFileToPresignedUrl(uploadUrl, uri, contentType);
        if (existingDoc) {
          await deleteDocument(existingDoc.id).catch(() => {});
        }
        await createMyDocument(backendType, fileUrl);
        await load();
      } catch (err) {
        Alert.alert("Erreur d'upload", err?.message || 'Impossible d\'envoyer le document.');
      } finally {
        setUploading((prev) => ({ ...prev, [slotDef.slot]: false }));
      }
    };

    if (slotDef.types.length > 1) {
      pickIdentityType(existingDoc, doUpload);
    } else {
      doUpload(slotDef.types[0]);
    }
  };

  const handleDelete = (doc) => {
    Alert.alert(
      'Supprimer le document',
      'Ce document sera définitivement supprimé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc.id);
              await load();
            } catch (err) {
              Alert.alert('Erreur', err?.message || 'Impossible de supprimer.');
            }
          },
        },
      ],
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      'Soumettre pour vérification',
      'Tes documents seront transmis à notre équipe pour examen. Tu ne pourras plus les modifier pendant la vérification.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            setSubmitting(true);
            try {
              await submitMyKyc();
              await load();
            } catch (err) {
              Alert.alert('Erreur', err?.message || 'Impossible de soumettre.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VÉRIFICATION KYC</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={COLORS.secondary}
              colors={[COLORS.secondary]}
            />
          }
        >
          {/* ── Status banner ── */}
          <View style={[styles.statusBanner, {
            backgroundColor: statusCfg.bg,
            borderLeftColor: statusCfg.color,
          }]}>
            <View style={[styles.statusIconWrap, { backgroundColor: statusCfg.color + '22' }]}>
              <MaterialCommunityIcons name={statusCfg.icon} size={26} color={statusCfg.color} />
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={[styles.statusTitle, { color: statusCfg.color }]}>{statusCfg.title}</Text>
              <Text style={styles.statusSubtitle}>{statusCfg.subtitle}</Text>
            </View>
          </View>

          {/* ── Motif de refus global (niveau soumission) ── */}
          {rawStatus === 'REJECTED' && kycData?.latestSubmission?.rejectionReason && (
            <View style={styles.rejectionCard}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#B71C1C" style={{ marginTop: 1 }} />
              <Text style={styles.rejectionText}>
                Motif global : {kycData.latestSubmission.rejectionReason}
              </Text>
            </View>
          )}

          {/* ── Amélioration 4 : barre de progression ── */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Documents fournis</Text>
              <Text style={[styles.progressCount, uploadedCount === totalCount && { color: '#2E7D32' }]}>
                {uploadedCount} / {totalCount}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                {
                  width: `${progressPct * 100}%`,
                  backgroundColor: uploadedCount === totalCount ? '#2E7D32' : COLORS.secondary,
                },
              ]} />
            </View>
            {canModify && uploadedCount < totalCount && (
              <Text style={styles.progressHint}>
                {totalCount - uploadedCount} document{totalCount - uploadedCount > 1 ? 's' : ''} manquant{totalCount - uploadedCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* ── Documents section ── */}
          {/* ── Amélioration 5 : correction ciblée en mode REJECTED ── */}
          {rawStatus === 'REJECTED' && (
            <View style={styles.correctionBanner}>
              <MaterialCommunityIcons name="target" size={15} color="#B71C1C" />
              <Text style={styles.correctionBannerText}>
                Corrige en priorité les documents mis en évidence ci-dessous.
              </Text>
            </View>
          )}

          {/* ── Numéro SIRET ── */}
          <Text style={styles.sectionTitle}>Informations professionnelles</Text>
          <View style={styles.siretCard}>
            <Text style={styles.siretLabel}>Numéro SIRET</Text>
            <View style={styles.siretRow}>
              <TextInput
                style={styles.siretInput}
                value={siret}
                onChangeText={setSiret}
                placeholder="14 chiffres"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
                maxLength={17}
                editable={!savingSiret}
              />
              <TouchableOpacity
                style={[styles.siretBtn, (!siret.trim() || savingSiret) && styles.siretBtnDisabled]}
                onPress={handleSaveSiret}
                disabled={!siret.trim() || savingSiret}
                activeOpacity={0.8}
              >
                {savingSiret
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <MaterialCommunityIcons name="check" size={18} color={COLORS.white} />
                }
              </TouchableOpacity>
            </View>
            <Text style={styles.siretHint}>
              Nécessaire pour activer les paiements. Laisse vide si tu ne l'as pas encore.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Mes documents</Text>

          {DOC_SLOTS.map((slotDef) => {
            const doc = getDocForSlot(slotDef);
            const isUploading = !!uploading[slotDef.slot];
            const hasDoc = !!doc;
            const isVerified = doc?.verified;
            const isRejected = hasDoc && !isVerified && !!doc?.rejectionReason;

            // ── Amélioration 5 : mise en avant ciblée ──────────────────────
            // En mode REJECTED : les docs refusés ressortent, les autres sont atténués
            const isUrgent = rawStatus === 'REJECTED' && isRejected;
            const isDimmed = rawStatus === 'REJECTED' && hasDoc && !isRejected && !isVerified;

            const iconBg = isVerified
              ? '#E8F5E9'
              : isRejected
              ? '#FFEBEE'
              : hasDoc
              ? '#EEF2FF'
              : '#F5F5F5';

            const iconColor = isVerified
              ? '#2E7D32'
              : isRejected
              ? '#B71C1C'
              : hasDoc
              ? COLORS.secondary
              : COLORS.placeholder;

            // ── Amélioration 1 : label affiché selon le type réel uploadé ──
            const displayLabel = hasDoc && slotDef.typeLabels[doc.type]
              ? slotDef.typeLabels[doc.type]
              : slotDef.label;

            // En mode REJECTED, on autorise la réupload même des docs non-rejetés
            // pour que le livreur puisse améliorer la qualité si besoin
            const showActions = canModify;

            return (
              <View
                key={slotDef.slot}
                style={[
                  styles.docCard,
                  isUrgent && styles.docCardUrgent,
                  isDimmed && styles.docCardDimmed,
                ]}
              >
                {/* Indicateur d'urgence */}
                {isUrgent && (
                  <View style={styles.urgentBadge}>
                    <MaterialCommunityIcons name="alert" size={11} color={COLORS.white} />
                  </View>
                )}

                {/* Icône */}
                <View style={[styles.docIconWrap, { backgroundColor: iconBg }]}>
                  <MaterialCommunityIcons name={slotDef.icon} size={22} color={iconColor} />
                </View>

                {/* Infos */}
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{displayLabel}</Text>
                  {/* ── Amélioration 1 : badge "CNI ou Passeport" si slot multi-types et vide ── */}
                  {!hasDoc && slotDef.types.length > 1 && (
                    <Text style={styles.docAlternatives}>
                      {slotDef.types.map((t) => slotDef.typeLabels[t]).join(' ou ')}
                    </Text>
                  )}
                  <DocStatusChip doc={doc} isUploading={isUploading} />
                  {/* ── Amélioration 2 : motif de refus par document ── */}
                  {isRejected && doc.rejectionReason && (
                    <Text style={styles.docRejectionReason} numberOfLines={3}>
                      ↳ {doc.rejectionReason}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color={COLORS.secondary} />
                  ) : showActions ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          isUrgent
                            ? { backgroundColor: '#FFEBEE' }
                            : { backgroundColor: COLORS.secondary + '18' },
                        ]}
                        onPress={() => handleUpload(slotDef)}
                        hitSlop={6}
                      >
                        <MaterialCommunityIcons
                          name={hasDoc ? 'refresh' : 'upload-outline'}
                          size={18}
                          color={isUrgent ? '#B71C1C' : COLORS.secondary}
                        />
                      </TouchableOpacity>
                      {hasDoc && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#FFEBEE', marginTop: 8 }]}
                          onPress={() => handleDelete(doc)}
                          hitSlop={6}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#B71C1C" />
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <View style={[styles.actionBtn, { backgroundColor: '#F5F5F5' }]}>
                      <MaterialCommunityIcons name="lock-outline" size={18} color="#BDBDBD" />
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* ── Upload hint ── */}
          {canModify && (
            <Text style={styles.hint}>
              Formats acceptés : JPG, PNG, PDF · Photo nette, documents lisibles
            </Text>
          )}

          {/* ── Submit CTA ── */}
          {canModify && (
            <View style={styles.submitSection}>
              <GoMileButton
                title={rawStatus === 'REJECTED' ? 'Resoumettre pour vérification' : 'Soumettre pour vérification'}
                loading={submitting}
                onPress={canSubmit ? handleSubmit : undefined}
                style={!canSubmit ? styles.btnDisabled : undefined}
              />
              {!canSubmit && (
                <Text style={styles.submitHint}>
                  {totalCount - uploadedCount} document{totalCount - uploadedCount > 1 ? 's' : ''} manquant{totalCount - uploadedCount > 1 ? 's' : ''} avant de pouvoir soumettre.
                </Text>
              )}
            </View>
          )}

          {/* ── Pending info ── */}
          {rawStatus === 'PENDING' && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#1565C0" />
              <Text style={styles.infoBoxText}>
                Les modifications sont désactivées pendant la vérification en cours.
              </Text>
            </View>
          )}

          {/* ── Approved info ── */}
          {rawStatus === 'ACCEPTED' && (
            <View style={[styles.infoBox, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="shield-check" size={18} color="#2E7D32" />
              <Text style={[styles.infoBoxText, { color: '#2E7D32' }]}>
                Ton compte est entièrement vérifié. Aucune action requise.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backBtn: {
    width: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.placeholder,
    fontSize: 14,
  },

  // Content
  content: {
    padding: 20,
    paddingBottom: 48,
  },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    gap: 12,
  },
  statusIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  // Rejection reason (global, niveau soumission)
  rejectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 18,
  },

  // Amélioration 4 : barre de progression
  progressSection: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11,
    color: COLORS.placeholder,
    marginTop: 7,
  },

  // Amélioration 5 : bandeau correction ciblée
  correctionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 11,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  correctionBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#B71C1C',
    lineHeight: 17,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 22,
    marginBottom: 12,
  },

  // Document card
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Amélioration 5 : états urgence / atténué
  docCardUrgent: {
    borderColor: '#EF9A9A',
    borderWidth: 2,
    backgroundColor: '#FFFAFA',
  },
  docCardDimmed: {
    opacity: 0.55,
  },
  urgentBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B71C1C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  docIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 3,
  },
  // Amélioration 1 : alternatives CNI/Passeport
  docAlternatives: {
    fontSize: 11,
    color: COLORS.placeholder,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Amélioration 2 : motif de refus par document
  docRejectionReason: {
    fontSize: 11,
    color: '#B71C1C',
    marginTop: 5,
    lineHeight: 15,
  },

  // Action buttons
  docActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SIRET
  siretCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 4,
  },
  siretLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  siretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  siretInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#FAFAFA',
    letterSpacing: 1,
  },
  siretBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  siretBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  siretHint: {
    fontSize: 11,
    color: COLORS.placeholder,
    marginTop: 8,
    lineHeight: 15,
  },

  // Hint
  hint: {
    fontSize: 12,
    color: COLORS.placeholder,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
  },

  // Submit
  submitSection: {
    marginTop: 26,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  submitHint: {
    textAlign: 'center',
    color: COLORS.placeholder,
    fontSize: 12,
    marginTop: 10,
  },

  // Info box (pending / accepted)
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginTop: 22,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
});

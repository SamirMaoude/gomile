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
} from '../../lib/driver-client';
import { uploadFileToPresignedUrl } from '../../lib/upload-client';

const DOC_TYPES = [
  { type: 'CNI', label: "Carte nationale d'identité", icon: 'card-account-details-outline' },
  { type: 'DRIVING_LICENSE', label: 'Permis de conduire', icon: 'steering' },
  { type: 'REGISTRATION_CARD', label: 'Carte grise', icon: 'car-info' },
  { type: 'RIB', label: 'Relevé bancaire (RIB)', icon: 'bank-outline' },
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
    subtitle: 'Tes documents ont été reçus et sont en cours d\'examen par notre équipe (sous 48h).',
  },
  ACCEPTED: {
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'check-decagram',
    title: 'Compte vérifié',
    subtitle: 'Ton identité a été confirmée. Tu as accès à l\'ensemble des missions GoMile.',
  },
  REJECTED: {
    color: '#B71C1C',
    bg: '#FFEBEE',
    icon: 'close-octagon-outline',
    title: 'Documents refusés',
    subtitle: 'Certains documents n\'ont pas été acceptés. Corrige-les et resoumets ta demande.',
  },
};

function inferContentType(uri) {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

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
        <Text style={[styles.chipText, { color: '#2E7D32' }]}>Vérifié</Text>
      </View>
    );
  }
  if (doc.rejectionReason) {
    return (
      <View style={styles.chipRow}>
        <MaterialCommunityIcons name="close-circle" size={13} color="#B71C1C" />
        <Text style={[styles.chipText, { color: '#B71C1C' }]}>Refusé</Text>
      </View>
    );
  }
  return (
    <View style={styles.chipRow}>
      <MaterialCommunityIcons name="clock-outline" size={13} color="#1565C0" />
      <Text style={[styles.chipText, { color: '#1565C0' }]}>En attente</Text>
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

  const rawStatus = String(kycData?.status || 'NOT_SUBMITTED').toUpperCase();
  const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.NOT_SUBMITTED;
  const documents = kycData?.documents || [];
  const canModify = rawStatus === 'NOT_SUBMITTED' || rawStatus === 'REJECTED';
  const canSubmit = canModify && documents.length > 0;

  const getDoc = (type) => documents.find((d) => d.type === type) || null;

  const handleUpload = async (docType) => {
    const uri = await pickImageSource();
    if (!uri) return;

    const contentType = inferContentType(uri);
    const ext = uri.split('.').pop() || 'jpg';
    const filename = `${docType.toLowerCase()}_${Date.now()}.${ext}`;

    setUploading((prev) => ({ ...prev, [docType]: true }));
    try {
      const { uploadUrl, fileUrl } = await presignDocument(filename, contentType);
      await uploadFileToPresignedUrl(uploadUrl, uri, contentType);

      const existing = getDoc(docType);
      if (existing) {
        await deleteDocument(existing.id).catch(() => {});
      }

      await createMyDocument(docType, fileUrl);
      await load();
    } catch (err) {
      Alert.alert('Erreur d\'upload', err?.message || 'Impossible d\'envoyer le document.');
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }));
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

          {/* ── Rejection reason from admin ── */}
          {rawStatus === 'REJECTED' && kycData?.latestSubmission?.rejectionReason && (
            <View style={styles.rejectionCard}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#B71C1C" style={{ marginTop: 1 }} />
              <Text style={styles.rejectionText}>
                Motif : {kycData.latestSubmission.rejectionReason}
              </Text>
            </View>
          )}

          {/* ── Documents section ── */}
          <Text style={styles.sectionTitle}>Mes documents</Text>

          {DOC_TYPES.map((def) => {
            const doc = getDoc(def.type);
            const isUploading = !!uploading[def.type];
            const hasDoc = !!doc;
            const isVerified = doc?.verified;
            const isRejected = hasDoc && !isVerified && !!doc?.rejectionReason;

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

            return (
              <View key={def.type} style={styles.docCard}>
                {/* Icon */}
                <View style={[styles.docIconWrap, { backgroundColor: iconBg }]}>
                  <MaterialCommunityIcons name={def.icon} size={22} color={iconColor} />
                </View>

                {/* Info */}
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{def.label}</Text>
                  <DocStatusChip doc={doc} isUploading={isUploading} />
                  {isRejected && doc.rejectionReason && (
                    <Text style={styles.docRejectionReason} numberOfLines={2}>
                      {doc.rejectionReason}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color={COLORS.secondary} />
                  ) : canModify ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.secondary + '18' }]}
                        onPress={() => handleUpload(def.type)}
                        hitSlop={6}
                      >
                        <MaterialCommunityIcons
                          name={hasDoc ? 'refresh' : 'upload-outline'}
                          size={18}
                          color={COLORS.secondary}
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
                  Ajoute au moins un document pour soumettre ta demande.
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

  // Rejection reason (from admin)
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

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 26,
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
    marginBottom: 5,
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
  docRejectionReason: {
    fontSize: 11,
    color: '#B71C1C',
    marginTop: 4,
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

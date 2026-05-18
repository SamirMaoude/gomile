import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//  composants factorisés
import FormLayout from '../components/FormLayout';
import BalanceCard from '../components/BalanceCard';
import SectionTitle from '../components/SectionTitle';
import GoMileButton from '../components/GoMileButton';

// Thème et constantes
import { COLORS, SIZES } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import {
  getWallet,
  getWalletEntries,
  requestWithdrawal,
} from '../../lib/driver-client';

export default function WalletScreen({ navigation }) {
  const [wallet, setWallet] = useState({ balance: 0, pendingAmount: 0, currency: 'EUR' });
  const [entries, setEntries] = useState([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const [walletData, walletEntries] = await Promise.all([
        getWallet(),
        getWalletEntries(),
      ]);
      setWallet(walletData || { balance: 0, pendingAmount: 0, currency: 'EUR' });
      setEntries(walletEntries || []);
    } catch (error) {
      alert(error.message || 'Impossible de charger le portefeuille.');
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const transactions = useMemo(
    () =>
      entries.map((item) => ({
        id: item.id,
        type: item.type === 'CREDIT' ? 'Crédit mission' : 'Débit',
        date: new Date(item.createdAt).toLocaleString('fr-FR'),
        amount: `${item.type === 'CREDIT' ? '+' : '-'}${item.amount}`,
        status: item.status,
      })),
    [entries],
  );

  const handleCashOut = () => {
    setWithdrawalAmount('');
    setShowWithdrawalModal(true);
  };

  const handleConfirmWithdrawal = async () => {
    const amount = Number(withdrawalAmount || 0);
    const balance = Number(wallet.balance || 0);

    if (!withdrawalAmount.trim()) {
      return Alert.alert('Montant requis', 'Veuillez entrer un montant.');
    }

    if (amount <= 0) {
      return Alert.alert('Montant invalide', 'Le montant doit être positif.');
    }

    if (amount > balance) {
      return Alert.alert(
        'Solde insuffisant',
        `Vous ne pouvez pas retirer plus de ${balance.toFixed(2)} €.`
      );
    }

    setIsProcessing(true);
    try {
      await requestWithdrawal(amount);
      Alert.alert('Succès', `Demande de virement de ${amount.toFixed(2)} € envoyée.`);
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      await loadWallet();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Demande de virement impossible.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setQuickAmount = (percentage) => {
    const amount = (Number(wallet.balance || 0) * percentage).toFixed(2);
    setWithdrawalAmount(amount);
  };

  return (
    <FormLayout title="MON PORTEFEUILLE" showAvailabilityToggle>
      
      {/* --- MODAL DE RETRAIT --- */}
      <Modal
        visible={showWithdrawalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithdrawalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <ScrollView 
              scrollEnabled={true}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Demander un virement</Text>
                  <TouchableOpacity
                    onPress={() => setShowWithdrawalModal(false)}
                    disabled={isProcessing}
                  >
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.balanceInfo}>
                  Solde disponible: <Text style={styles.balanceBold}>{Number(wallet.balance || 0).toFixed(2)} €</Text>
                </Text>

                {/* --- CHAMP DE SAISIE --- */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Montant à retirer</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0,00"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      editable={!isProcessing}
                      value={withdrawalAmount}
                      onChangeText={setWithdrawalAmount}
                    />
                    <Text style={styles.currencySymbol}>€</Text>
                  </View>
                </View>

                {/* --- BOUTONS RAPIDES --- */}
                <View style={styles.quickButtonsContainer}>
                  <Text style={styles.quickButtonsLabel}>Montants rapides</Text>
                  <View style={styles.quickButtonsGrid}>
                    <QuickAmountButton
                      label="25%"
                      percentage={0.25}
                      onPress={() => setQuickAmount(0.25)}
                      disabled={isProcessing}
                      balance={Number(wallet.balance || 0)}
                    />
                    <QuickAmountButton
                      label="50%"
                      percentage={0.5}
                      onPress={() => setQuickAmount(0.5)}
                      disabled={isProcessing}
                      balance={Number(wallet.balance || 0)}
                    />
                    <QuickAmountButton
                      label="75%"
                      percentage={0.75}
                      onPress={() => setQuickAmount(0.75)}
                      disabled={isProcessing}
                      balance={Number(wallet.balance || 0)}
                    />
                    <QuickAmountButton
                      label="100%"
                      percentage={1}
                      onPress={() => setQuickAmount(1)}
                      disabled={isProcessing}
                      balance={Number(wallet.balance || 0)}
                    />
                  </View>
                </View>

                {/* --- BOUTONS D'ACTION --- */}
                <View style={styles.actionButtons}>
                  <GoMileButton
                    title="ANNULER"
                    outline
                    type="secondary"
                    style={styles.cancelBtn}
                    onPress={() => setShowWithdrawalModal(false)}
                    disabled={isProcessing}
                  />
                  <GoMileButton
                    title={isProcessing ? "TRAITEMENT..." : "CONFIRMER"}
                    style={styles.confirmBtn}
                    onPress={handleConfirmWithdrawal}
                    disabled={isProcessing || !withdrawalAmount.trim()}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      
      {/* --- CARTE DE SOLDE (Composant réutilisé) --- */}
      <BalanceCard 
        amount={String(wallet.balance || 0)} 
        onAction={handleCashOut} 
      />

      <View style={styles.pendingCard}>
        <Text style={styles.pendingLabel}>Montant en attente</Text>
        <Text style={styles.pendingValue}>
          {Number(wallet.pendingAmount || 0).toFixed(2)} {wallet.currency || 'EUR'}
        </Text>
      </View>


      {/* --- HISTORIQUE DES TRANSACTIONS --- */}
      <SectionTitle style={{ marginTop: 25 }}>Dernières activités</SectionTitle>
      
      <View style={styles.historyList}>
        {transactions.map((item) => (
          <TransactionItem key={item.id} item={item} />
        ))}
      </View>

      {/* --- BOUTON VOIR PLUS --- */}
      <GoMileButton 
        title="VOIR TOUT L'HISTORIQUE" 
        outline
        type="secondary"
        style={styles.fullHistoryBtn}
        onPress={loadWallet}
      />

    </FormLayout>
  );
}

// Composant local pour les lignes de transaction
const TransactionItem = ({ item }) => (
  <View style={styles.transactionRow}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons 
        name={item.amount.startsWith('+') ? "arrow-bottom-left" : "bank-transfer-out"} 
        size={20} 
        color={item.amount.startsWith('+') ? "#4CAF50" : COLORS.secondary} 
      />
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transType}>{item.type}</Text>
      <Text style={styles.transDate}>{item.date}</Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={[
        styles.amountText, 
        { color: item.amount.startsWith('+') ? "#4CAF50" : COLORS.secondary }
      ]}>
        {item.amount} €
      </Text>
      <Text style={styles.transStatus}>{item.status}</Text>
    </View>
  </View>
);

// Composant pour les boutons de montants rapides
const QuickAmountButton = ({ label, percentage, onPress, disabled, balance }) => {
  const amount = (balance * percentage).toFixed(2);
  
  return (
    <TouchableOpacity
      style={[styles.quickAmountBtn, disabled && styles.quickAmountBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.quickAmountLabel}>{label}</Text>
      <Text style={styles.quickAmountValue}>{amount} €</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '85%',
    minHeight: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  balanceInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  balanceBold: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  
  // --- INPUT GROUP ---
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 8,
  },
  
  // --- QUICK BUTTONS ---
  quickButtonsContainer: {
    marginBottom: 24,
  },
  quickButtonsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountBtnDisabled: {
    opacity: 0.5,
    borderColor: '#CCC',
  },
  quickAmountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickAmountValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 4,
  },
  
  // --- ACTION BUTTONS ---
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
  
  // Section Bonus
  pendingCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 14,
    ...COMMON_STYLE_VALUES.rowBetween,
  },
  pendingLabel: {
    ...COMMON_STYLE_VALUES.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingValue: {
    ...COMMON_STYLE_VALUES.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  bonusContainer: {
    backgroundColor: COLORS.white,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bonusHeader: { ...COMMON_STYLE_VALUES.rowBetween, marginBottom: 10 },
  bonusTitle: { fontWeight: '800', ...COMMON_STYLE_VALUES.textSecondary },
  bonusValue: { color: COLORS.primary, fontWeight: 'bold' },
  
  progressBarBg: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  bonusSub: { fontSize: 11, ...COMMON_STYLE_VALUES.textMuted, marginTop: 8, textAlign: 'center' },

  // Historique
  historyList: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  transactionRow: { 
    ...COMMON_STYLE_VALUES.rowCenter,
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transType: { fontWeight: '700', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 14 },
  transDate: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, marginTop: 2 },
  
  transactionAmount: { alignItems: 'flex-end' },
  amountText: { fontWeight: '900', fontSize: 15 },
  transStatus: { fontSize: 10, ...COMMON_STYLE_VALUES.textMuted, marginTop: 2 },

  fullHistoryBtn: { marginTop: 15, marginBottom: 30 }
});
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
    (async () => {
      try {
        const amount = Number(wallet.balance || 0);
        if (amount <= 0) {
          return alert('Solde insuffisant pour demander un virement.');
        }
        await requestWithdrawal(amount);
        alert('Demande de virement envoyée.');
        await loadWallet();
      } catch (error) {
        alert(error.message || 'Demande de virement impossible.');
      }
    })();
  };

  return (
    <FormLayout title="MON PORTEFEUILLE" showAvailabilityToggle>
      
      {/* --- CARTE DE SOLDE (Composant réutilisé) --- */}
      <BalanceCard 
        amount={String(wallet.balance || 0)} 
        onAction={handleCashOut} 
      />


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

const styles = StyleSheet.create({
  // Section Bonus
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
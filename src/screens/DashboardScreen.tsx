import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { theme, gradients } from '../theme/theme';

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentExpenses: any[];
}

const dailyTips = [
  "💡 Track every expense, no matter how small - they add up!",
  "🎯 Set a weekly spending limit and stick to it.",
  "📱 Use apps wisely - cancel subscriptions you don't use.",
  "🍜 Cook at home more often to save on food costs.",
  "📚 Buy used textbooks or borrow from the library.",
  "🚗 Use public transport or walk when possible.",
  "💰 Look for student discounts everywhere you shop.",
  "🎉 Set aside fun money so you don't feel deprived."
];

const categoryEmojis: { [key: string]: string } = {
  'Food': '🍜',
  'Transport': '🚗',
  'Data': '📱',
  'Books': '📚',
  'Hangout': '🎉',
  'Other': '💳'
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentExpenses: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyTip] = useState(() => {
    const today = new Date().getDate();
    return dailyTips[today % dailyTips.length];
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    
    // Get total income
    const { data: incomes } = await supabase
      .from('incomes')
      .select('amount, frequency')
      .eq('user_id', user.id);

    // Get total expenses for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category, description, date')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate monthly income
    let monthlyIncome = 0;
    incomes?.forEach(income => {
      if (income.frequency === 'monthly') {
        monthlyIncome += income.amount;
      } else if (income.frequency === 'weekly') {
        monthlyIncome += income.amount * 4.33;
      } else {
        monthlyIncome += income.amount;
      }
    });

    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    
    setData({
      totalIncome: monthlyIncome,
      totalExpenses,
      balance: monthlyIncome - totalExpenses,
      recentExpenses: expenses || []
    });
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#F0FDFA', '#E6FFFA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Title style={styles.welcomeTitle}>Welcome back! 👋</Title>
            <Paragraph style={styles.subtitle}>Here's your budget overview</Paragraph>
          </View>

          {/* Daily Tip */}
          <Card style={styles.tipCard}>
            <Card.Content style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
                <Text style={styles.tipText}>{dailyTip}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Budget Overview Cards */}
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, styles.incomeCard]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-up" size={24} color="#10B981" />
                  <Text style={styles.statLabel}>Monthly Income</Text>
                </View>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  ₦{data.totalIncome.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, styles.expenseCard]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-down" size={24} color="#EF4444" />
                  <Text style={styles.statLabel}>Monthly Expenses</Text>
                </View>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  ₦{data.totalExpenses.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, styles.balanceCard]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons 
                    name="wallet" 
                    size={24} 
                    color={data.balance >= 0 ? '#14B8A6' : '#EF4444'} 
                  />
                  <Text style={styles.statLabel}>Balance</Text>
                </View>
                <Text style={[
                  styles.statValue, 
                  { color: data.balance >= 0 ? '#14B8A6' : '#EF4444' }
                ]}>
                  ₦{data.balance.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Recent Expenses */}
          <Card style={styles.recentCard}>
            <Card.Content>
              <Title style={styles.recentTitle}>Recent Expenses</Title>
              {data.recentExpenses.length > 0 ? (
                data.recentExpenses.map((expense, index) => (
                  <View key={index} style={styles.expenseItem}>
                    <View style={styles.expenseLeft}>
                      <Text style={styles.expenseEmoji}>
                        {categoryEmojis[expense.category] || '💳'}
                      </Text>
                      <View style={styles.expenseDetails}>
                        <Text style={styles.expenseCategory}>{expense.category}</Text>
                        {expense.description && (
                          <Text style={styles.expenseDescription}>
                            {expense.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>-₦{expense.amount}</Text>
                      <Text style={styles.expenseDate}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No expenses recorded yet. Start tracking your spending! 💰
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tipCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tipContent: {
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
  },
  incomeCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  expenseCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  balanceCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statContent: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recentCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
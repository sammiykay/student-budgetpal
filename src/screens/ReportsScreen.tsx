import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

const screenWidth = Dimensions.get('window').width;

interface ExpenseData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const categoryColors: { [key: string]: string } = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Data': '#45B7D1',
  'Books': '#96CEB4',
  'Hangout': '#FFEAA7',
  'Other': '#DDA0DD'
};

export default function ReportsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user]);

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);

    // Get current month data
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get expenses for current month
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    // Get income data
    const { data: incomes } = await supabase
      .from('incomes')
      .select('amount, frequency')
      .eq('user_id', user.id);

    // Calculate category totals
    const categoryTotals: { [key: string]: number } = {};
    expenses?.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const expenseChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      amount,
      color: categoryColors[category] || '#DDA0DD',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

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

    const monthlyExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    setExpenseData(expenseChartData);
    setTotalIncome(monthlyIncome);
    setTotalExpenses(monthlyExpenses);
    setLoading(false);
  };

  const exportToPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; }
            .expenses { margin-top: 30px; }
            .expense-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BudgetPal Student Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value" style="color: #10B981;">₦${totalIncome.toLocaleString()}</div>
              <div>Total Income</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #EF4444;">₦${totalExpenses.toLocaleString()}</div>
              <div>Total Expenses</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: ${totalIncome - totalExpenses >= 0 ? '#14B8A6' : '#EF4444'};">₦${(totalIncome - totalExpenses).toLocaleString()}</div>
              <div>Net Balance</div>
            </div>
          </div>
          
          <div class="expenses">
            <h2>Expenses by Category</h2>
            ${expenseData.map(item => `
              <div class="expense-item">
                <span>${item.name}</span>
                <span>₦${item.amount.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
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
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Title style={styles.title}>Budget Reports</Title>
            <Button
              mode="contained"
              onPress={exportToPDF}
              style={styles.exportButton}
              icon="download"
            >
              Export PDF
            </Button>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <Card style={[styles.summaryCard, styles.incomeCard]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  ₦{totalIncome.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, styles.expenseCard]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                  ₦{totalExpenses.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, styles.balanceCard]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Net Balance</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: totalIncome - totalExpenses >= 0 ? '#14B8A6' : '#EF4444' }
                ]}>
                  ₦{(totalIncome - totalExpenses).toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Expense Categories Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Expenses by Category</Title>
              {expenseData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={expenseData}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                  
                  <View style={styles.categoryList}>
                    {expenseData.map((item, index) => (
                      <View key={index} style={styles.categoryItem}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryAmount}>₦{item.amount.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyText}>No expenses recorded for this month 📊</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exportButton: {
    borderRadius: 12,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 12,
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
  summaryContent: {
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  chartContainer: {
    alignItems: 'center',
  },
  categoryList: {
    marginTop: 20,
    width: '100%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderRadius: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
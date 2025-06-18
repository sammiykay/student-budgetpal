import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { theme, gradients } from '../theme/theme';

const expenseCategories = [
  { name: 'Food', emoji: '🍜' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Data', emoji: '📱' },
  { name: 'Books', emoji: '📚' },
  { name: 'Hangout', emoji: '🎉' },
  { name: 'Other', emoji: '💳' },
];

const incomeFrequencies = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expense');
  const [loading, setLoading] = useState(false);

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Income form state
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeFrequency, setIncomeFrequency] = useState('monthly');

  const resetExpenseForm = () => {
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  };

  const resetIncomeForm = () => {
    setIncomeTitle('');
    setIncomeAmount('');
    setIncomeFrequency('monthly');
  };

  const handleExpenseSubmit = async () => {
    if (!user || !expenseAmount || !expenseCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
        date: expenseDate
      });

    if (error) {
      Alert.alert('Error', 'Failed to add expense');
    } else {
      Alert.alert('Success', 'Expense added successfully! 🎉');
      resetExpenseForm();
    }

    setLoading(false);
  };

  const handleIncomeSubmit = async () => {
    if (!user || !incomeTitle || !incomeAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('incomes')
      .insert({
        user_id: user.id,
        title: incomeTitle,
        amount: parseFloat(incomeAmount),
        frequency: incomeFrequency
      });

    if (error) {
      Alert.alert('Error', 'Failed to add income');
    } else {
      Alert.alert('Success', 'Income added successfully! 💰');
      resetIncomeForm();
    }

    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#F0FDFA', '#E6FFFA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Title style={styles.title}>Add Transaction</Title>
            <Paragraph style={styles.subtitle}>Keep track of your money flow</Paragraph>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={[
                {
                  value: 'expense',
                  label: 'Add Expense',
                  icon: 'trending-down',
                },
                {
                  value: 'income',
                  label: 'Add Income',
                  icon: 'trending-up',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Forms */}
          <Card style={styles.formCard}>
            <Card.Content style={styles.formContent}>
              {activeTab === 'expense' ? (
                <View style={styles.form}>
                  {/* Amount */}
                  <TextInput
                    label="Amount (₦)"
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Icon icon="currency-usd" />}
                  />

                  {/* Category */}
                  <Text style={styles.sectionLabel}>Category</Text>
                  <View style={styles.categoryGrid}>
                    {expenseCategories.map(category => (
                      <TouchableOpacity
                        key={category.name}
                        onPress={() => setExpenseCategory(category.name)}
                        style={[
                          styles.categoryButton,
                          expenseCategory === category.name && styles.categoryButtonSelected
                        ]}
                      >
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                        <Text style={[
                          styles.categoryText,
                          expenseCategory === category.name && styles.categoryTextSelected
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Description */}
                  <TextInput
                    label="Description (Optional)"
                    value={expenseDescription}
                    onChangeText={setExpenseDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    left={<TextInput.Icon icon="text" />}
                  />

                  {/* Date */}
                  <TextInput
                    label="Date"
                    value={expenseDate}
                    onChangeText={setExpenseDate}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar" />}
                  />

                  <Button
                    mode="contained"
                    onPress={handleExpenseSubmit}
                    disabled={loading || !expenseAmount || !expenseCategory}
                    style={[styles.submitButton, styles.expenseButton]}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      'Add Expense'
                    )}
                  </Button>
                </View>
              ) : (
                <View style={styles.form}>
                  {/* Title */}
                  <TextInput
                    label="Income Source"
                    value={incomeTitle}
                    onChangeText={setIncomeTitle}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Part-time job, Allowance, Scholarship"
                  />

                  {/* Amount */}
                  <TextInput
                    label="Amount (₦)"
                    value={incomeAmount}
                    onChangeText={setIncomeAmount}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Icon icon="currency-usd" />}
                  />

                  {/* Frequency */}
                  <Text style={styles.sectionLabel}>Frequency</Text>
                  <View style={styles.frequencyGrid}>
                    {incomeFrequencies.map(freq => (
                      <TouchableOpacity
                        key={freq.value}
                        onPress={() => setIncomeFrequency(freq.value)}
                        style={[
                          styles.frequencyButton,
                          incomeFrequency === freq.value && styles.frequencyButtonSelected
                        ]}
                      >
                        <Text style={[
                          styles.frequencyText,
                          incomeFrequency === freq.value && styles.frequencyTextSelected
                        ]}>
                          {freq.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleIncomeSubmit}
                    disabled={loading || !incomeTitle || !incomeAmount}
                    style={[styles.submitButton, styles.incomeButton]}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      'Add Income'
                    )}
                  </Button>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  segmentedButtons: {
    backgroundColor: '#F3F4F6',
  },
  formCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  formContent: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  categoryButtonSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#EF4444',
  },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  frequencyTextSelected: {
    color: '#10B981',
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  expenseButton: {
    backgroundColor: '#EF4444',
  },
  incomeButton: {
    backgroundColor: '#10B981',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
import React, { useState, useEffect } from 'react';
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
  Modal,
  Portal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

interface Goal {
  id: string;
  goal_title: string;
  target_amount: number;
  current_amount: number;
  completed: boolean;
  created_at: string;
}

const motivationalQuotes = [
  "💪 Small steps lead to big achievements!",
  "🌟 Every naira saved brings you closer to your goal!",
  "🚀 You're building your financial future!",
  "💎 Discipline today, freedom tomorrow!",
  "🎯 Stay focused, you've got this!"
];

export default function GoalsScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Form state
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const [motivationalQuote] = useState(() => {
    const today = new Date().getDate();
    return motivationalQuotes[today % motivationalQuotes.length];
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  const handleAddGoal = async () => {
    if (!user || !goalTitle || !targetAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_title: goalTitle,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        completed: false
      });

    if (!error) {
      setGoalTitle('');
      setTargetAmount('');
      setShowAddModal(false);
      loadGoals();
      Alert.alert('Success', 'Goal created successfully! 🎯');
    } else {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleAddToGoal = async () => {
    if (!addAmount || !selectedGoal) return;

    const newAmount = selectedGoal.current_amount + parseFloat(addAmount);
    const isCompleted = newAmount >= selectedGoal.target_amount;

    const { error } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        completed: isCompleted
      })
      .eq('id', selectedGoal.id);

    if (!error) {
      setAddAmount('');
      setShowAddMoneyModal(false);
      setSelectedGoal(null);
      loadGoals();
      if (isCompleted) {
        Alert.alert('Congratulations! 🎉', 'You\'ve reached your goal!');
      } else {
        Alert.alert('Success', 'Amount added to goal! 💰');
      }
    } else {
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.goal_title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('goals')
              .delete()
              .eq('id', goal.id);

            if (!error) {
              loadGoals();
            } else {
              Alert.alert('Error', 'Failed to delete goal');
            }
          }
        }
      ]
    );
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(current / target, 1);
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
            <Title style={styles.title}>Financial Goals</Title>
            <Paragraph style={styles.subtitle}>Save smart, achieve your dreams</Paragraph>
          </View>

          {/* Motivational Quote */}
          <Card style={styles.quoteCard}>
            <Card.Content style={styles.quoteContent}>
              <Text style={styles.quoteText}>{motivationalQuote}</Text>
            </Card.Content>
          </Card>

          {/* Add Goal Button */}
          <Button
            mode="contained"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            icon="plus"
          >
            Set New Goal
          </Button>

          {/* Goals List */}
          <View style={styles.goalsContainer}>
            {goals.length > 0 ? (
              goals.map((goal, index) => {
                const progress = getProgressPercentage(goal.current_amount, goal.target_amount);

                return (
                  <Card
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      goal.completed && styles.completedGoalCard
                    ]}
                  >
                    <Card.Content style={styles.goalContent}>
                      <View style={styles.goalHeader}>
                        <View style={styles.goalInfo}>
                          <View style={styles.goalIcon}>
                            {goal.completed ? (
                              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            ) : (
                              <Ionicons name="target" size={24} color="#14B8A6" />
                            )}
                          </View>
                          <View style={styles.goalDetails}>
                            <Text style={styles.goalTitle}>{goal.goal_title}</Text>
                            <Text style={styles.goalAmount}>
                              ₦{goal.current_amount.toLocaleString()} of ₦{goal.target_amount.toLocaleString()}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.goalActions}>
                          {!goal.completed && (
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedGoal(goal);
                                setShowAddMoneyModal(true);
                              }}
                              style={styles.actionButton}
                            >
                              <Ionicons name="add" size={20} color="#14B8A6" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteGoal(goal)}
                            style={styles.actionButton}
                          >
                            <Ionicons name="trash" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressInfo}>
                          <Text style={styles.progressText}>
                            {(progress * 100).toFixed(0)}% Complete
                          </Text>
                          <Text style={styles.remainingText}>
                            ₦{(goal.target_amount - goal.current_amount).toLocaleString()} remaining
                          </Text>
                        </View>
                        <Progress.Bar
                          progress={progress}
                          width={null}
                          height={8}
                          color={goal.completed ? '#10B981' : '#14B8A6'}
                          unfilledColor="#E5E7EB"
                          borderWidth={0}
                          borderRadius={4}
                          style={styles.progressBar}
                        />
                      </View>

                      {goal.completed && (
                        <View style={styles.completedBanner}>
                          <Text style={styles.completedText}>
                            🎉 Congratulations! Goal achieved!
                          </Text>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="target" size={64} color="#D1D5DB" />
                <Title style={styles.emptyTitle}>No goals set yet</Title>
                <Paragraph style={styles.emptyText}>
                  Start by setting your first financial goal!
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => setShowAddModal(true)}
                  style={styles.emptyButton}
                >
                  Set Your First Goal
                </Button>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Goal Modal */}
        <Portal>
          <Modal
            visible={showAddModal}
            onDismiss={() => setShowAddModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title style={styles.modalTitle}>Set New Goal</Title>
                
                <TextInput
                  label="Goal Title"
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  mode="outlined"
                  style={styles.modalInput}
                  placeholder="e.g., New Laptop, Emergency Fund"
                />
                
                <TextInput
                  label="Target Amount (₦)"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Icon icon="currency-usd" />}
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAddModal(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddGoal}
                    style={styles.modalButton}
                  >
                    Create Goal
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>

          {/* Add Money Modal */}
          <Modal
            visible={showAddMoneyModal}
            onDismiss={() => setShowAddMoneyModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title style={styles.modalTitle}>Add to Goal</Title>
                <Paragraph style={styles.modalSubtitle}>
                  {selectedGoal?.goal_title}
                </Paragraph>
                
                <TextInput
                  label="Amount to Add (₦)"
                  value={addAmount}
                  onChangeText={setAddAmount}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Icon icon="currency-usd" />}
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAddMoneyModal(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddToGoal}
                    style={styles.modalButton}
                  >
                    Add Amount
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
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
  quoteCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  quoteContent: {
    padding: 16,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
  goalsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
  },
  completedGoalCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  goalContent: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    width: '100%',
  },
  completedBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
  },
});
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  List,
  Divider,
  Modal,
  Portal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account Deleted',
      'This feature will be implemented in a future update.',
      [{ text: 'OK' }]
    );
    setShowDeleteModal(false);
  };

  return (
    <LinearGradient
      colors={['#F0FDFA', '#E6FFFA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Title style={styles.title}>Settings</Title>
            <Paragraph style={styles.subtitle}>Manage your account and preferences</Paragraph>
          </View>

          {/* Profile Section */}
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View style={styles.profileInfo}>
                  <Title style={styles.profileTitle}>Profile</Title>
                  <Paragraph style={styles.profileEmail}>{user?.email}</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* App Info */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <List.Section>
                <List.Subheader style={styles.sectionHeader}>About BudgetPal Student</List.Subheader>
                <List.Item
                  title="Version"
                  description="1.0.0"
                  left={props => <List.Icon {...props} icon="information" />}
                />
                <Divider />
                <List.Item
                  title="Description"
                  description="Your smart budgeting companion designed specifically for students."
                  left={props => <List.Icon {...props} icon="text" />}
                />
                <Divider />
                <List.Item
                  title="Features"
                  description="Track expenses, set goals, and build better financial habits."
                  left={props => <List.Icon {...props} icon="star" />}
                />
              </List.Section>
            </Card.Content>
          </Card>

          {/* Privacy & Security */}
          <Card style={styles.securityCard}>
            <Card.Content>
              <List.Section>
                <List.Subheader style={styles.sectionHeader}>Privacy & Security</List.Subheader>
                <List.Item
                  title="Data Encryption"
                  description="Your data is encrypted and secure"
                  left={props => <List.Icon {...props} icon="shield-check" color="#10B981" />}
                />
                <Divider />
                <List.Item
                  title="Privacy Protection"
                  description="We never share your personal information"
                  left={props => <List.Icon {...props} icon="lock" color="#10B981" />}
                />
                <Divider />
                <List.Item
                  title="Financial Data"
                  description="All financial data stays private to you"
                  left={props => <List.Icon {...props} icon="bank" color="#10B981" />}
                />
              </List.Section>
            </Card.Content>
          </Card>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleSignOut}
              style={[styles.actionButton, styles.signOutButton]}
              contentStyle={styles.buttonContent}
              icon="logout"
            >
              Sign Out
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowDeleteModal(true)}
              style={[styles.actionButton, styles.deleteButton]}
              contentStyle={styles.buttonContent}
              textColor="#EF4444"
              icon="delete"
            >
              Delete Account
            </Button>
          </View>
        </ScrollView>

        {/* Delete Account Modal */}
        <Portal>
          <Modal
            visible={showDeleteModal}
            onDismiss={() => setShowDeleteModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Ionicons name="warning" size={32} color="#EF4444" />
                  <Title style={styles.modalTitle}>Delete Account</Title>
                </View>
                
                <Paragraph style={styles.modalText}>
                  This action cannot be undone. All your data will be permanently deleted.
                </Paragraph>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDeleteModal(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleDeleteAccount}
                    style={[styles.modalButton, styles.deleteConfirmButton]}
                    buttonColor="#EF4444"
                  >
                    Delete
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
  profileCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  securityCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionsContainer: {
    padding: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 12,
  },
  signOutButton: {
    backgroundColor: '#F97316',
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    borderRadius: 8,
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
  },
});
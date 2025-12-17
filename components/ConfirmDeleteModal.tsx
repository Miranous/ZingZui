/**
 * ConfirmDeleteModal Component
 *
 * Confirmation dialog for deleting notes
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ThemedButton } from './ThemedButton';
import { theme } from '../theme/theme';

interface ConfirmDeleteModalProps {
  visible: boolean;
  noteTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  noteTitle,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityLabel="confirm-delete-modal"
    >
      <Pressable style={styles.backdrop} onPress={onCancel} />

      <LinearGradient
        colors={['rgba(11,18,32,0.98)', 'rgba(26,31,46,0.98)']}
        style={styles.modalContainer}
      >
        <GlassCard style={styles.card}>
          <View style={styles.iconContainer}>
            <AlertTriangle
              size={48}
              color={theme.palette.danger}
              strokeWidth={2}
            />
          </View>

          <Text style={styles.title}>Delete Note</Text>

          <Text style={styles.message}>
            Are you sure you want to delete{' '}
            <Text style={styles.noteTitle}>"{noteTitle}"</Text>?
          </Text>

          <Text style={styles.warning}>
            This action cannot be undone.
          </Text>

          <View style={styles.buttons}>
            <ThemedButton
              title="Cancel"
              onPress={onCancel}
              variant="secondary"
              disabled={isDeleting}
              style={styles.button}
              accessibilityLabel="cancel-delete-button"
            />
            <ThemedButton
              title="Delete"
              onPress={onConfirm}
              variant="primary"
              loading={isDeleting}
              style={styles.button}
              accessibilityLabel="confirm-delete-button"
            />
          </View>
        </GlassCard>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.palette.textSecondary,
  },
  noteTitle: {
    color: theme.palette.textPrimary,
    fontWeight: '600',
  },
  warning: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.palette.danger,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: theme.palette.danger,
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Trash2 } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  onYes,
  onNo,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.dialogContainer}>
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.buttons}>
              <Pressable
                onPress={onCancel}
                style={[styles.iconButton, styles.cancelButton]}
              >
                <X size={24} color="#666" />
              </Pressable>

              <Pressable
                onPress={onNo}
                style={[styles.iconButton, styles.noButton]}
              >
                <Trash2 size={24} color="#fff" />
              </Pressable>

              <Pressable
                onPress={onYes}
                style={[styles.iconButton, styles.yesButton]}
              >
                <Check size={24} color="#fff" />
              </Pressable>
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
    zIndex: 1,
  },
  card: {
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  noButton: {
    backgroundColor: '#dc2626',
    borderColor: '#ef4444',
  },
  yesButton: {
    backgroundColor: '#06b6d4',
    borderColor: '#22d3ee',
  },
});

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
                <X size={20} color={theme.palette.textSecondary} />
              </Pressable>

              <Pressable
                onPress={onNo}
                style={[styles.iconButton, styles.noButton]}
              >
                <Trash2 size={20} color={theme.palette.danger} />
              </Pressable>

              <Pressable
                onPress={onYes}
                style={[styles.iconButton, styles.yesButton]}
              >
                <Check size={20} color={theme.palette.textPrimary} />
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
    width: 30,
    height: 30,
    borderRadius: theme.radii.button,
    backgroundColor: theme.palette.inputBg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.palette.inputBg,
    borderColor: theme.palette.glassBorder,
  },
  noButton: {
    backgroundColor: theme.palette.danger + '15',
    borderColor: theme.palette.danger + '50',
  },
  yesButton: {
    backgroundColor: theme.palette.primaryGradient[0] + '20',
    borderColor: theme.palette.primaryGradient[0],
  },
});

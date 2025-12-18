/**
 * TaskItemEditorModal Component
 *
 * Modal for editing individual task items
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Trash2, ChevronUp, ChevronDown, Square, CheckSquare, AlertTriangle } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ConfirmDialog } from './ConfirmDialog';
import { getColorForNote } from './NoteListItem';
import { theme } from '../theme/theme';

export interface TaskItemData {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  priority: number;
}

interface TaskItemEditorModalProps {
  visible: boolean;
  task: TaskItemData | null;
  noteId?: string;
  onSave: (task: TaskItemData) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

export const TaskItemEditorModal: React.FC<TaskItemEditorModalProps> = ({
  visible,
  task,
  noteId,
  onSave,
  onDelete,
  onClose,
}) => {
  const noteColors = noteId ? getColorForNote(noteId) : { bg: theme.palette.primaryGradient[0], text: theme.palette.textPrimary };
  const [text, setText] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState(3);
  const [error, setError] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [originalCompleted, setOriginalCompleted] = useState(false);
  const [originalPriority, setOriginalPriority] = useState(3);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && task) {
      setText(task.text);
      setCompleted(task.completed);
      setPriority(task.priority);
      setOriginalText(task.text);
      setOriginalCompleted(task.completed);
      setOriginalPriority(task.priority);
      setError('');
      setShowConfirmDialog(false);
      setShowDeleteConfirm(false);
    }
  }, [visible, task]);

  const hasUnsavedChanges = () => {
    return (
      text.trim() !== originalText ||
      completed !== originalCompleted ||
      priority !== originalPriority
    );
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmYes = () => {
    setShowConfirmDialog(false);
    handleSave();
  };

  const handleConfirmNo = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleSave = () => {
    setError('');

    if (!text.trim()) {
      setError('Task description is required');
      return;
    }

    if (task) {
      onSave({
        ...task,
        text: text.trim(),
        completed,
        priority,
      });
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (task) {
      setShowDeleteConfirm(false);
      onDelete(task.id);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleIncreasePriority = () => {
    if (priority > 1) {
      setPriority(priority - 1);
    }
  };

  const handleDecreasePriority = () => {
    if (priority < 5) {
      setPriority(priority + 1);
    }
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityLabel="task-item-editor-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <LinearGradient
          colors={['rgba(11,18,32,0.98)', 'rgba(26,31,46,0.98)']}
          style={styles.modalContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, noteId && { backgroundColor: noteColors.bg }]}>
              <View style={styles.cardInner}>
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, noteId && { color: noteColors.text }]}>Edit Task</Text>
                  <Pressable
                    onPress={handleClose}
                    style={styles.closeButton}
                    accessibilityLabel="close-button"
                    accessibilityRole="button"
                  >
                    <X size={24} color={noteId ? noteColors.text : theme.palette.textPrimary} />
                  </Pressable>
                </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

                <View style={styles.section}>
                  <Text style={[styles.label, noteId && { color: noteColors.text, opacity: 0.8 }]}>Description</Text>
                  <View style={[styles.inputWrapper, styles.inputContainerBase]}>
                    <TextInput
                      ref={textInputRef}
                      value={text}
                      onChangeText={setText}
                      placeholder="Enter task description"
                      placeholderTextColor={noteId ? noteColors.text + '80' : theme.palette.textTertiary}
                      autoFocus
                      multiline
                      numberOfLines={4}
                      style={[styles.textInput, noteId && { color: noteColors.text }]}
                      accessibilityLabel="task-description-input"
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.label, noteId && { color: noteColors.text, opacity: 0.8 }]}>Priority</Text>
                  <View style={styles.priorityContainer}>
                    <Pressable
                      onPress={handleIncreasePriority}
                      disabled={priority === 1}
                      style={[styles.priorityButton, priority === 1 && styles.priorityButtonDisabled]}
                      accessibilityLabel="increase-priority-button"
                    >
                      <ChevronUp size={24} color={priority === 1 ? theme.palette.disabled : (noteId ? noteColors.text : theme.palette.textPrimary)} />
                    </Pressable>
                    <View style={styles.priorityDisplay}>
                      <Text style={[styles.priorityNumber, noteId && { color: noteColors.text }]}>{priority}</Text>
                      <Text style={[styles.priorityLabel, noteId && { color: noteColors.text, opacity: 0.7 }]}>
                        {priority === 1 ? 'Highest' : priority === 5 ? 'Lowest' : 'Medium'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={handleDecreasePriority}
                      disabled={priority === 5}
                      style={[styles.priorityButton, priority === 5 && styles.priorityButtonDisabled]}
                      accessibilityLabel="decrease-priority-button"
                    >
                      <ChevronDown size={24} color={priority === 5 ? theme.palette.disabled : (noteId ? noteColors.text : theme.palette.textPrimary)} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.label, noteId && { color: noteColors.text, opacity: 0.8 }]}>Status</Text>
                  <Pressable
                    onPress={() => setCompleted(!completed)}
                    style={styles.statusButton}
                    accessibilityLabel="toggle-completed"
                    accessibilityRole="checkbox"
                  >
                    {completed ? (
                      <CheckSquare size={24} color={noteId ? noteColors.text : theme.palette.primaryGradient[0]} />
                    ) : (
                      <Square size={24} color={noteId ? noteColors.text + '80' : theme.palette.textSecondary} />
                    )}
                    <Text style={[styles.statusText, noteId && { color: noteColors.text }]}>
                      {completed ? 'Completed' : 'Not completed'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.buttons}>
                  <Pressable
                    onPress={handleDeleteClick}
                    style={[styles.iconButton, styles.iconButtonDelete]}
                    accessibilityLabel="delete-button"
                    accessibilityRole="button"
                  >
                    <Trash2 size={20} color={noteId ? noteColors.text : theme.palette.danger} />
                  </Pressable>

                  <View style={styles.buttonSpacer} />

                  <Pressable
                    onPress={handleClose}
                    style={styles.iconButton}
                    accessibilityLabel="cancel-button"
                    accessibilityRole="button"
                  >
                    <X size={20} color={theme.palette.textPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={!text.trim()}
                    style={[
                      styles.iconButton,
                      styles.iconButtonSave,
                      !text.trim() && styles.iconButtonDisabled,
                    ]}
                    accessibilityLabel="save-button"
                    accessibilityRole="button"
                  >
                    <Check size={20} color={theme.palette.textPrimary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showConfirmDialog}
        title="Do you want to save changes?"
        onYes={handleConfirmYes}
        onNo={handleConfirmNo}
        onCancel={handleConfirmCancel}
      />

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
        accessibilityLabel="confirm-delete-task-modal"
      >
        <Pressable style={styles.deleteBackdrop} onPress={handleCancelDelete} />

        <LinearGradient
          colors={['rgba(11,18,32,0.98)', 'rgba(26,31,46,0.98)']}
          style={styles.deleteModalContainer}
        >
          <GlassCard style={styles.deleteCard}>
            <View style={styles.deleteIconContainer}>
              <AlertTriangle
                size={48}
                color={theme.palette.danger}
                strokeWidth={2}
              />
            </View>

            <Text style={styles.deleteTitle}>Delete Task</Text>

            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this task?
            </Text>

            <Text style={styles.deleteWarning}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteButtons}>
              <Pressable
                onPress={handleCancelDelete}
                style={styles.deleteIconButton}
                accessibilityLabel="cancel-delete-button"
              >
                <X
                  size={24}
                  color={theme.palette.textPrimary}
                  strokeWidth={2}
                />
              </Pressable>
              <Pressable
                onPress={handleConfirmDelete}
                style={[styles.deleteIconButton, styles.deleteConfirmButton]}
                accessibilityLabel="confirm-delete-button"
              >
                <Trash2
                  size={24}
                  color={theme.palette.textPrimary}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </GlassCard>
        </LinearGradient>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: theme.radii.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  cardInner: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.headline,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,90,95,0.15)',
    borderRadius: theme.radii.small,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,90,95,0.3)',
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.palette.danger,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputContainerBase: {
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 0,
  },
  inputWrapper: {
    overflow: 'hidden',
  },
  textInput: {
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.palette.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  priorityButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.button,
    backgroundColor: theme.palette.inputBg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityButtonDisabled: {
    opacity: 0.3,
  },
  priorityDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  priorityNumber: {
    ...theme.typography.headline,
    fontSize: 32,
    color: theme.palette.primaryGradient[0],
  },
  priorityLabel: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.palette.inputBorder,
    gap: theme.spacing.md,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.palette.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    justifyContent: 'flex-end',
  },
  buttonSpacer: {
    flex: 1,
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
  iconButtonSave: {
    backgroundColor: theme.palette.primaryGradient[0] + '20',
    borderColor: theme.palette.primaryGradient[0],
  },
  iconButtonDelete: {
    backgroundColor: 'rgba(255,90,95,0.15)',
    borderColor: theme.palette.danger,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  deleteBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  deleteCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  deleteTitle: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  deleteMessage: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.palette.textSecondary,
  },
  deleteWarning: {
    ...theme.typography.body,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.palette.danger,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
    justifyContent: 'flex-end',
  },
  deleteIconButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.button,
    backgroundColor: theme.palette.inputBg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmButton: {
    backgroundColor: theme.palette.danger,
    borderColor: theme.palette.danger,
  },
});

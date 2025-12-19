/**
 * NoteEditorModal Component
 *
 * Modal for creating and editing notes
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
import { X, Check } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ConfirmDialog } from './ConfirmDialog';
import { ThemedButton } from './ThemedButton';
import { ThemedInput } from './ThemedInput';
import { RichTextEditor, RichTextEditorRef } from './RichTextEditor';
import { VoiceInputButton } from './VoiceInputButton';
import { ColorPickerButton } from './ColorPickerButton';
import { getColorForNote } from './NoteListItem';
import { Note } from '../lib/notes';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

interface NoteEditorModalProps {
  visible: boolean;
  note?: Note | null;
  onSave: (data: { title: string; body: string; color?: string }) => Promise<{ error?: string }>;
  onClose: () => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  note,
  onSave,
  onClose,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);
  const titleInputRef = useRef<TextInput>(null);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalBody, setOriginalBody] = useState('');
  const [originalColor, setOriginalColor] = useState<string | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeField, setActiveField] = useState<'title' | 'body'>('body');
  const isVoiceButtonPressed = useRef(false);

  const isEditMode = !!note;
  const noteColors = React.useMemo(() => {
    if (color) {
      const colorObj = { bg: color, text: color === '#FFD60A' || color === '#FF9F1C' ? '#1A1423' : '#FFFFFF' };
      return colorObj;
    }
    if (note?.id) {
      return getColorForNote(note.id, note.color);
    }
    return { bg: theme.palette.primaryGradient[0], text: theme.palette.textPrimary };
  }, [color, note?.id, note?.color]);

  useEffect(() => {
    if (visible) {
      const initialTitle = note?.title || '';
      const initialBody = note?.body || '';
      const initialColor = note?.color;
      setTitle(initialTitle);
      setBody(initialBody);
      setColor(initialColor);
      setOriginalTitle(initialTitle);
      setOriginalBody(initialBody);
      setOriginalColor(initialColor);
      setError('');
    }
  }, [visible, note]);

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    setIsSaving(true);

    const result = await onSave({ title, body, color });

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return false;
    } else {
      onClose();
      return true;
    }
  };

  const hasChanges = () => {
    return title !== originalTitle || body !== originalBody || color !== originalColor;
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    if (hasChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmYes = async () => {
    setShowConfirmDialog(false);
    await handleSave();
  };

  const handleConfirmNo = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleVoiceTranscript = (text: string) => {
    if (activeField === 'title') {
      setTitle((prev) => prev + text);
    } else {
      if (editorRef.current) {
        editorRef.current.insertTextAtCursor(text);
      }
    }
  };

  const handleTitleBlur = () => {
    if (!isVoiceButtonPressed.current) {
      setActiveField('body');
    }
    isVoiceButtonPressed.current = false;
  };

  const handleBodyBlur = () => {
    if (!isVoiceButtonPressed.current) {
      setActiveField('body');
    }
    isVoiceButtonPressed.current = false;
  };

  const handleVoiceButtonPress = () => {
    isVoiceButtonPressed.current = true;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityLabel="note-editor-modal"
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
            <View style={[styles.card, (isEditMode || color) && { backgroundColor: noteColors.bg }]}>
              <View style={styles.cardInner}>
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, (isEditMode || color) && { color: noteColors.text }]}>
                    {isEditMode ? 'Edit Note' : 'New Note'}
                  </Text>
                  <Pressable
                    onPress={handleClose}
                    disabled={isSaving}
                    style={styles.closeButton}
                    accessibilityLabel="close-button"
                    accessibilityRole="button"
                  >
                    <X size={24} color={(isEditMode || color) ? noteColors.text : theme.palette.textPrimary} />
                  </Pressable>
                </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

                <View style={styles.titleInputContainer}>
                  <Text style={[styles.titleLabel, (isEditMode || color) && { color: noteColors.text, opacity: 0.8 }]}>Title</Text>
                  <View
                    style={[
                      styles.titleInputWrapper,
                      styles.inputContainerBase,
                    ]}
                  >
                    <TextInput
                      ref={titleInputRef}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter note title"
                      placeholderTextColor={(isEditMode || color) ? noteColors.text + '80' : theme.palette.textTertiary}
                      autoFocus
                      style={[styles.titleTextInput, (isEditMode || color) && { color: noteColors.text }]}
                      accessibilityLabel="note-title-input"
                      onFocus={() => setActiveField('title')}
                      onBlur={handleTitleBlur}
                    />
                  </View>
                </View>

                <View style={styles.bodyInputContainer}>
                  <View style={styles.bodyLabelRow}>
                    <Text style={[styles.bodyLabel, (isEditMode || color) && { color: noteColors.text, opacity: 0.8 }]}>Content</Text>
                    <View style={styles.buttonRow}>
                      <ColorPickerButton
                        selectedColor={color}
                        onColorSelect={setColor}
                        disabled={isSaving}
                      />
                      <View onTouchStart={handleVoiceButtonPress}>
                        <VoiceInputButton
                          onTranscript={handleVoiceTranscript}
                          disabled={isSaving}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.bodyInputWrapper}>
                    {user && (
                      <RichTextEditor
                        ref={editorRef}
                        value={body}
                        onChange={setBody}
                        placeholder="Enter note content... (paste images with Cmd/Ctrl+V)"
                        userId={user.id}
                        onFocus={() => setActiveField('body')}
                        onBlur={handleBodyBlur}
                        textColor={(isEditMode || color) ? noteColors.text : undefined}
                        placeholderColor={(isEditMode || color) ? noteColors.text + '80' : undefined}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.buttons}>
                  <Pressable
                    onPress={handleClose}
                    disabled={isSaving}
                    style={[styles.iconButton, isSaving && styles.iconButtonDisabled]}
                    accessibilityLabel="cancel-button"
                    accessibilityRole="button"
                  >
                    <X size={20} color={theme.palette.textPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={!title.trim() || isSaving}
                    style={[
                      styles.iconButton,
                      styles.iconButtonSave,
                      (!title.trim() || isSaving) && styles.iconButtonDisabled,
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
    maxWidth: 600,
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
  bodyInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  bodyLabel: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  bodyInputWrapper: {
    minHeight: 200,
  },
  bodyInput: {
    marginBottom: 0,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    justifyContent: 'flex-end',
  },
  button: {
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
  iconButtonDisabled: {
    opacity: 0.5,
  },
  titleInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  titleLabel: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  bodyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  titleInput: {
    marginBottom: 0,
  },
  inputContainerBase: {
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 0,
  },
  titleInputWrapper: {
    overflow: 'hidden',
  },
  titleTextInput: {
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.palette.textPrimary,
  },
});

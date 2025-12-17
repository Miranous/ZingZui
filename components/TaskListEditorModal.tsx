/**
 * TaskListEditorModal Component
 *
 * Modal for creating and editing task lists
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
import { X, Check, Plus, Trash2, Square, CheckSquare, ChevronUp, ChevronDown, Edit } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ConfirmDialog } from './ConfirmDialog';
import { TaskItemEditorModal, TaskItemData } from './TaskItemEditorModal';
import { getColorForNote } from './NoteListItem';
import { theme } from '../theme/theme';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  priority: number;
}

export interface TaskListData {
  id?: string;
  title: string;
  tasks: Task[];
}

interface TaskListEditorModalProps {
  visible: boolean;
  taskList?: TaskListData | null;
  onSave: (data: TaskListData) => Promise<{ error?: string }>;
  onClose: () => void;
}

export const TaskListEditorModal: React.FC<TaskListEditorModalProps> = ({
  visible,
  taskList,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalTasks, setOriginalTasks] = useState<Task[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskItemEditorVisible, setIsTaskItemEditorVisible] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const taskInputRefs = useRef<{ [key: string]: TextInput }>({});

  const isEditMode = !!taskList;
  const noteColors = taskList?.id ? getColorForNote(taskList.id) : { bg: theme.palette.primary, text: theme.palette.textPrimary };

  useEffect(() => {
    if (visible) {
      const initialTitle = taskList?.title || '';
      const initialTasks = (taskList?.tasks || []).sort((a, b) => a.priority - b.priority);
      setTitle(initialTitle);
      setTasks(initialTasks);
      setOriginalTitle(initialTitle);
      setOriginalTasks(initialTasks);
      setError('');
      setEditingTaskId(null);
      setSelectedTaskId(null);
    }
  }, [visible, taskList]);

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    setIsSaving(true);

    const result = await onSave({ title, tasks });

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
    if (title !== originalTitle) return true;
    if (tasks.length !== originalTasks.length) return true;
    return tasks.some((task, index) => {
      const original = originalTasks[index];
      return !original || task.text !== original.text || task.completed !== original.completed || task.priority !== original.priority;
    });
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

  const handleAddTask = () => {
    const newTask: Task = {
      id: `temp-${Date.now()}`,
      text: '',
      completed: false,
      position: tasks.length,
      priority: 3,
    };
    const updatedTasks = [...tasks, newTask].sort((a, b) => a.priority - b.priority);
    setTasks(updatedTasks);
    setEditingTaskId(newTask.id);
    setTimeout(() => {
      taskInputRefs.current[newTask.id]?.focus();
    }, 100);
  };

  const handleTaskTextChange = (taskId: string, text: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, text } : task
    ));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleIncreasePriority = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId && task.priority > 1
        ? { ...task, priority: task.priority - 1 }
        : task
    );
    setTasks(updatedTasks.sort((a, b) => a.priority - b.priority));
  };

  const handleDecreasePriority = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId && task.priority < 5
        ? { ...task, priority: task.priority + 1 }
        : task
    );
    setTasks(updatedTasks.sort((a, b) => a.priority - b.priority));
  };

  const handleTaskFocus = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleTaskBlur = () => {
    setTimeout(() => {
      setEditingTaskId(null);
    }, 100);
  };

  const handleEditTask = () => {
    if (selectedTaskId) {
      setIsTaskItemEditorVisible(true);
    }
  };

  const handleSaveTaskItem = (updatedTask: TaskItemData) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ).sort((a, b) => a.priority - b.priority);
    setTasks(updatedTasks);
  };

  const handleDeleteTaskItem = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setSelectedTaskId(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityLabel="tasklist-editor-modal"
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
            <View style={[styles.card, isEditMode && { backgroundColor: noteColors.bg }]}>
              <View style={styles.cardInner}>
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, isEditMode && { color: noteColors.text }]}>
                    {isEditMode ? 'Edit Tasklist' : 'New Tasklist'}
                  </Text>
                  <Pressable
                    onPress={handleClose}
                    disabled={isSaving}
                    style={styles.closeButton}
                    accessibilityLabel="close-button"
                    accessibilityRole="button"
                  >
                    <X size={24} color={isEditMode ? noteColors.text : theme.palette.textPrimary} />
                  </Pressable>
                </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

                <View style={styles.titleInputContainer}>
                  <Text style={[styles.titleLabel, isEditMode && { color: noteColors.text, opacity: 0.8 }]}>Title</Text>
                  <View style={[styles.titleInputWrapper, styles.inputContainerBase]}>
                    <TextInput
                      ref={titleInputRef}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter tasklist title"
                      placeholderTextColor={isEditMode ? noteColors.text + '80' : theme.palette.textTertiary}
                      autoFocus
                      style={[styles.titleTextInput, isEditMode && { color: noteColors.text }]}
                      accessibilityLabel="tasklist-title-input"
                    />
                  </View>
                </View>

                <View style={styles.tasksContainer}>
                  <Text style={[styles.tasksLabel, isEditMode && { color: noteColors.text, opacity: 0.8 }]}>Tasks</Text>
                <ScrollView style={styles.tasksList}>
                  {tasks.map((task) => (
                    <Pressable
                      key={task.id}
                      onPress={() => setSelectedTaskId(task.id)}
                      style={[
                        styles.taskItem,
                        selectedTaskId === task.id && styles.taskItemSelected,
                      ]}
                      accessibilityLabel={`select-task-${task.id}`}
                    >
                      <Pressable
                        onPress={() => handleToggleTask(task.id)}
                        style={styles.taskCheckbox}
                        accessibilityLabel={`toggle-task-${task.id}`}
                        accessibilityRole="checkbox"
                      >
                        {task.completed ? (
                          <CheckSquare size={20} color={isEditMode ? noteColors.text : theme.palette.primaryGradient[0]} />
                        ) : (
                          <Square size={20} color={isEditMode ? noteColors.text + '80' : theme.palette.textSecondary} />
                        )}
                      </Pressable>
                      <View style={styles.priorityControls}>
                        <Pressable
                          onPress={() => handleIncreasePriority(task.id)}
                          disabled={task.priority === 1}
                          style={[styles.priorityButton, task.priority === 1 && styles.priorityButtonDisabled]}
                          accessibilityLabel={`increase-priority-${task.id}`}
                        >
                          <ChevronUp size={12} color={task.priority === 1 ? theme.palette.disabled : (isEditMode ? noteColors.text + '80' : theme.palette.textSecondary)} />
                        </Pressable>
                        <Text style={[styles.priorityText, isEditMode && { color: noteColors.text }]}>{task.priority}</Text>
                        <Pressable
                          onPress={() => handleDecreasePriority(task.id)}
                          disabled={task.priority === 5}
                          style={[styles.priorityButton, task.priority === 5 && styles.priorityButtonDisabled]}
                          accessibilityLabel={`decrease-priority-${task.id}`}
                        >
                          <ChevronDown size={12} color={task.priority === 5 ? theme.palette.disabled : (isEditMode ? noteColors.text + '80' : theme.palette.textSecondary)} />
                        </Pressable>
                      </View>
                      <TextInput
                        ref={(ref) => {
                          if (ref) {
                            taskInputRefs.current[task.id] = ref;
                          }
                        }}
                        value={task.text}
                        onChangeText={(text) => handleTaskTextChange(task.id, text)}
                        placeholder="Task description"
                        placeholderTextColor={isEditMode ? noteColors.text + '80' : theme.palette.textTertiary}
                        style={[
                          styles.taskInput,
                          task.completed && styles.taskInputCompleted,
                          isEditMode && { color: noteColors.text },
                        ]}
                        onFocus={() => handleTaskFocus(task.id)}
                        onBlur={handleTaskBlur}
                        accessibilityLabel={`task-input-${task.id}`}
                      />
                      {editingTaskId === task.id && (
                        <Pressable
                          onPressIn={() => handleDeleteTask(task.id)}
                          style={styles.taskDeleteButton}
                          accessibilityLabel={`delete-task-${task.id}`}
                          accessibilityRole="button"
                        >
                          <Trash2 size={16} color={isEditMode ? noteColors.text : theme.palette.danger} />
                        </Pressable>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
                </View>

                <View style={styles.buttons}>
                <Pressable
                  onPress={handleAddTask}
                  disabled={isSaving}
                  style={[styles.iconButton, isSaving && styles.iconButtonDisabled]}
                  accessibilityLabel="add-task-button"
                  accessibilityRole="button"
                >
                  <Plus size={20} color={theme.palette.textPrimary} />
                </Pressable>

                <Pressable
                  onPress={handleEditTask}
                  disabled={!selectedTaskId || isSaving}
                  style={[
                    styles.iconButton,
                    (!selectedTaskId || isSaving) && styles.iconButtonDisabled,
                  ]}
                  accessibilityLabel="edit-task-button"
                  accessibilityRole="button"
                >
                  <Edit size={20} color={theme.palette.textPrimary} />
                </Pressable>

                <View style={styles.buttonSpacer} />

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

      <TaskItemEditorModal
        visible={isTaskItemEditorVisible}
        task={tasks.find(t => t.id === selectedTaskId) || null}
        noteId={taskList?.id}
        onSave={handleSaveTaskItem}
        onDelete={handleDeleteTaskItem}
        onClose={() => setIsTaskItemEditorVisible(false)}
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
  titleInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  titleLabel: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.sm,
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
  tasksContainer: {
    marginBottom: theme.spacing.lg,
  },
  tasksLabel: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tasksList: {
    maxHeight: 300,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.palette.inputBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  taskItemSelected: {
    borderColor: theme.palette.primaryGradient[0],
    borderWidth: 2,
  },
  taskCheckbox: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  taskInput: {
    ...theme.typography.body,
    flex: 1,
    color: theme.palette.textPrimary,
    paddingVertical: theme.spacing.sm,
  },
  taskInputCompleted: {
    textDecorationLine: 'line-through',
    color: theme.palette.textTertiary,
  },
  taskDeleteButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  priorityControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  priorityButton: {
    width: 20,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityButtonDisabled: {
    opacity: 0.3,
  },
  priorityText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.palette.textSecondary,
    fontWeight: '600',
    minWidth: 12,
    textAlign: 'center',
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
  iconButtonDisabled: {
    opacity: 0.5,
  },
});

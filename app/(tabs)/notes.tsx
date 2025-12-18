/**
 * NotesBrowser Screen
 *
 * Main notes interface with list, toolbar, and CRUD operations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  AccessibilityInfo,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Edit2, Trash2, FileText, Search, AlignLeft, ArrowDownAZ, ArrowUpAZ, Clock, ListTodo } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard';
import { ThemedButton } from '../../components/ThemedButton';
import { NoteListItem } from '../../components/NoteListItem';
import { NoteEditorModal } from '../../components/NoteEditorModal';
import { TaskListEditorModal, TaskListData } from '../../components/TaskListEditorModal';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { SearchModal } from '../../components/SearchModal';
import { useNotes } from '../../hooks/useNotes';
import { Note } from '../../lib/notes';
import { theme } from '../../theme/theme';

type SortMode = 'title-asc' | 'title-desc' | 'updated';

export default function NotesBrowserScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [titlesOnly, setTitlesOnly] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const { notes: rawNotes, isLoading, create, update, remove } = useNotes({
    search: searchTerm,
    titlesOnly,
  });

  // Sort notes based on current sort mode
  const notes = React.useMemo(() => {
    const sorted = [...rawNotes];

    switch (sortMode) {
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'updated':
      default:
        return sorted.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  }, [rawNotes, sortMode]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isTaskListEditorVisible, setIsTaskListEditorVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;
  const hasSelection = !!selectedNoteId;

  const handleSelectNote = (noteId: string) => {
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      AccessibilityInfo.announceForAccessibility('Note unselected');
    } else {
      setSelectedNoteId(noteId);
      AccessibilityInfo.announceForAccessibility('Note selected');
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditorVisible(true);
  };

  const handleNewTaskList = () => {
    setEditingNote(null);
    setIsTaskListEditorVisible(true);
  };

  const handleEditNote = () => {
    if (!selectedNote) return;
    setEditingNote(selectedNote);
    if (selectedNote.type === 'tasklist') {
      setIsTaskListEditorVisible(true);
    } else {
      setIsEditorVisible(true);
    }
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    setIsDeleteModalVisible(true);
  };

  const handleSearch = (search: string, titlesOnlyParam: boolean) => {
    setSearchTerm(search);
    setTitlesOnly(titlesOnlyParam);
    setSelectedNoteId(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTitlesOnly(true);
  };

  const handleToggleSort = () => {
    setSortMode((current) => {
      if (current === 'title-asc') return 'title-desc';
      if (current === 'title-desc') return 'updated';
      return 'title-asc';
    });
    AccessibilityInfo.announceForAccessibility(
      sortMode === 'title-asc'
        ? 'Sorting by title descending'
        : sortMode === 'title-desc'
          ? 'Sorting by last updated'
          : 'Sorting by title ascending'
    );
  };

  const getSortIcon = () => {
    switch (sortMode) {
      case 'title-asc':
        return ArrowDownAZ;
      case 'title-desc':
        return ArrowUpAZ;
      case 'updated':
      default:
        return Clock;
    }
  };

  const getSortLabel = () => {
    switch (sortMode) {
      case 'title-asc':
        return 'Sort by title A-Z';
      case 'title-desc':
        return 'Sort by title Z-A';
      case 'updated':
      default:
        return 'Sort by last updated';
    }
  };

  const handleSaveNote = async (data: { title: string; body: string }) => {
    if (editingNote) {
      const result = await update(editingNote.id, data);
      if (!result.error) {
        AccessibilityInfo.announceForAccessibility('Note saved');
      }
      return result;
    } else {
      const result = await create(data);
      if (!result.error) {
        AccessibilityInfo.announceForAccessibility('Note created');
      }
      return result;
    }
  };

  const handleSaveTaskList = async (data: TaskListData) => {
    const noteTasks = data.tasks.map(task => ({
      text: task.text,
      completed: task.completed,
      position: task.position,
      priority: task.priority,
    }));

    if (editingNote) {
      const result = await update(editingNote.id, {
        title: data.title,
        body: '',
        tasks: noteTasks as any,
      });
      if (!result.error) {
        AccessibilityInfo.announceForAccessibility('Task list saved');
      }
      return result;
    } else {
      const result = await create({
        title: data.title,
        body: '',
        type: 'tasklist',
        tasks: noteTasks as any,
      });
      if (!result.error) {
        AccessibilityInfo.announceForAccessibility('Task list created');
      }
      return result;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) return;

    setIsDeleting(true);
    const result = await remove(selectedNote.id);
    setIsDeleting(false);

    if (!result.error) {
      setIsDeleteModalVisible(false);
      setSelectedNoteId(null);
      AccessibilityInfo.announceForAccessibility('Note deleted');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassCard style={styles.emptyCard}>
        <FileText
          size={64}
          color={theme.palette.textSecondary}
          strokeWidth={1.5}
        />
        <Text style={styles.emptyTitle}>No Notes Yet</Text>
        <Text style={styles.emptyMessage}>
          Create your first note or task list to get started
        </Text>
        <View style={styles.emptyButtons}>
          <ThemedButton
            title="Create Note"
            onPress={handleNewNote}
            variant="primary"
            style={styles.emptyButton}
            accessibilityLabel="create-first-note-button"
          />
          <ThemedButton
            title="Create Task List"
            onPress={handleNewTaskList}
            variant="secondary"
            style={styles.emptyButton}
            accessibilityLabel="create-first-tasklist-button"
          />
        </View>
      </GlassCard>
    </View>
  );

  const renderToolbar = () => (
    <View style={styles.toolbarWrapper}>
      <View style={[styles.toolbar, { overflow: 'visible' }]}>
        <GlassCard>
          <View style={styles.toolbarContent}>
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleNewNote}
            style={styles.iconButton}
            accessibilityLabel="new-note-button"
            accessibilityHint="Create a new note"
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('new-note'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <Plus
              size={20}
              color="#000000"
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'new-note' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>New Note</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleNewTaskList}
            style={styles.iconButton}
            accessibilityLabel="new-tasklist-button"
            accessibilityHint="Create a new task list"
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('new-tasklist'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <ListTodo
              size={20}
              color="#000000"
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'new-tasklist' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>New Tasks</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => setIsSearchModalVisible(true)}
            style={styles.iconButton}
            accessibilityLabel="search-button"
            accessibilityHint="Search notes"
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('search'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <Search
              size={20}
              color="#000000"
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'search' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Search</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleEditNote}
            disabled={!hasSelection}
            style={[styles.iconButton, !hasSelection && styles.iconButtonDisabled]}
            accessibilityLabel="edit-button"
            accessibilityHint={
              hasSelection
                ? 'Edit selected note'
                : 'Select a note to edit'
            }
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('edit'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <Edit2
              size={20}
              color={hasSelection ? "#000000" : theme.palette.disabled}
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'edit' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Edit</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleDeleteNote}
            disabled={!hasSelection}
            style={[styles.iconButton, !hasSelection && styles.iconButtonDisabled]}
            accessibilityLabel="delete-button"
            accessibilityHint={
              hasSelection
                ? 'Delete selected note'
                : 'Select a note to delete'
            }
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('delete'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <Trash2
              size={20}
              color={hasSelection ? "#000000" : theme.palette.disabled}
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'delete' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Delete</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => setShowPreview(!showPreview)}
            style={[styles.iconButton, showPreview && styles.iconButtonActive]}
            accessibilityLabel="toggle-preview-button"
            accessibilityHint={showPreview ? 'Hide note previews' : 'Show note previews'}
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('titles'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            <AlignLeft
              size={20}
              color="#000000"
              strokeWidth={3}
            />
          </Pressable>
          {hoveredButton === 'titles' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Titles</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleToggleSort}
            style={styles.iconButton}
            accessibilityLabel="sort-button"
            accessibilityHint={getSortLabel()}
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredButton('sort'),
              onMouseLeave: () => setHoveredButton(null),
            })}
          >
            {React.createElement(getSortIcon(), {
              size: 20,
              color: "#000000",
              strokeWidth: 3,
            })}
          </Pressable>
          {hoveredButton === 'sort' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Sort</Text>
            </View>
          )}
        </View>
      </View>

      {searchTerm && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchText}>
            Searching for: "{searchTerm}" {titlesOnly ? '(titles only)' : '(titles & body)'}
          </Text>
          <ThemedButton
            title="Clear"
            onPress={handleClearSearch}
            variant="secondary"
            style={styles.clearButton}
            accessibilityLabel="clear-search-button"
          />
        </View>
      )}
        </GlassCard>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.palette.primaryGradient[0]}
            />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : notes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteListItem
                note={item}
                isSelected={item.id === selectedNoteId}
                onPress={() => handleSelectNote(item.id)}
                onDoublePress={() => {
                  setSelectedNoteId(item.id);
                  setEditingNote(item);
                  if (item.type === 'tasklist') {
                    setIsTaskListEditorVisible(true);
                  } else {
                    setIsEditorVisible(true);
                  }
                }}
                showPreview={showPreview}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {renderToolbar()}
      </View>

      <NoteEditorModal
        visible={isEditorVisible}
        note={editingNote}
        onSave={handleSaveNote}
        onClose={() => setIsEditorVisible(false)}
      />

      <TaskListEditorModal
        visible={isTaskListEditorVisible}
        taskList={
          editingNote && editingNote.type === 'tasklist'
            ? {
                id: editingNote.id,
                title: editingNote.title,
                tasks: (editingNote.tasks || []).map(task => ({
                  id: task.id,
                  text: task.text,
                  completed: task.completed,
                  position: task.position,
                  priority: task.priority,
                })),
              }
            : null
        }
        onSave={handleSaveTaskList}
        onClose={() => setIsTaskListEditorVisible(false)}
      />

      <ConfirmDeleteModal
        visible={isDeleteModalVisible}
        noteTitle={selectedNote?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />

      <SearchModal
        visible={isSearchModalVisible}
        onSearch={handleSearch}
        onClose={() => setIsSearchModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 50,
    paddingBottom: 20,
  },
  toolbarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 'auto',
    overflow: 'visible',
    zIndex: 100,
  },
  toolbar: {
    width: '100%',
    overflow: 'visible',
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    overflow: 'visible',
  },
  buttonContainer: {
    position: 'relative',
    overflow: 'visible',
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
  tooltip: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    ...theme.typography.caption,
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  iconButtonActive: {
    backgroundColor: theme.palette.primaryGradient[0] + '20',
    borderColor: theme.palette.primaryGradient[0],
  },
  toolbarHint: {
    ...theme.typography.caption,
    color: theme.palette.textTertiary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.lg,
    color: theme.palette.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  emptyTitle: {
    ...theme.typography.headline,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  emptyMessage: {
    ...theme.typography.body,
    color: theme.palette.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  emptyButton: {
    minWidth: 150,
  },
  listContent: {
    paddingTop: theme.spacing.xl,
    paddingBottom: 100,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.palette.glassBorder,
  },
  searchText: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
    flex: 1,
  },
  clearButton: {
    minWidth: 80,
    marginLeft: theme.spacing.md,
  },
});

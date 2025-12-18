# Notes Feature Documentation

Complete guide to the Notes Browser feature with CRUD operations and Liquid Glass UI.

## Overview

The Notes feature provides a secure, per-user note-taking interface with:
- List view with single-selection model
- Create, edit, and delete operations
- Real-time updates and optimistic UI
- Liquid Glass theme integration
- Full accessibility support
- Keyboard navigation support

## Architecture

### Database Schema

**notes table**:
```sql
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0)
);
```

**Indexes**:
- `idx_notes_owner_id` - Fast filtering by owner
- `idx_notes_updated_at` - Sorting by last updated
- `idx_notes_owner_updated` - Combined index for list queries

**Row Level Security (RLS)**:
All operations are restricted to the note owner:
- Users can only read their own notes
- Users can only create notes for themselves
- Users can only update their own notes
- Users can only delete their own notes

### Data Flow

```
User Action → Component → Hook → API Layer → Supabase → Database
                 ↓           ↓
              State      Optimistic Update
```

1. **User Action**: Button press, note selection
2. **Component**: NotesBrowser handles UI logic
3. **Hook**: useNotes manages state and caching
4. **API Layer**: lib/notes.ts encapsulates database calls
5. **Supabase**: PostgreSQL with RLS policies
6. **Database**: Persistent storage with isolation

## Components

### NotesBrowser Screen

Main interface located at `app/(tabs)/notes.tsx`.

**Features**:
- Toolbar with New, Edit, Delete buttons
- Scrollable list of notes
- Empty state with CTA
- Loading states
- Error handling

**State Management**:
```typescript
const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
const [isEditorVisible, setIsEditorVisible] = useState(false);
const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
```

**Selection Model**:
- Single-selection only (one note selected at a time)
- Selecting a new note deselects the previous one
- Edit and Delete buttons disabled when no selection

### NoteListItem Component

Individual note row with selection state.

**Props**:
```typescript
interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onPress: () => void;
}
```

**Features**:
- Title with ellipsis overflow
- Body snippet (first 120 characters)
- Relative timestamp (e.g., "2h ago")
- Selection highlight with gradient border
- Press animations (scale + opacity)

**Visual States**:
- **Default**: Translucent glass card
- **Selected**: Gradient border + elevated shadow
- **Pressed**: Scaled down to 98%

### NoteEditorModal Component

Modal for creating and editing notes.

**Props**:
```typescript
interface NoteEditorModalProps {
  visible: boolean;
  note?: Note | null;
  onSave: (data: { title: string; body: string }) => Promise<{ error?: string }>;
  onClose: () => void;
}
```

**Features**:
- Title input (required, auto-focus)
- Body input (multiline, 8 lines)
- Inline validation
- Loading state during save
- Error display
- Cancel and Save buttons

**Modes**:
- **Create**: Empty fields, "Create Note" button
- **Edit**: Pre-filled fields, "Save Changes" button

### ConfirmDeleteModal Component

Confirmation dialog for delete operations.

**Props**:
```typescript
interface ConfirmDeleteModalProps {
  visible: boolean;
  noteTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Features**:
- Warning icon
- Note title display
- "Cannot be undone" warning
- Cancel and Delete buttons
- Loading state during deletion

## API Layer

### lib/notes.ts

Core CRUD operations with Supabase.

#### getNotes()

Fetch all notes for a user with optional filtering.

```typescript
const result = await getNotes(ownerId, {
  search: 'keyword',
  limit: 20,
  offset: 0,
});
```

**Parameters**:
- `ownerId` (required): User ID
- `options.search`: Search in title and body
- `options.limit`: Max results (default: all)
- `options.offset`: Pagination offset

**Returns**:
```typescript
{
  notes: Note[],
  total: number,
  error?: string
}
```

#### createNote()

Create a new note.

```typescript
const result = await createNote({
  title: 'My Note',
  body: 'Note content',
  ownerId: userId,
});
```

**Validation**:
- Title is required
- Title cannot be empty or whitespace only
- Both title and body are trimmed

**Returns**:
```typescript
{
  note?: Note,
  error?: string
}
```

#### updateNote()

Update an existing note (owner only).

```typescript
const result = await updateNote(noteId, ownerId, {
  title: 'Updated Title',
  body: 'Updated content',
});
```

**Security**:
- Requires both noteId and ownerId
- RLS ensures only owner can update
- Returns error if note not found or access denied

**Returns**:
```typescript
{
  note?: Note,
  error?: string
}
```

#### deleteNote()

Delete a note (owner only).

```typescript
const result = await deleteNote(noteId, ownerId);
```

**Security**:
- Requires both noteId and ownerId
- RLS ensures only owner can delete
- Silent failure if note not found

**Returns**:
```typescript
{
  error?: string
}
```

## Hooks

### useNotes Hook

React hook for managing notes state.

**Location**: `hooks/useNotes.ts`

**Usage**:
```typescript
const {
  notes,
  isLoading,
  error,
  total,
  refresh,
  create,
  update,
  remove,
} = useNotes({ search: query });
```

**Features**:
- Auto-fetches on mount
- Re-fetches when search changes
- Optimistic UI updates
- Local state management
- Error handling

**Methods**:

```typescript
// Create note
const result = await create({
  title: 'New Note',
  body: 'Content',
});

// Update note
const result = await update(noteId, {
  title: 'Updated',
  body: 'Updated content',
});

// Delete note
const result = await remove(noteId);

// Refresh list
await refresh();
```

## User Flows

### Create Note Flow

1. User taps "New" button in toolbar
2. NoteEditorModal opens with empty fields
3. User enters title and body
4. User taps "Create Note"
5. API creates note in database
6. Note appears at top of list
7. Modal closes
8. Success announced to screen reader

### Edit Note Flow

1. User taps a note to select it
2. Edit button becomes enabled
3. User taps "Edit" button
4. NoteEditorModal opens with note data
5. User modifies title and/or body
6. User taps "Save Changes"
7. API updates note in database
8. List refreshes with updated note
9. Modal closes
10. Success announced to screen reader

### Delete Note Flow

1. User taps a note to select it
2. Delete button becomes enabled
3. User taps "Delete" button
4. ConfirmDeleteModal opens
5. User confirms by tapping "Delete"
6. API deletes note from database
7. Note removed from list
8. Modal closes
9. Success announced to screen reader

### Selection Flow

1. User taps a note
2. Previous selection (if any) is cleared
3. New note becomes selected
4. Visual highlight applied (gradient border)
5. Edit and Delete buttons enabled
6. Selection announced to screen reader

## Accessibility

### Screen Reader Support

All interactive elements have proper labels:

```typescript
accessibilityLabel="new-button"
accessibilityHint="Create a new note"
accessibilityRole="button"
accessibilityState={{ selected: isSelected }}
```

### Announcements

State changes are announced:

```typescript
AccessibilityInfo.announceForAccessibility('Note created');
AccessibilityInfo.announceForAccessibility('Note deleted');
AccessibilityInfo.announceForAccessibility('Note selected');
```

### Keyboard Navigation

- Tab/Shift+Tab: Navigate between controls
- Arrow keys: Move through note list
- Enter/Space: Select note or activate button
- Escape: Close modals

### Focus Management

- New note button receives focus when list is empty
- First input auto-focuses in editor modal
- Focus returns to trigger element when modal closes

## Performance

### Optimization Strategies

1. **List Rendering**:
   - FlatList for efficient rendering
   - Key extraction by note ID
   - No nested FlatLists

2. **State Updates**:
   - Optimistic UI updates
   - Local state before API call
   - Rollback on error

3. **Animations**:
   - react-native-reanimated for native performance
   - Spring physics for natural feel
   - Minimal re-renders

4. **Data Fetching**:
   - Single query with filtering
   - Indexes on owner_id and updated_at
   - No N+1 queries

### Caching Strategy

Current implementation uses React state:
```typescript
const [notes, setNotes] = useState<Note[]>([]);
```

For enhanced caching, consider:
- React Query for automatic cache management
- AsyncStorage for offline persistence
- Incremental updates with timestamps

## Testing

### Unit Tests

**Component Tests**:
```typescript
// NotesBrowser empty state
test('shows empty state when no notes', () => {
  render(<NotesBrowserScreen />);
  expect(screen.getByText('No Notes Yet')).toBeInTheDocument();
});

// Selection behavior
test('enables edit/delete when note selected', () => {
  const { getByLabelText } = render(<NotesBrowserScreen />);
  fireEvent.press(getByLabelText('note-item-1'));
  expect(getByLabelText('edit-button')).toBeEnabled();
});
```

**Hook Tests**:
```typescript
test('useNotes creates note and updates list', async () => {
  const { result } = renderHook(() => useNotes());
  await act(async () => {
    await result.current.create({ title: 'Test', body: '' });
  });
  expect(result.current.notes).toHaveLength(1);
});
```

### Integration Tests

**CRUD Flow**:
```typescript
test('full CRUD cycle', async () => {
  // Create
  await create({ title: 'Test', body: 'Content' });
  expect(notes).toHaveLength(1);

  // Read
  const note = notes[0];
  expect(note.title).toBe('Test');

  // Update
  await update(note.id, { title: 'Updated', body: 'New' });
  expect(notes[0].title).toBe('Updated');

  // Delete
  await remove(note.id);
  expect(notes).toHaveLength(0);
});
```

### E2E Tests

```typescript
test('user can create, edit, and delete note', async () => {
  // Navigate to notes
  await user.press(screen.getByText('Notes'));

  // Create note
  await user.press(screen.getByLabelText('new-button'));
  await user.type(screen.getByLabelText('note-title-input'), 'Test Note');
  await user.press(screen.getByLabelText('save-button'));
  expect(screen.getByText('Test Note')).toBeVisible();

  // Edit note
  await user.press(screen.getByText('Test Note'));
  await user.press(screen.getByLabelText('edit-button'));
  await user.clear(screen.getByLabelText('note-title-input'));
  await user.type(screen.getByLabelText('note-title-input'), 'Updated');
  await user.press(screen.getByLabelText('save-button'));
  expect(screen.getByText('Updated')).toBeVisible();

  // Delete note
  await user.press(screen.getByText('Updated'));
  await user.press(screen.getByLabelText('delete-button'));
  await user.press(screen.getByLabelText('confirm-delete-button'));
  expect(screen.queryByText('Updated')).not.toBeVisible();
});
```

## Customization

### Changing Selection Model

To support multi-select:

1. Change state from `string | null` to `string[]`:
```typescript
const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
```

2. Update selection logic:
```typescript
const handleSelectNote = (noteId: string) => {
  setSelectedNoteIds(prev =>
    prev.includes(noteId)
      ? prev.filter(id => id !== noteId)
      : [...prev, noteId]
  );
};
```

3. Update button logic:
```typescript
const hasSelection = selectedNoteIds.length > 0;
const canEdit = selectedNoteIds.length === 1;
```

### Adding Search

Already supported in API layer:

```typescript
const [query, setQuery] = useState('');
const { notes } = useNotes({ search: query });

<ThemedInput
  value={query}
  onChangeText={setQuery}
  placeholder="Search notes..."
/>
```

### Customizing Theme

Update note-specific styles in components:

```typescript
// Selection color
borderColor: theme.palette.info // Instead of primaryGradient[0]

// Timestamp color
color: theme.palette.textTertiary // Lighter

// Empty state icon
<FileText color={theme.palette.primaryGradient[1]} />
```

## Security

### Per-User Isolation

Every database query includes owner_id filter:

```sql
SELECT * FROM notes WHERE owner_id = $1
```

RLS policies enforce this at the database level.

### Input Validation

**Title**:
- Required
- Must not be empty after trimming
- Enforced in UI and database

**Body**:
- Optional
- Trimmed before storage
- No length limit (consider adding in production)

### Authorization

All operations require authentication:
- User must be logged in
- Owner ID taken from authenticated user
- No way to access other users' notes

## Troubleshooting

### Notes Not Loading

Check:
1. User is authenticated: `user?.id` exists
2. Database RLS policies are correct
3. Network connection is active
4. Console for error messages

### Cannot Create Note

Check:
1. Title is not empty
2. User ID is valid
3. RLS policy allows INSERT
4. Database constraint is satisfied

### Cannot Update/Delete Note

Check:
1. Note is selected
2. User owns the note
3. Note ID is valid
4. RLS policy allows operation

### Selection Not Working

Check:
1. onPress handler is attached
2. selectedNoteId state is updated
3. isSelected prop is passed correctly
4. Visual styles are applied

## Future Enhancements

### Planned Features

1. **Rich Text Editor**:
   - Markdown support
   - Formatting toolbar
   - Preview mode

2. **Categories/Tags**:
   - Tag management
   - Filter by tag
   - Color coding

3. **Sharing**:
   - Share with other users
   - Public/private toggle
   - Collaboration

4. **Offline Support**:
   - Local storage with sync
   - Conflict resolution
   - Queue for offline edits

5. **Advanced Search**:
   - Full-text search
   - Filter by date
   - Sort options

6. **Attachments**:
   - Image uploads
   - File attachments
   - Voice notes

7. **Export**:
   - Export to PDF
   - Export to Markdown
   - Backup all notes

## Resources

- Supabase Docs: https://supabase.com/docs
- React Native: https://reactnative.dev/
- Expo Router: https://docs.expo.dev/router
- Accessibility: https://reactnative.dev/docs/accessibility

## Support

For issues or questions:
1. Check console logs for errors
2. Verify database schema and RLS policies
3. Review component props and state
4. Test API layer independently
5. Check accessibility announcements

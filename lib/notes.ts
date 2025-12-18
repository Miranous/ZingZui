/**
 * Notes API
 *
 * CRUD operations for notes with per-user isolation
 */

import { supabase } from './supabase';

export interface Task {
  id: string;
  noteId: string;
  text: string;
  completed: boolean;
  position: number;
  priority: number;
  createdAt: string;
}

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  type: 'note' | 'tasklist';
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface CreateNoteData {
  title: string;
  body: string;
  ownerId: string;
  type?: 'note' | 'tasklist';
  tasks?: Omit<Task, 'id' | 'noteId' | 'createdAt'>[];
}

export interface UpdateNoteData {
  title: string;
  body: string;
  tasks?: Task[];
}

/**
 * Get all notes for a user
 */
export async function getNotes(
  ownerId: string,
  options?: {
    search?: string;
    titlesOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ notes: Note[]; total: number; error?: string }> {
  try {
    let query = supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false });

    if (options?.search) {
      if (options.titlesOnly) {
        query = query.ilike('title', `%${options.search}%`);
      } else {
        query = query.or(`title.ilike.%${options.search}%,body.ilike.%${options.search}%`);
      }
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Get notes error:', error);
      return { notes: [], total: 0, error: 'Failed to fetch notes' };
    }

    const notes: Note[] = (data || []).map((note) => ({
      id: note.id,
      ownerId: note.owner_id,
      title: note.title,
      body: note.body,
      type: note.type || 'note',
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    }));

    const noteIds = notes.map((note) => note.id);
    if (noteIds.length > 0) {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .in('note_id', noteIds)
        .order('position', { ascending: true });

      if (tasksData) {
        const tasksByNoteId = tasksData.reduce((acc, task) => {
          if (!acc[task.note_id]) {
            acc[task.note_id] = [];
          }
          acc[task.note_id].push({
            id: task.id,
            noteId: task.note_id,
            text: task.text,
            completed: task.completed,
            position: task.position,
            priority: task.priority || 3,
            createdAt: task.created_at,
          });
          return acc;
        }, {} as Record<string, Task[]>);

        notes.forEach((note) => {
          if (note.type === 'tasklist') {
            note.tasks = tasksByNoteId[note.id] || [];
          }
        });
      }
    }

    return { notes, total: count || 0 };
  } catch (error) {
    console.error('Get notes error:', error);
    return { notes: [], total: 0, error: 'An unexpected error occurred' };
  }
}

/**
 * Create a new note
 */
export async function createNote(
  data: CreateNoteData
): Promise<{ note?: Note; error?: string }> {
  try {
    if (!data.title.trim()) {
      return { error: 'Title is required' };
    }

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        owner_id: data.ownerId,
        title: data.title.trim(),
        body: data.body.trim(),
        type: data.type || 'note',
      })
      .select()
      .single();

    if (error) {
      console.error('Create note error:', error);
      return { error: 'Failed to create note' };
    }

    const note: Note = {
      id: newNote.id,
      ownerId: newNote.owner_id,
      title: newNote.title,
      body: newNote.body,
      type: newNote.type,
      createdAt: newNote.created_at,
      updatedAt: newNote.updated_at,
    };

    if (data.type === 'tasklist' && data.tasks && data.tasks.length > 0) {
      const tasksToInsert = data.tasks.map((task, index) => ({
        note_id: newNote.id,
        text: task.text,
        completed: task.completed,
        position: task.position !== undefined ? task.position : index,
        priority: task.priority !== undefined ? task.priority : 3,
      }));

      const { data: insertedTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        console.error('Create tasks error:', tasksError);
      } else if (insertedTasks) {
        note.tasks = insertedTasks.map((task) => ({
          id: task.id,
          noteId: task.note_id,
          text: task.text,
          completed: task.completed,
          position: task.position,
          priority: task.priority || 3,
          createdAt: task.created_at,
        }));
      }
    }

    return { note };
  } catch (error) {
    console.error('Create note error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  id: string,
  ownerId: string,
  data: UpdateNoteData
): Promise<{ note?: Note; error?: string }> {
  try {
    if (!data.title.trim()) {
      return { error: 'Title is required' };
    }

    const { data: updatedNote, error } = await supabase
      .from('notes')
      .update({
        title: data.title.trim(),
        body: data.body.trim(),
      })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (error) {
      console.error('Update note error:', error);
      return { error: 'Failed to update note' };
    }

    if (!updatedNote) {
      return { error: 'Note not found or access denied' };
    }

    const note: Note = {
      id: updatedNote.id,
      ownerId: updatedNote.owner_id,
      title: updatedNote.title,
      body: updatedNote.body,
      type: updatedNote.type,
      createdAt: updatedNote.created_at,
      updatedAt: updatedNote.updated_at,
    };

    if (updatedNote.type === 'tasklist' && data.tasks !== undefined) {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('note_id', id);

      if (deleteError) {
        console.error('Delete existing tasks error:', deleteError);
      }

      if (data.tasks.length > 0) {
        const tasksToInsert = data.tasks
          .filter((task) => task.text.trim())
          .map((task, index) => ({
            note_id: id,
            text: task.text,
            completed: task.completed,
            position: task.position !== undefined ? task.position : index,
            priority: task.priority !== undefined ? task.priority : 3,
          }));

        if (tasksToInsert.length > 0) {
          const { data: insertedTasks, error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)
            .select();

          if (tasksError) {
            console.error('Update tasks error:', tasksError);
          } else if (insertedTasks) {
            note.tasks = insertedTasks.map((task) => ({
              id: task.id,
              noteId: task.note_id,
              text: task.text,
              completed: task.completed,
              position: task.position,
              priority: task.priority || 3,
              createdAt: task.created_at,
            }));
          }
        } else {
          note.tasks = [];
        }
      } else {
        note.tasks = [];
      }
    }

    return { note };
  } catch (error) {
    console.error('Update note error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a note
 */
export async function deleteNote(
  id: string,
  ownerId: string
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Delete note error:', error);
      return { error: 'Failed to delete note' };
    }

    return {};
  } catch (error) {
    console.error('Delete note error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

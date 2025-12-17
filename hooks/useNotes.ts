/**
 * useNotes Hook
 *
 * Manages notes state and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, updateNote, deleteNote, Note, CreateNoteData, UpdateNoteData } from '../lib/notes';
import { useAuth } from '../contexts/AuthContext';

export function useNotes(options?: { search?: string; titlesOnly?: boolean }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchNotes = useCallback(async () => {
    if (!user?.id) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getNotes(user.id, options);

    if (result.error) {
      setError(result.error);
    } else {
      setNotes(result.notes);
      setTotal(result.total);
    }

    setIsLoading(false);
  }, [user?.id, options?.search, options?.titlesOnly]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const create = async (data: Omit<CreateNoteData, 'ownerId'>) => {
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    const result = await createNote({ ...data, ownerId: user.id });

    if (result.note) {
      setNotes((prev) => [result.note!, ...prev]);
      setTotal((prev) => prev + 1);
    }

    return result;
  };

  const update = async (id: string, data: UpdateNoteData) => {
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    const result = await updateNote(id, user.id, data);

    if (result.note) {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? result.note! : note))
      );
    }

    return result;
  };

  const remove = async (id: string) => {
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    const result = await deleteNote(id, user.id);

    if (!result.error) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setTotal((prev) => prev - 1);
    }

    return result;
  };

  return {
    notes,
    isLoading,
    error,
    total,
    refresh: fetchNotes,
    create,
    update,
    remove,
  };
}

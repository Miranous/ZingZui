import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

export default function Dashboard({ session }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.substring(0, 50),
          body: newNote,
          owner_id: session.user.id
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setNotes([data, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Notes</h1>
          <div className="user-info">
            <span>{session.user.email}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="notes-container">
          <form onSubmit={addNote} className="note-form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a new note..."
              rows="4"
              disabled={saving}
            />
            <button type="submit" disabled={saving || !newNote.trim()}>
              {saving ? 'Saving...' : 'Add Note'}
            </button>
          </form>

          {loading ? (
            <div className="loading">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first note above!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  {note.title && <h3 className="note-title">{note.title}</h3>}
                  <p className="note-content">{note.body}</p>
                  <div className="note-footer">
                    <span className="note-date">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

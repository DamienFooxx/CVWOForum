import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';
import { api } from '../lib/api';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: () => void; // Callback to refresh the list
}

export function CreateTopicModal({ isOpen, onClose, onTopicCreated }: CreateTopicModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("You must be logged in to create a topic.");
      setLoading(false);
      return;
    }

    try {
      await api.post('/topics', { name, description }, token);

      // Success
      onTopicCreated();
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
          <h2 className="text-lg font-semibold text-foreground">Create New Topic</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Topic Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={PLACEHOLDERS.CREATE_TOPIC_NAME}
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder={PLACEHOLDERS.CREATE_TOPIC_DESC}
              required
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {BUTTONS.CANCEL}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {BUTTONS.CREATE_TOPIC}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

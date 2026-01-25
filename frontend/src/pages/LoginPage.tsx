import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

interface LoginPageProps {
  onLoginSuccess: (token: string, username: string, userId: number) => void;
  onNavigateToSignup: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Invalid credentials');
      }

      const data = await response.json();
      onLoginSuccess(data.token, data.username, data.user_id);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your username
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={PLACEHOLDERS.LOGIN_USERNAME}
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Connecting...' : BUTTONS.CONTINUE}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          If the username doesn't exist, a new account will be created automatically under that username.
        </div>
      </div>
    </div>
  );
}

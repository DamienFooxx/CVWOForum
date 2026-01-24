import {useEffect, useState, useCallback} from "react";
import {Plus, Search} from 'lucide-react';
import { TopicCard } from '../components/TopicCard';
import { CreateTopicModal } from '../components/CreateTopicModal';
import type { Topic, APIErrorResponse } from '../types';
import { cn } from '../lib/utils';

interface HomePageProps {
  onTopicClick: (topicId: string) => void;
}

export function HomePage({ onTopicClick }: HomePageProps) {
  // Set state for data, loading and errors
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/topics`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as APIErrorResponse;
        throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
      }

      const data = await response.json() as Topic[];
      setTopics(data);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
      <main className="min-h-screen bg-background pb-20">
        {/* Top Section */}
        <section className="relative overflow-hidden pt-16 md:pb-12">
          <div className="container px-4 mx-auto text-center relative z-10">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 max-w-3xl mx-auto">
              Welcome to <span className="text-primary">DAMIEN'S</span> forum.
            </h1>
          </div>
        </section>

        {/* Topics Grid Section */}
        <section className="container px-4 md:px-8 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium tracking-tight">Explore Topics</h2>
            {/* Search */}
            <div className="hidden md:flex items-left relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                  type="text"
                  placeholder="Search"
                  className="h-9 w-140 rounded-xl border border-input bg-input-background px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => isAuthenticated && setIsCreateModalOpen(true)}
                disabled={!isAuthenticated}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm",
                  isAuthenticated 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md" 
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                )}
              >
                <Plus className="h-4 w-4" />
                New Topic
              </button>
              
              {/* Tooltip for non-authenticated users */}
              {!isAuthenticated && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-popover text-popover-foreground text-xs text-center rounded-md border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Sign in to create a topic
                </div>
              )}
            </div>
          </div>
          {/* 3. Conditional Rendering */}
          {loading ? (
              // Loading
              <div className="text-center py-20 text-muted-foreground animate-pulse">
                Loading discussions...
              </div>
          ) : error ? (
              // ERROR STATE
              <div className="text-center py-20 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="font-medium">Unable to load topics</p>
                <p className="text-sm opacity-80 mt-1">{error}</p>
              </div>
          ) : topics.length === 0 ? (
              // EMPTY STATE
              <div className="text-center py-20 text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border">
                <p className="text-lg font-medium text-foreground">No topics found</p>
                <p className="text-sm mt-2">Be the first to start a topic!</p>
              </div>
          ) : (
              // SUCCESS STATE
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic) => (
                    <TopicCard
                        key={topic.topic_id}
                        topic={topic}
                        onClick={onTopicClick}
                    />
                ))}
              </div>
          )}
        </section>

        <CreateTopicModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTopicCreated={fetchTopics}
        />
      </main>
  );
}
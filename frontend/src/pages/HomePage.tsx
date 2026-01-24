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
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  const fetchTopics = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const url = query 
        ? `${import.meta.env.VITE_API_URL}/topics?q=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_API_URL}/topics`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as APIErrorResponse;
        throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
      }

      const data = await response.json() as Topic[];
      console.log("Topic data", data);
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

  // Effect to fetch topics when component mounts or search query changes
  useEffect(() => {
    // Simple debounce: wait 300ms after user stops typing
    const handler = setTimeout(() => {
      fetchTopics(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchTopics]);

  const handleRefresh = () => {
    fetchTopics(searchQuery);
  }

  return (
      <main className="min-h-screen bg-background pb-20 m-10">
        {/* Top Section */}
        <section className="relative overflow-hidden pt-24 md:pb-12">
          <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-xl md:text-6xl font-medium tracking-tight text-foreground mb-6 max-w-3xl mx-auto">
              Welcome to <span className="text-primary">DAMIEN'S</span> forum.
            </h1>
          </div>
        </section>

        {/* Topics Grid Section */}
        <section className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Header Grid: 3 Columns for centering */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-8">
            {/* Left: Title */}
            <div className="flex justify-start">
                <h2 className="text-4xl font-medium tracking-tight">Explore Topics</h2>
            </div>
            
            {/* Center: Search */}
            <div className="hidden md:flex justify-center">
                <div className="relative w-full max-w-l">
                    <Search className="absolute left-2 top-4 h-6 w-6 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-9 pr-4 rounded-xl border border-input bg-input-background text-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>
            
            {/* Right: Button */}
            <div className="flex justify-end">
                <div className="relative group">
                    <button 
                        onClick={() => isAuthenticated && setIsCreateModalOpen(true)}
                        disabled={!isAuthenticated}
                        className={cn(
                        "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-md font-medium transition-all shadow-md",
                        isAuthenticated 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md" 
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                        )}
                    >
                        <Plus className="h-6 w-6" />
                        New Topic
                    </button>
                    
                    {!isAuthenticated && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-popover text-popover-foreground text-xs text-center rounded-md border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Sign in to create a topic
                        </div>
                    )}
                </div>
            </div>
          </div>
          {/* 3. Conditional Rendering */}
          {loading ? (
              // Loading
              <div className="text-center py-20 text-muted-foreground animate-pulse">
                Loading posts...
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
                <p className="text-lg font-medium text-foreground">
                  {searchQuery ? `No topics found for "${searchQuery}"` : "No topics found"}
                </p>
                <p className="text-sm mt-2">
                  {searchQuery ? "Try a different search." : "Be the first to start a topic!"}
                </p>
              </div>
          ) : (
              // SUCCESS STATE
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          onTopicCreated={handleRefresh}
        />
      </main>
  );
}
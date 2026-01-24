import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import type { Topic, Post } from '../types';
import { cn } from '../lib/utils';

interface TopicPageProps {
  topicId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function TopicPage({ topicId, onBack, onPostClick }: TopicPageProps) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!localStorage.getItem('token');

  const fetchData = useCallback(async (query: string = '') => {
    try {
      setLoading(true);
      
      // Construct URL for posts with optional search query
      const postsUrl = query 
        ? `${import.meta.env.VITE_API_URL}/topics/${topicId}/posts?q=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_API_URL}/topics/${topicId}/posts`;

      const [topicRes, postsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/topics/${topicId}`),
        fetch(postsUrl)
      ]);

      if (topicRes.ok) {
        const topicData = await topicRes.json() as Topic;
        setTopic(topicData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json() as Post[];
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Failed to fetch topic data", error);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchData]);

  const handleRefresh = () => {
    fetchData(searchQuery);
  }

  if (loading && !topic) { // Only show full page loading if we don't have topic details yet
    return <div className="p-8 text-center animate-pulse">Loading topic...</div>;
  }

  if (!topic && !loading) {
    return <div className="p-8 text-center text-destructive">Topic not found</div>;
  }

  return (
      <main className="container max-w-screen-lg mx-auto px-4 py-8">
        {/* Back Button */}
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Topic Header */}
        <div className="mb-10 border-b border-border/40 pb-8">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {topic?.name}
            </h1>
            <div className="text-s text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">
              {posts.length} Posts
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
            {topic?.description}
          </p>
          
          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                  type="text"
                  placeholder="Search Posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="relative group ml-auto">
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
                New Post
              </button>
              
              {!isAuthenticated && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-popover text-popover-foreground text-xs text-center rounded-md border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Sign in to create a post
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-12 text-muted-foreground animate-pulse">Searching...</div>
          ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">
                    {searchQuery ? `No posts found for "${searchQuery}"` : "No posts yet. Be the first to share!"}
                </p>
              </div>
          ) : (
              posts.map(post => (
                  <PostCard
                      key={post.post_id}
                      post={post}
                      onClick={onPostClick}
                  />
              ))
          )}
        </div>

        <CreatePostModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handleRefresh}
          topicId={topicId}
        />
      </main>
  );
}

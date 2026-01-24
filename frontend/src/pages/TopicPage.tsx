import { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import type { Topic, Post } from '../types';

interface TopicPageProps {
  topicId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function TopicPage({ topicId, onBack, onPostClick }: TopicPageProps) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetch: Get Topic Details AND Posts for this topic
        const [topicRes, postsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/topics/${topicId}`),
          fetch(`${import.meta.env.VITE_API_URL}/topics/${topicId}/posts`)
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
    };

    fetchData();
  }, [topicId]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading topic...</div>;
  }

  if (!topic) {
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
          Back to Topics
        </button>

        {/* Topic Header */}
        <div className="mb-10 border-b border-border/40 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            {topic.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {topic.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {posts.length} discussions
            </div>

            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md">
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
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
      </main>
  );
}
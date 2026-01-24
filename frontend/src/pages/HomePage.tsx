import {useEffect, useState} from "react";
import { TopicCard } from '../components/TopicCard';
import type { Topic, APIErrorResponse } from '../types'; // Import strict type


interface HomePageProps {
  onTopicClick: (topicId: string) => void;
}

export function HomePage({ onTopicClick }: HomePageProps) {
  // Set state for data, loading and errors
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/topics`);

        if (!response.ok) {
          // Try to get error message from backend JSON if any
          const errorData = await response.json().catch(() => null) as APIErrorResponse;
          throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
        }

        const data = await response.json() as Topic[];
        setTopics(data);
      } catch (err) {
        console.error(err);
        // 2. Set the actual error message
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

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
      </main>
  );
}
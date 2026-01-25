import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Topic } from '../types';

interface TopicCardProps {
    topic: Topic;
    onClick: (id: string) => void;
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
    // Destructure using new property names
    const { topic_id, name, description, post_count, created_at } = topic;

    return (
        <div
            onClick={() => onClick(String(topic_id))}
            className={cn(
                "group relative flex flex-col justify-between p-6 h-full",
                "rounded-2xl border border-border/50 bg-card text-card-foreground",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
                "cursor-pointer"
            )}
        >
            <div className="space-y-4">
                {/* Hover Arrow Top Right */}
                <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">
                    <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-3xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <p className="mt-2 text-lg text-muted-foreground leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-s font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{post_count} posts</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {/* Format date simply */}
                    <span>{new Date(created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Topic } from '../types'; // Import the type!

interface TopicCardProps {
    topic: Topic;
    onClick: (id: string) => void;
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
    // Destructure 'topic' for easy access
    const { id, title, description, postCount, lastActive } = topic;

    return (
        <div
            onClick={() => onClick(id)}
            className={cn(
                // Base Layout & Shape
                "group relative flex flex-col justify-between p-6 h-full",
                "rounded-2xl border border-border/50 bg-card text-card-foreground",

                // Hover Effects
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",

                "cursor-pointer"
            )}
        >
            {/* Content Section */}
            <div className="space-y-4">
                {/* Topic Icon */}
                <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                        <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
                    </div>

                    {/* Hover Arrow */}
                    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>

            {/* Bottom Section: Meta Info */}
            <div className="mt-6 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{postCount} posts</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{lastActive}</span>
                </div>
            </div>
        </div>
    );
}
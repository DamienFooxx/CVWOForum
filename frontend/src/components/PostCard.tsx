import { User as UserIcon, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Post } from '../types';

interface PostCardProps {
    post: Post;
    onClick: (id: string) => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
    const { post_id, title, body, created_at, username, created_by } = post;

    return (
        <div
            onClick={() => onClick(String(post_id))}
            className={cn(
                "group p-5 rounded-xl border border-border/40 bg-card hover:border-primary/20 transition-all duration-200 cursor-pointer",
                "hover:shadow-sm"
            )}
        >
            {/* Header: Author & Time */}
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        <UserIcon className="h-3 w-3" />
                    </div>
                    {/* Use username if available, fallback to ID */}
                    <span>{username || `User #${created_by}`}</span>
                </div>
                <span>•</span>
                <div className="ml-auto flex items-center gap-1 ">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {body}
            </p>
        </div>
    );
}
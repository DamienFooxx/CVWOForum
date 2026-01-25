import { User as UserIcon, Clock, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Post } from '../types';
import { BUTTONS } from '../constants/strings';

interface PostCardProps {
    post: Post;
    onClick: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function PostCard({ post, onClick, onDelete }: PostCardProps) {
    const { post_id, title, body, created_at, username, created_by } = post;
    const currentUserId = localStorage.getItem('user_id');
    const isOwner = currentUserId && String(created_by) === currentUserId;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(String(post_id));
    };

    return (
        <div
            onClick={() => onClick(String(post_id))}
            className={cn(
                "group relative p-5 rounded-xl border border-border/40 bg-card hover:border-primary/20 transition-all duration-200 cursor-pointer",
                "hover:shadow-sm"
            )}
        >
            {/* Header: Author & Time */}
            <div className="flex items-center gap-2 mb-3 text-lg text-muted-foreground">
                <div className="flex items-center gap-3 font-medium text-foreground text-2xl" >
                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    {/* Use username if available, fallback to ID */}
                    <span>{username || `User #${created_by}`}</span>
                </div>
                <span>•</span>
                <div className="ml-auto flex items-center gap-1 ">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(created_at).toLocaleDateString()}</span>
                </div>
                
                {/* Delete Button for Owner */}
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors z-10"
                        title={BUTTONS.DELETE}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-lg text-muted-foreground line-clamp-2 mb-4">
                {body}
            </p>
        </div>
    );
}

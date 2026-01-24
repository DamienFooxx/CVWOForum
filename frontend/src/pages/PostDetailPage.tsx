import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, MessageSquare, User as UserIcon, Clock, CornerDownRight } from 'lucide-react';
import type { Post, Comment } from '../types';
import { CreateCommentModal } from '../components/CreateCommentModal';
import { cn } from '../lib/utils';

interface PostDetailPageProps {
  postId: string;
  onBack: () => void;
}

interface CommentNode extends Comment {
  replies: CommentNode[];
}

export function PostDetailPage({ postId, onBack }: PostDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<number | null>(null);

  const isAuthenticated = !!localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`),
        fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments`)
      ]);

      if (postRes.ok) {
        const postData = await postRes.json() as Post;
        setPost(postData);
      }

      if (commentsRes.ok) {
        const flatComments = await commentsRes.json() as Comment[];
        const tree = buildCommentTree(flatComments);
        setComments(tree);
      }
    } catch (error) {
      console.error("Failed to fetch post details", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReplyClick = (parentId: number | null) => {
    setReplyParentId(parentId);
    setIsReplyModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading discussion...</div>;
  if (!post) return <div className="p-8 text-center text-destructive">Post not found</div>;

  return (
    <main className="container max-w-screen-lg mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Topic
      </button>

      {/* Main Post Content */}
      <article className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-sm mb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 font-medium text-foreground">
             <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <UserIcon className="h-4 w-4" />
             </div>
             <span>{post.username || `User #${post.created_by}`}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Body */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
          {post.title}
        </h1>
        <div className="prose prose-stone dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      </article>

      {/* Comments Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
            </h3>
            <div className="relative group">
                <button 
                    onClick={() => isAuthenticated && handleReplyClick(null)}
                    disabled={!isAuthenticated}
                    className={cn("text-sm font-medium", isAuthenticated ? "text-primary hover:text-primary/80" : "text-muted-foreground cursor-not-allowed opacity-70")}
                >
                    Post a Comment
                </button>
                {!isAuthenticated && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-popover text-popover-foreground text-xs text-center rounded-md border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Sign in to comment
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No comments yet.</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.comment_id} comment={comment} onReply={handleReplyClick} />
            ))
          )}
        </div>
      </section>

      <CreateCommentModal 
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onCommentCreated={fetchData}
        postId={postId}
        parentId={replyParentId}
      />
    </main>
  );
}

// --- Helper Functions & Components ---

// Recursive Component to render comments and replies
function CommentItem({ comment, onReply }: { comment: CommentNode; onReply: (parentId: number) => void }) {
  return (
    <div className="group">
      {/* Comment Card */}
      <div className="bg-card/50 p-4 rounded-xl border border-border/40 hover:border-primary/20 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {/* Use username if available, fallback to ID */}
            {comment.username || `User #${comment.commented_by}`}
          </span>
          <span>•</span>
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{comment.body}</p>

        {/* Reply Button */}
        <button
            onClick={() => onReply(comment.comment_id)}
            className="mt-3 text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
        >
            <CornerDownRight className="h-3 w-3" />
            Reply
        </button>
      </div>

      {/* Render Replies (Nested Comments like Reddit */}
      {comment.replies.length > 0 && (
        <div className="ml-6 mt-3 pl-4 border-l-2 border-border/40 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem key={reply.comment_id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

// Logic to convert flat list (from DB) to tree (for UI)
function buildCommentTree(flatComments: Comment[]): CommentNode[] {
  const commentMap = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  // Initialize all nodes
  flatComments.forEach(c => {
    commentMap.set(c.comment_id, { ...c, replies: [] });
  });

  // Link children to parents
  flatComments.forEach(c => {
    const node = commentMap.get(c.comment_id)!;
    if (c.parent_id) {
      const parent = commentMap.get(c.parent_id);
      if (parent) {
        parent.replies.push(node);
      } else {
        // Parent not found (maybe deleted?), treat as root or handle error
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort by date
  roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  roots.forEach(r => r.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

  return roots;
}

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, User as UserIcon, Clock, CornerDownRight, Trash2 } from 'lucide-react';
import type { Post, Comment } from '../types';
import { CreateCommentModal } from '../components/CreateCommentModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { cn } from '../lib/utils';
import { BUTTONS, TOOLTIPS } from '../constants/strings';
import { api } from '../lib/api';

interface PostDetailPageProps {
  onBack: () => void;
}

interface CommentNode extends Comment {
  replies: CommentNode[];
}

export function PostDetailPage({ onBack }: PostDetailPageProps) {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<number | null>(null);

  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`)
      ]);

      setPost(postData as Post);
      const tree = buildCommentTree(commentsData as Comment[]);
      setComments(tree);
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

  const confirmDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/comments/${commentToDelete}`, localStorage.getItem('token') || undefined);

      await fetchData(); // Wait for data to refresh
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
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
        <div className="text-xl prose prose-stone dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
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
                    className={cn("text-md font-medium", isAuthenticated ? "text-primary hover:text-primary/80" : "text-muted-foreground cursor-not-allowed opacity-70")}
                >
                    {BUTTONS.POST_COMMENT}
                </button>
                {!isAuthenticated && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-popover text-popover-foreground text-xs text-center rounded-md border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {TOOLTIPS.GUEST_COMMENT}
                    </div>
                )}
            </div>
        </div>

        <div className="text-xl leading-relaxed space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No comments yet.</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem 
                key={comment.comment_id} 
                comment={comment} 
                onReply={handleReplyClick} 
                onDelete={confirmDeleteComment}
              />
            ))
          )}
        </div>
      </section>

      <CreateCommentModal 
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onCommentCreated={fetchData}
        postId={postId || ''}
        parentId={replyParentId}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        isLoading={isDeleting}
      />
    </main>
  );
}

// --- Helper Functions & Components ---

// Recursive Component to render comments and replies
function CommentItem({ comment, onReply, onDelete }: { comment: CommentNode; onReply: (parentId: number) => void; onDelete: (id: number) => void }) {
  const currentUserId = localStorage.getItem('user_id');
  const isOwner = currentUserId && String(comment.commented_by) === currentUserId;
  const isDeleted = comment.status === 'removed';

  // Filter out deleted replies that have no children themselves
  const visibleReplies = comment.replies.filter(reply => {
      if (reply.status !== 'removed') return true;
      return hasVisibleDescendants(reply);
  });

  // If deleted and no visible replies, don't render anything
  if (isDeleted && visibleReplies.length === 0) {
    return null;
  }

  return (
    <div className="group">
      {/* Comment Card */}
      <div className={cn(
          "p-4 rounded-xl border transition-colors relative",
          isDeleted 
            ? "bg-secondary/10 border-border/20" 
            : "bg-card/50 border-border/40 hover:border-primary/20"
      )}>
        <div className="flex items-center gap-2 mb-2 text-md font-medium text-muted-foreground">
          <span className="font-medium text-foreground text-md">
            {/* Use username if available, fallback to ID */}
            {isDeleted ? "[deleted]" : (comment.username || `User #${comment.commented_by}`)}
          </span>
          <span>•</span>
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          
          {/* Delete Button for Owner */}
          {isOwner && !isDeleted && (
            <button
                onClick={() => onDelete(comment.comment_id)}
                className="ml-auto p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title={BUTTONS.DELETE}
            >
                <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className={cn("text-md leading-relaxed", isDeleted ? "text-muted-foreground italic" : "text-foreground/90")}>
            {isDeleted ? "This comment was deleted" : comment.body}
        </p>

        {/* Reply Button */}
        {!isDeleted && (
            <button
                onClick={() => onReply(comment.comment_id)}
                className="mt-3 text-s font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
            >
                <CornerDownRight className="h-3 w-3" />
                {BUTTONS.REPLY}
            </button>
        )}
      </div>

      {/* Render Replies (Nested Comments like Reddit */}
      {visibleReplies.length > 0 && (
        <div className="ml-6 mt-3 pl-4 border-l-2 border-border/40 space-y-3">
          {visibleReplies.map(reply => (
            <CommentItem key={reply.comment_id} comment={reply} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to check if a node has any non-deleted descendants
function hasVisibleDescendants(node: CommentNode): boolean {
    if (node.status !== 'removed') return true;
    // If this node is removed, check its children
    return node.replies.some(child => hasVisibleDescendants(child));
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
        // Parent not found (e.g. deleted?), treat as root or handle error
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

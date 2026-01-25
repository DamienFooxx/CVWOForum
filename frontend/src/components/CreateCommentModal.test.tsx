import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCommentModal } from './CreateCommentModal';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

global.fetch = vi.fn();

describe('CreateCommentModal', () => {
  const handleClose = vi.fn();
  const handleCreated = vi.fn();
  const postId = "456";

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('renders "Reply" for top-level comments', () => {
    render(<CreateCommentModal isOpen={true} onClose={handleClose} onCommentCreated={handleCreated} postId={postId} parentId={null} />);
    expect(screen.getByText(BUTTONS.POST_COMMENT)).toBeInTheDocument();
  });

  it('renders "Reply to Comment" for nested replies', () => {
    render(<CreateCommentModal isOpen={true} onClose={handleClose} onCommentCreated={handleCreated} postId={postId} parentId={99} />);
    expect(screen.getByText('Reply to Comment')).toBeInTheDocument();
  });

  it('submits comment with parent_id', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ comment_id: 1 }),
    });

    render(<CreateCommentModal isOpen={true} onClose={handleClose} onCommentCreated={handleCreated} postId={postId} parentId={99} />);

    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_COMMENT_BODY), { target: { value: 'Nice!' } });
    fireEvent.click(screen.getByRole('button', { name: BUTTONS.REPLY }));

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/posts/${postId}/comments`),
      expect.objectContaining({
        body: JSON.stringify({ body: 'Nice!', parent_id: 99 }),
      })
    );
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePostModal } from './CreatePostModal';

global.fetch = vi.fn();

describe('CreatePostModal', () => {
  const handleClose = vi.fn();
  const handleCreated = vi.fn();
  const topicId = "123";

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('renders correctly when open', () => {
    render(<CreatePostModal isOpen={true} onClose={handleClose} onPostCreated={handleCreated} topicId={topicId} />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('submits post to the correct topic endpoint', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post_id: 1 }),
    });

    render(<CreatePostModal isOpen={true} onClose={handleClose} onPostCreated={handleCreated} topicId={topicId} />);

    fireEvent.change(screen.getByPlaceholderText('SOC IS DA BEST'), { target: { value: 'My Post' } });
    fireEvent.change(screen.getByPlaceholderText('Share your intrusive thoughts...'), { target: { value: 'Content' } });
    
    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/topics/${topicId}/posts`),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'My Post', body: 'Content' }),
      })
    );
  });
});

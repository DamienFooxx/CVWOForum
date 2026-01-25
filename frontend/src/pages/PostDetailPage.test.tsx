import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostDetailPage } from './PostDetailPage';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('PostDetailPage', () => {
  const mockPost = {
    post_id: 1,
    title: 'Test Post',
    body: 'This is a test post body.',
    created_at: '2023-01-01T00:00:00Z',
    created_by: 1,
    username: 'author_user'
  };

  const mockComments = [
    {
      comment_id: 1,
      post_id: 1,
      commented_by: 2,
      body: 'Top level comment',
      created_at: '2023-01-02T00:00:00Z',
      parent_id: null,
      username: 'commenter_1'
    },
    {
      comment_id: 2,
      post_id: 1,
      commented_by: 3,
      body: 'Nested reply',
      created_at: '2023-01-03T00:00:00Z',
      parent_id: 1,
      username: 'commenter_2'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<PostDetailPage postId="1" onBack={() => {}} />);
    expect(screen.getByText('Loading discussion...')).toBeInTheDocument();
  });

  it('renders post and comments correctly', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => mockComments });

    render(<PostDetailPage postId="1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading discussion...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test post body.')).toBeInTheDocument();
    expect(screen.getByText('author_user')).toBeInTheDocument();

    // Comments
    expect(screen.getByText('Top level comment')).toBeInTheDocument();
    expect(screen.getByText('Nested reply')).toBeInTheDocument();
    expect(screen.getByText('commenter_1')).toBeInTheDocument();
  });

  it('shows "Sign in to comment" tooltip when not logged in', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<PostDetailPage postId="1" onBack={() => {}} />);

    await waitFor(() => screen.getByText('Test Post'));

    const button = screen.getByText('Reply');
    expect(button).toBeDisabled();
    expect(screen.getByText('Sign in to comment')).toBeInTheDocument();
  });

  it('enables "Post a Comment" button when logged in', async () => {
    localStorage.setItem('token', 'fake-token');
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<PostDetailPage postId="1" onBack={() => {}} />);

    await waitFor(() => screen.getByText('Test Post'));

    const button = screen.getByText('Reply');
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);
    expect(screen.getByText('Post a Comment')).toBeInTheDocument();
  });
});

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PostDetailPage } from './PostDetailPage';
import { BUTTONS, TOOLTIPS } from '../constants/strings';

const fetchMock = vi.fn();
global.fetch = fetchMock;
global.alert = vi.fn();

// Helper to render with router context
const renderWithRouter = (ui: React.ReactNode, { route = '/topics/1/posts/1' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/topics/:topicId/posts/:postId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

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
      username: 'commenter_1',
      status: 'active'
    },
    {
      comment_id: 2,
      post_id: 1,
      commented_by: 3,
      body: 'Nested reply',
      created_at: '2023-01-03T00:00:00Z',
      parent_id: 1,
      username: 'commenter_2',
      status: 'active'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<PostDetailPage onBack={() => {}} />);
    expect(screen.getByText('Loading discussion...')).toBeInTheDocument();
  });

  it('renders post and comments correctly', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => mockComments });

    renderWithRouter(<PostDetailPage onBack={() => {}} />);

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

    renderWithRouter(<PostDetailPage onBack={() => {}} />);

    await waitFor(() => screen.getByText('Test Post'));

    const button = screen.getByText(BUTTONS.POST_COMMENT);
    expect(button).toBeDisabled();
    expect(screen.getByText(TOOLTIPS.GUEST_COMMENT)).toBeInTheDocument();
  });

  it('enables "Reply" button when logged in', async () => {
    localStorage.setItem('token', 'fake-token');
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<PostDetailPage onBack={() => {}} />);

    await waitFor(() => screen.getByText('Test Post'));

    const button = screen.getByText(BUTTONS.POST_COMMENT);
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);
    // Check for the modal header specifically
    expect(screen.getByRole('heading', { name: BUTTONS.POST_COMMENT })).toBeInTheDocument();
  });

  it('handles comment deletion flow', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', '2'); // Owner of comment 1

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost })
      .mockResolvedValueOnce({ ok: true, json: async () => mockComments });

    renderWithRouter(<PostDetailPage onBack={() => {}} />);

    await waitFor(() => screen.getByText('Top level comment'));

    // Find delete button for comment 1
    const deleteBtns = screen.getAllByTitle(BUTTONS.DELETE);
    fireEvent.click(deleteBtns[0]);

    // Modal should appear
    expect(screen.getByText('Delete Comment')).toBeInTheDocument();

    // Mock delete success and refresh
    fetchMock
      .mockResolvedValueOnce({ ok: true }) // Delete response
      .mockResolvedValueOnce({ ok: true, json: async () => mockPost }) // Refresh post
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // Refresh comments

    // Confirm delete (button inside modal)
    const buttons = screen.getAllByRole('button', { name: BUTTONS.DELETE });
    const confirmBtn = buttons.find(btn => !btn.hasAttribute('title'));
    if (!confirmBtn) throw new Error("Confirm button not found");

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/comments/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

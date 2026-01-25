import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TopicPage } from './TopicPage';
import { BUTTONS } from '../constants/strings';

// Mock global fetch
global.fetch = vi.fn();
global.alert = vi.fn();

// Helper to render with router context
const renderWithRouter = (ui: React.ReactNode, { route = '/topics/1' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/topics/:topicId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TopicPage', () => {
  const mockTopic = {
    topic_id: 1,
    name: 'React Testing',
    description: 'Discussing how to test React apps',
    created_at: '2023-01-01T00:00:00Z'
  };

  const mockPosts = [
    {
      post_id: 101,
      topic_id: 1,
      title: 'Vitest is fast',
      body: 'I love using Vitest for unit tests.',
      created_at: '2023-01-02T00:00:00Z',
      created_by: 5,
      username: 'tester_joe'
    },
    {
      post_id: 102,
      topic_id: 1,
      title: 'Mocking fetch',
      body: 'How do you mock fetch globally?',
      created_at: '2023-01-03T00:00:00Z',
      created_by: 6,
      username: 'mock_master'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    // Mock fetch to never resolve immediately (or just return a promise)
    (global.fetch as any).mockReturnValue(new Promise(() => {}));
    
    renderWithRouter(<TopicPage onBack={() => {}} onPostClick={() => {}} />);
    expect(screen.getByText('Loading topic...')).toBeInTheDocument();
  });

  it('renders topic and posts after fetch success', async () => {
    // Mock fetch responses
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopic,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

    renderWithRouter(<TopicPage onBack={() => {}} onPostClick={() => {}} />);

    // Wait for loading to disappear and content to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading topic...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('React Testing')).toBeInTheDocument();
    expect(screen.getByText('Discussing how to test React apps')).toBeInTheDocument();
    
    // Check posts
    expect(screen.getByText('Vitest is fast')).toBeInTheDocument();
    expect(screen.getByText('tester_joe')).toBeInTheDocument();
    expect(screen.getByText('Mocking fetch')).toBeInTheDocument();
  });

  it('renders error state if topic fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    });

    renderWithRouter(<TopicPage onBack={() => {}} onPostClick={() => {}} />, { route: '/topics/999' });

    await waitFor(() => {
      expect(screen.getByText('Topic not found')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    // Setup success state first
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTopic })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const handleBack = vi.fn();
    renderWithRouter(<TopicPage onBack={handleBack} onPostClick={() => {}} />);

    await waitFor(() => screen.getByText('React Testing'));

    fireEvent.click(screen.getByText('Back to Home'));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('handles post deletion flow', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', '5'); // Owner of post 101

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTopic })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPosts });

    renderWithRouter(<TopicPage onBack={() => {}} onPostClick={() => {}} />);

    await waitFor(() => screen.getByText('Vitest is fast'));

    // Click delete on post 101
    const deleteBtns = screen.getAllByTitle(BUTTONS.DELETE);
    fireEvent.click(deleteBtns[0]);

    // Modal should appear
    expect(screen.getByText('Delete Post')).toBeInTheDocument();

    // Mock delete success and refresh
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Delete response
      .mockResolvedValueOnce({ ok: true, json: async () => mockTopic }) // Refresh topic
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // Refresh posts

    // Confirm delete (button inside modal)
    const buttons = screen.getAllByRole('button', { name: BUTTONS.DELETE });
    const confirmBtn = buttons.find(btn => !btn.hasAttribute('title'));
    if (!confirmBtn) throw new Error("Confirm button not found");

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/posts/101'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

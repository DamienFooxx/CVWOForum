import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopicPage } from './TopicPage';

// Mock global fetch
global.fetch = vi.fn();

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
  });

  it('renders loading state initially', () => {
    // Mock fetch to never resolve immediately (or just return a promise)
    (global.fetch as any).mockReturnValue(new Promise(() => {}));
    
    render(<TopicPage topicId="1" onBack={() => {}} onPostClick={() => {}} />);
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

    render(<TopicPage topicId="1" onBack={() => {}} onPostClick={() => {}} />);

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
    });

    render(<TopicPage topicId="999" onBack={() => {}} onPostClick={() => {}} />);

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
    render(<TopicPage topicId="1" onBack={handleBack} onPostClick={() => {}} />);

    await waitFor(() => screen.getByText('React Testing'));

    fireEvent.click(screen.getByText('Back to Home'));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});

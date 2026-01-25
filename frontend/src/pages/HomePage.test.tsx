import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomePage } from './HomePage';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('HomePage', () => {
  const mockTopics = [
    {
      topic_id: 1,
      name: 'Topic 1',
      description: 'Desc 1',
      created_at: '2023-01-01T00:00:00Z',
      post_count: 5
    },
    {
      topic_id: 2,
      name: 'Topic 2',
      description: 'Desc 2',
      created_at: '2023-01-02T00:00:00Z',
      post_count: 0
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders topics after fetch', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTopics,
    });

    render(<HomePage onTopicClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 2')).toBeInTheDocument();
    });
  });

  it('performs search with debounce', async () => {
    // Use real timers for reliability with promises
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<HomePage onTopicClick={() => {}} />);

    // Initial fetch
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // Type in search
    const input = screen.getByPlaceholderText(PLACEHOLDERS.SEARCH_TOPICS);
    fireEvent.change(input, { target: { value: 'search query' } });

    // Should not call immediately (debounce)
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Wait for debounce (300ms) + buffer
    await new Promise((r) => setTimeout(r, 350));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('?q=search%20query'));
    });
  });

  it('shows "New Topic" button enabled only when logged in', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    // Not logged in
    const { unmount } = render(<HomePage onTopicClick={() => {}} />);
    await waitFor(() => screen.getByText('Explore Topics'));
    
    const button = screen.getByRole('button', { name: BUTTONS.NEW_TOPIC });
    expect(button).toBeDisabled();
    
    unmount();

    // Logged in
    localStorage.setItem('token', 'fake-token');
    render(<HomePage onTopicClick={() => {}} />);
    await waitFor(() => screen.getByText('Explore Topics'));

    const enabledButton = screen.getByRole('button', { name: BUTTONS.NEW_TOPIC });
    expect(enabledButton).not.toBeDisabled();
  });
});

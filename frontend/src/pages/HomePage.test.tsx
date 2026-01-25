import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomePage } from './HomePage';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

const fetchMock = vi.fn();
global.fetch = fetchMock;
// Mock alert since we might use it in catch blocks, though we use modal now
global.alert = vi.fn();

describe('HomePage', () => {
  const mockTopics = [
    {
      topic_id: 1,
      name: 'Topic 1',
      description: 'Desc 1',
      created_at: '2023-01-01T00:00:00Z',
      post_count: 5,
      created_by: 1
    },
    {
      topic_id: 2,
      name: 'Topic 2',
      description: 'Desc 2',
      created_at: '2023-01-02T00:00:00Z',
      post_count: 0,
      created_by: 2
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

  it('handles topic deletion flow', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', '1'); // Owner of Topic 1

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTopics,
    });

    render(<HomePage onTopicClick={() => {}} />);

    await waitFor(() => screen.getByText('Topic 1'));

    // Click delete on Topic 1
    const deleteBtns = screen.getAllByTitle(BUTTONS.DELETE);
    fireEvent.click(deleteBtns[0]);

    // Modal should appear
    expect(screen.getByText('Delete Topic')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this topic? This action cannot be undone.')).toBeInTheDocument();

    // Mock delete success and refresh
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Delete response
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // Refresh response

    // Confirm delete (the button inside the modal)
    const buttons = screen.getAllByRole('button', { name: BUTTONS.DELETE });
    const confirmBtn = buttons.find(btn => !btn.hasAttribute('title'));
    if (!confirmBtn) throw new Error("Confirm button not found");

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      // Check if delete API was called
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/topics/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

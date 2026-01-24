import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTopicModal } from './CreateTopicModal';

global.fetch = vi.fn();

describe('CreateTopicModal', () => {
  const handleClose = vi.fn();
  const handleCreated = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('does not render when isOpen is false', () => {
    render(<CreateTopicModal isOpen={false} onClose={handleClose} onTopicCreated={handleCreated} />);
    expect(screen.queryByText('Create New Topic')).not.toBeInTheDocument();
  });

  it('renders form when isOpen is true', () => {
    render(<CreateTopicModal isOpen={true} onClose={handleClose} onTopicCreated={handleCreated} />);
    expect(screen.getByText('Create New Topic')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. I LOVE SOC')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topic_id: 1, name: 'New Topic' }),
    });

    render(<CreateTopicModal isOpen={true} onClose={handleClose} onTopicCreated={handleCreated} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. I LOVE SOC'), { target: { value: 'New Topic' } });
    fireEvent.change(screen.getByPlaceholderText('What is this topic about?'), { target: { value: 'Description' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create topic/i }));

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/topics'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Topic', description: 'Description' }),
      })
    );
  });

  it('shows error message on failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Name already exists' }),
    });

    render(<CreateTopicModal isOpen={true} onClose={handleClose} onTopicCreated={handleCreated} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. I LOVE SOC'), { target: { value: 'Duplicate' } });
    fireEvent.change(screen.getByPlaceholderText('What is this topic about?'), { target: { value: 'Desc' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create topic/i }));

    await waitFor(() => {
      expect(screen.getByText('Name already exists')).toBeInTheDocument();
    });
  });
});

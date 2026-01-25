import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTopicModal } from './CreateTopicModal';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

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
    expect(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_TOPIC_NAME)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topic_id: 1, name: 'New Topic' }),
    });

    render(<CreateTopicModal isOpen={true} onClose={handleClose} onTopicCreated={handleCreated} />);

    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_TOPIC_NAME), { target: { value: 'New Topic' } });
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_TOPIC_DESC), { target: { value: 'Description' } });
    
    fireEvent.click(screen.getByRole('button', { name: BUTTONS.CREATE_TOPIC }));

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
      text: async () => JSON.stringify({ message: 'Name already exists' }),
    });

    render(<CreateTopicModal isOpen={true} onClose={handleClose} onTopicCreated={handleCreated} />);

    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_TOPIC_NAME), { target: { value: 'Duplicate' } });
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.CREATE_TOPIC_DESC), { target: { value: 'Desc' } });
    
    fireEvent.click(screen.getByRole('button', { name: BUTTONS.CREATE_TOPIC }));

    await waitFor(() => {
      expect(screen.getByText('Name already exists')).toBeInTheDocument();
    });
  });
});

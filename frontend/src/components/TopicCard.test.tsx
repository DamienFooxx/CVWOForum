import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopicCard } from './TopicCard';
import type { Topic } from '../types';
import { BUTTONS } from '../constants/strings';

describe('TopicCard', () => {
  const mockTopic: Topic = {
    topic_id: 1,
    created_by: 1,
    name: 'Test Topic',
    description: 'This is a test topic description',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    status: 'active',
    removed_at: '',
    removed_by: 0,
    removal_reason: '',
    post_count: 5,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders topic information correctly', () => {
    render(<TopicCard topic={mockTopic} onClick={() => {}} />);

    expect(screen.getByText('Test Topic')).toBeInTheDocument();
    expect(screen.getByText('This is a test topic description')).toBeInTheDocument();
    expect(screen.getByText('5 posts')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<TopicCard topic={mockTopic} onClick={handleClick} />);

    fireEvent.click(screen.getByText('Test Topic'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('shows delete button only for owner', () => {
    // Not owner
    localStorage.setItem('user_id', '999');
    const { unmount } = render(<TopicCard topic={mockTopic} onClick={() => {}} />);
    expect(screen.queryByTitle(BUTTONS.DELETE)).not.toBeInTheDocument();
    unmount();

    // Owner
    localStorage.setItem('user_id', '1');
    render(<TopicCard topic={mockTopic} onClick={() => {}} />);
    expect(screen.getByTitle(BUTTONS.DELETE)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    localStorage.setItem('user_id', '1');
    const handleDelete = vi.fn();
    render(<TopicCard topic={mockTopic} onClick={() => {}} onDelete={handleDelete} />);

    const deleteBtn = screen.getByTitle(BUTTONS.DELETE);
    fireEvent.click(deleteBtn);
    
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('1');
  });
});

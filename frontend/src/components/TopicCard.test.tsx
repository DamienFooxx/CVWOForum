import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicCard } from './TopicCard';
import type { Topic } from '../types';

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
});

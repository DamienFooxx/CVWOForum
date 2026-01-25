import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from './PostCard';
import type { Post } from '../types';

describe('PostCard', () => {
  const mockPost: Post = {
    post_id: 101,
    topic_id: 1,
    created_by: 2,
    title: 'Test Post Title',
    body: 'This is the body of the test post.',
    created_at: '2023-01-05T10:00:00Z',
    status: 'active',
    removed_at: '',
    removed_by: 0,
    removal_reason: '',
    username: 'testuser',
    likes: 10,
    comment_count: 3
  };

  it('renders post information correctly', () => {
    render(<PostCard post={mockPost} onClick={() => {}} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is the body of the test post.')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText(/1\/5\/2023/)).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<PostCard post={mockPost} onClick={handleClick} />);

    fireEvent.click(screen.getByText('Test Post Title'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('101');
  });
});

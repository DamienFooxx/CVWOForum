export type PageType = 'home' | 'topics';

export interface APIErrorResponse {
    message?: string;
    error?: string;
}

export interface NavigationItem {
    id: PageType;
    label: string;
    icon: React.ElementType;
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    postCount: number;
    lastActive: string;
}

export interface Post {
    id: string;
    topicId: string;
    title: string;
    content: string;
    author: User;
    createdAt: string;
    likes: number;
    commentCount: number;
}

export interface Comment {
    id: string;
    postId: string;
    content: string;
    author: User;
    createdAt: string;
    likes: number;
}

export interface User {
    id: string;
    username: string;
    avatarUrl?: string; // Optional
}
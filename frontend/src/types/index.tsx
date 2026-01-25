export type PageType = 'home' | 'topics';

export interface APIErrorResponse {
    message?: string;
    error?: string;
}

export interface Topic {
    topic_id: number;
    created_by: number;
    name: string;
    description: string;
    created_at: string; // ISO timestamp string
    updated_at: string;
    status: string;
    removed_at: string;
    removed_by: number;
    removal_reason: string;
    post_count: number;
}

export interface Post {
    post_id: number;
    topic_id: number;
    created_by: number;
    title: string;
    body: string;
    created_at: string;
    updated_at?: string;
    status: string;
    removed_at: string;
    removed_by: number;
    removal_reason: string;
    username: string;
    likes?: number;
    comment_count: number;
}

export interface User {
    user_id: number;
    username: string;
    bio?: string;
    created_at: string;
}

export interface Comment {
    comment_id: number;
    post_id: number;
    commented_by: number;
    parent_id: number | null;
    body: string;
    created_at: string;
    updated_at?: string;
    status: string;
    removed_at?: string;
    removed_by?: number;
    removal_reason?: string;
    username: string;
}

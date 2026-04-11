const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchPosts(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function fetchPostBySlug(slug: string) {
  const res = await fetch(`${API_URL}/posts/slug/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}
import type { CreatePostInput, UpdatePostInput } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const fetchPosts = () => fetchWithAuth("/posts");
export const fetchPostById = (id: number) => fetchWithAuth(`/posts/${id}`);
export const fetchPostBySlug = (slug: string) =>
  fetchWithAuth(`/posts/slug/${slug}`);

export const login = (email: string, password: string) =>
  fetchWithAuth("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string, name: string) =>
  fetchWithAuth("/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });

export const getMe = () => fetchWithAuth("/me");

export const createPost = (data: CreatePostInput) =>
  fetchWithAuth("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePost = (id: number, data: UpdatePostInput) =>
  fetchWithAuth(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deletePost = (id: number) =>
  fetchWithAuth(`/posts/${id}`, {
    method: "DELETE",
  });

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const token = getToken();
  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    body: formData,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.url;
};

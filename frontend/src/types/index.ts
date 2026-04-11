export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  author_id: number;
  author?: User;
  created_at: string;
  updated_at: string;
}
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { fetchPosts } from "@/api/client";
import type { Post } from "@/types";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError("Failed to load posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-foreground/70">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-destructive">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-linear-to-br from-background to-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="mb-6 text-4xl sm:text-5xl font-bold text-foreground">
              Welcome to <span className="text-primary">BlogHub</span>
            </h1>
            <p className="mb-8 text-lg text-foreground/70 max-w-2xl mx-auto">
              Discover insightful articles, share your thoughts, and connect
              with a community of passionate writers and readers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#posts"
                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-center"
              >
                Read Articles
              </a>
              {user ? (
                <Link
                  to="/admin/posts/new"
                  className="px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition text-center"
                >
                  Start Writing
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition text-center"
                >
                  Start Writing
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="posts" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Latest Articles
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/50 rounded-lg border border-border focus:border-primary focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">
              No articles found. Try a different search term.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

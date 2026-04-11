import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { fetchPosts } from "@/api/client";
import type { Post } from "@/types";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="mb-6 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Welcome to{" "}
              <span className="text-blue-600 dark:text-blue-400">BlogHub</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover insightful articles, share your thoughts, and connect
              with a community of passionate writers and readers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="#posts"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center"
              >
                Read Articles
              </Link>
              <Link
                to="/admin/posts/new"
                className="px-8 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-center"
              >
                Start Writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="posts" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Articles
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition"
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
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No articles found. Try a different search term.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

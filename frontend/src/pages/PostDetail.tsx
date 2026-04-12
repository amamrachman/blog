import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchPostBySlug, deletePost } from "@/api/client";
import type { Post } from "@/types";
import { useAuth } from "@/context/useAuth";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  async function loadPost() {
    try {
      setLoading(true);
      const data = await fetchPostBySlug(slug!);
      setPost(data);
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsDeleting(true);
      await deletePost(post.id);
      navigate("/admin");
    } catch (err) {
      alert("Failed to delete post");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-foreground/70">Loading...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-destructive mb-4">
            {error || "Post not found"}
          </div>
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary/80 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isAuthor = user?.id === post.author_id;

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-linear-to-br from-background to-card">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-foreground/60 hover:text-primary transition mb-6 group"
          >
            <svg
              className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to all posts
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {post.author?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span>{post.author?.name || "Unknown Author"}</span>
            </div>
            <span>•</span>
            <span>{date}</span>

            {isAuthor && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/posts/${post.id}/edit`}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive hover:underline disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {post.content.split("\n").map(
            (paragraph, index) =>
              paragraph.trim() && (
                <p
                  key={index}
                  className="mb-4 text-foreground/80 leading-relaxed"
                >
                  {paragraph}
                </p>
              ),
          )}
        </div>
      </article>

      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center text-foreground/60 hover:text-primary transition group"
            >
              <svg
                className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to all posts
            </Link>

            {user && (
              <Link
                to="/admin/posts/new"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Write a new post
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

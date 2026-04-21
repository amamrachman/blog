import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import type { JSONContent } from "@tiptap/react";
import { fetchPostBySlug, deletePost } from "@/api/client";
import type { Post } from "@/types";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // isDeleting removed - using toast instead

  const [parsedContent, setParsedContent] = useState<JSONContent | null>(null);

  const contentEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: parsedContent || { type: "doc", content: [{ type: "paragraph" }] },
    editable: false,
  });

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  useEffect(() => {
    return () => {
      contentEditor?.destroy();
    };
  }, []);

  useEffect(() => {
    if (parsedContent && contentEditor) {
      contentEditor.commands.setContent(parsedContent);
    }
  }, [parsedContent, contentEditor]);

  async function loadPost() {
    try {
      setLoading(true);
      const data = await fetchPostBySlug(slug!);
      setPost(data);

      // Parse TipTap content safely
      if (data.content) {
        try {
          const jsonContent: JSONContent =
            typeof data.content === "string"
              ? JSON.parse(data.content)
              : data.content;
          setParsedContent(jsonContent);
        } catch (parseErr) {
          console.warn("Failed to parse TipTap content:", parseErr);
          setParsedContent(null);
        }
      }
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!post) return;

    toast("Apakah yakin ingin menghapus post ini?", {
      duration: 0,
      closeButton: true,
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          await toast.promise(deletePost(post.id), {
            loading: "Menghapus post...",
            success: "Post berhasil dihapus!",
            error: "Gagal menghapus post",
          });
          navigate("/admin");
        },
      },
    });
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
                    className="text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none tiptap-content">
          {contentEditor ? (
            <EditorContent editor={contentEditor} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
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

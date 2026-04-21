import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Editor } from "@/components/Editor";
import { fetchPostById, updatePost, deletePost } from "@/api/client";
import type { Post } from "@/types";
import type { JSONContent } from "@tiptap/react";
import { countWordsFromTiptap } from "@/utils/tiptap";
import { toast } from "sonner";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: JSONContent | undefined;
  }>({
    title: "",
    content: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  async function loadPost() {
    try {
      setLoading(true);
      const data = await fetchPostById(parseInt(id!));
      setPost(data);
      setFormData({
        title: data.title,
        content:
          typeof data.content === "string"
            ? JSON.parse(data.content)
            : data.content,
      });
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "content") return; // content handled by Editor
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = useCallback((content: JSONContent) => {
    setFormData((prev) => ({ ...prev, content }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePost(parseInt(id!), {
        title: formData.title,
        content: JSON.stringify(formData.content),
      });
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await toast.promise(deletePost(parseInt(id!)), {
      loading: "Menghapus post...",
      success: "Post berhasil dihapus!",
      error: "Gagal menghapus post",
    });
    navigate("/admin");
  };

  const wordCount = countWordsFromTiptap(formData.content);

  if (loading || !post) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="text-center max-w-md">
          {loading ? (
            <div className="text-foreground/70">Loading...</div>
          ) : (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Post Not Found
              </h1>
              <p className="text-foreground/60 mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition"
              >
                <svg
                  className="w-4 h-4"
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
                Back to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4 group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Edit Post
            </h1>
            <p className="text-foreground/60">
              Update your article content and settings
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6"
          >
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Post Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title..."
                className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder-foreground/50 rounded-lg border border-border focus:border-primary focus:outline-none transition"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Post Content <span className="text-destructive">*</span>
              </label>
              <div className="h-125 mb-2">
                <Editor
                  initialContent={formData.content}
                  onChange={handleEditorChange}
                />
              </div>
            </div>

            {/* Word Count */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Statistics
              </label>
              <div className="px-4 py-2.5 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-foreground/70">
                  📊 Word count:{" "}
                  <span className="font-semibold text-foreground">
                    {wordCount}
                  </span>
                  {wordCount > 500 && (
                    <span className="ml-2 text-xs text-green-500">
                      ✓ Good length
                    </span>
                  )}
                  {wordCount < 300 && (
                    <span className="ml-2 text-xs text-amber-500">
                      ⚠️ Consider adding more content
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Last edited info */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-foreground/70 text-center">
                Last edited: {new Date(post!.updated_at).toLocaleString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (formData.title === post.title &&
                    JSON.stringify(formData.content) === post.content)
                }
                className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border border-destructive text-destructive font-semibold rounded-lg hover:bg-destructive/10 transition"
              >
                🗑️ Delete Post
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Delete Post?
              </h2>
              <p className="text-foreground/60">
                Are you sure you want to delete "
                <span className="font-semibold text-foreground">
                  {formData.title}
                </span>
                "? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-border text-foreground rounded-lg hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

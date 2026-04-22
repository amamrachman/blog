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

      let parsedContent: JSONContent;
      try {
        parsedContent =
          typeof data.content === "string"
            ? JSON.parse(data.content)
            : data.content;
      } catch (e) {
        console.error("Error parsing content:", e);
        parsedContent = { type: "doc", content: [] };
      }

      setPost(data);
      setFormData({
        title: data.title,
        content: parsedContent || { type: "doc", content: [] },
      });
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

    if (!formData.title.trim() || !formData.content) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePost(parseInt(id!), {
        title: formData.title,

        content: formData.content,
      });
      toast.success("Post updated successfully!");
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deletePost(parseInt(id!));
      toast.success("Post deleted successfully!");
      navigate("/admin");
    } catch {
      toast.error("Failed to delete post");
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const wordCount = countWordsFromTiptap(formData.content);

  if (loading || !post) {
    return (
      <div className="flex h-screen bg-background items-center justify-center p-8">
        <div className="text-center max-w-md">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <div className="text-foreground/70 font-medium">
                Loading post data...
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Post Not Found
              </h1>
              <p className="text-foreground/60 mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-primary hover:underline transition"
              >
                ← Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4 group"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
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
            <h1 className="text-3xl font-bold text-foreground">Edit Post</h1>
            <p className="text-foreground/60">
              Update your article content and settings
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm"
          >
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground"
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
                required
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Post Content <span className="text-destructive">*</span>
              </label>
              <div className="h-125 rounded-lg overflow-hidden border border-border shadow-inner bg-white">
                <Editor
                  initialContent={formData.content}
                  onChange={handleEditorChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="px-4 py-3 bg-secondary/50 rounded-lg border border-border flex items-center gap-3">
                <span className="text-lg">📊</span>
                <p className="text-sm text-foreground/70">
                  Words:{" "}
                  <span className="font-bold text-foreground">{wordCount}</span>
                </p>
              </div>
              <div className="px-4 py-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
                <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">
                  Last edited:{" "}
                  {new Date(post.updated_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (formData.title === post.title &&
                    JSON.stringify(formData.content) ===
                      JSON.stringify(post.content))
                }
                className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {isSubmitting ? "Saving Changes..." : "💾 Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border border-destructive text-destructive font-semibold rounded-lg hover:bg-destructive/5 transition-all active:scale-[0.98]"
              >
                🗑️ Delete Post
              </button>
            </div>
          </form>
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Delete this post?
              </h2>
              <p className="text-foreground/60 text-sm">
                You are about to delete "
                <span className="font-semibold text-foreground">
                  {formData.title}
                </span>
                ". This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-border text-foreground font-medium rounded-xl hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-destructive text-white font-medium rounded-xl hover:bg-destructive/90 transition-colors disabled:opacity-50"
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

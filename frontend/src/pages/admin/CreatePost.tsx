import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Editor } from "@/components/Editor";
import { AdminSidebar } from "@/components/AdminSidebar";
import { createPost } from "@/api/client";
import { type JSONContent } from "@tiptap/react";

export default function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    title: string;
    content: JSONContent | undefined;
  }>({
    title: "",
    content: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "content") return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = useCallback((content: JSONContent) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
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
      await createPost({
        title: formData.title,
        content: formData.content,
      });
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Create New Post
            </h1>
            <p className="text-foreground/60">
              Share your thoughts and ideas with the community
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-sm"
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
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your post title"
                required
                className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder-foreground/40 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Content <span className="text-destructive">*</span>
              </label>

              <div className="h-125 rounded-lg overflow-hidden border border-border shadow-inner">
                <Editor
                  initialContent={formData.content}
                  onChange={handleEditorChange}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

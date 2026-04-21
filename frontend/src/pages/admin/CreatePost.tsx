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
    if (name === "content") return; // content handled by Editor
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

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        title: formData.title,
        content: JSON.stringify(formData.content),
      });
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Create New Post
            </h1>
            <p className="text-foreground/60">
              Share your thoughts and ideas with the community
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6"
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
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your post title"
                required
                className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder-foreground/50 rounded-lg border border-border focus:border-primary focus:outline-none transition"
              />
              <p className="mt-1 text-xs text-foreground/50">
                A catchy title helps your post get noticed
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content <span className="text-destructive">*</span>
              </label>
              {/* Tambahkan tinggi tetap di sini jika ingin area ketik punya scroll sendiri */}
              <div className="h-125">
                <Editor
                  initialContent={formData.content}
                  onChange={handleEditorChange}
                />
              </div>
              <p className="mt-2 text-xs text-foreground/50">
                Rich text editor with formatting options
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Publishing...
                  </span>
                ) : (
                  "Publish Post"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
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

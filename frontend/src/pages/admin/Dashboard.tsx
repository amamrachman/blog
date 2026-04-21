import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { fetchPosts, deletePost } from "@/api/client";
import type { Post } from "@/types";
import { useAuth } from "@/context/useAuth";
import { countWordsFromTiptap } from "@/utils/tiptap";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPosts = posts.length;

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await fetchPosts();

      const myPosts = data.filter((post: Post) => post.author_id === user?.id);
      setPosts(myPosts);
    } catch (err) {
      setError("Failed to load posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    toast("Apakah yakin ingin menghapus post ini?", {
      duration: 0,
      closeButton: true,
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          await toast.promise(deletePost(id), {
            loading: "Menghapus post...",
            success: "Post berhasil dihapus! ✅",
            error: "Gagal menghapus post 😞",
          });
          setPosts(posts.filter((p) => p.id !== id));
        },
      },
    });
  }

  const thisMonthPosts = posts.filter((p) => {
    const date = new Date(p.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  // Removed parseContent - countWordsFromTiptap now handles string directly

  const avgWords =
    posts.length > 0
      ? Math.round(
          posts.reduce((acc, p) => acc + countWordsFromTiptap(p.content), 0) /
            posts.length,
        )
      : 0;

  const stats = [
    {
      label: "Total Posts",
      value: totalPosts.toString(),
      icon: "📝",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Total Views",
      value: "0",
      icon: "👁️",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      label: "This Month",
      value: thisMonthPosts.toString(),
      icon: "📅",
      color: "bg-green-500/10 text-green-500",
    },
    {
      label: "Avg Words",
      value: avgWords.toString(),
      icon: "✍️",
      color: "bg-amber-500/10 text-amber-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-foreground/70">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-foreground/60">
              Welcome back! Here's your blog statistics.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`text-2xl p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Posts */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                Recent Posts
              </h2>
              <Link
                to="/admin/posts/new"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium text-center sm:text-left"
              >
                + Create Post
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-foreground/60 mb-4">
                  Start writing your first blog post!
                </p>
                <Link
                  to="/admin/posts/new"
                  className="text-primary hover:underline font-medium"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground/80">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/80">
                        Words
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/80">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-border hover:bg-secondary/30 transition"
                      >
                        <td className="py-3 px-4">
                          <Link
                            to={`/post/${post.slug}`}
                            className="font-medium text-foreground line-clamp-1 hover:text-primary transition"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-foreground/80">
                          {countWordsFromTiptap(post.content)}
                        </td>
                        <td className="py-3 px-4 text-foreground/80">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/posts/${post.id}/edit`}
                              className="text-primary hover:text-primary/80 text-sm font-medium transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-destructive hover:text-destructive/80 text-sm font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

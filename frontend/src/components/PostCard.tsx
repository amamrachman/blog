import { Link } from "react-router-dom";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group flex flex-col border border-border rounded-xl bg-card overflow-hidden hover:border-primary/50 transition">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-xs">
              {post.author?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <span>{post.author?.name || "Unknown"}</span>
          <span>•</span>
          <span>{date}</span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h3>

        <Link
          to={`/post/${post.slug}`}
          className="inline-flex items-center text-primary text-sm font-medium hover:underline mt-auto"
        >
          Read more
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}

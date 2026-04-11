import { Link } from "react-router-dom";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { title, content, slug, author, created_at } = post;

  const excerpt = content
    ? content.substring(0, 150) + (content.length > 150 ? "..." : "")
    : "No description available";

  const date = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/post/${slug}`} className="block h-full">
      <article className="group h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300">
        <div className="flex-1 flex flex-col">
          <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {title}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
            {excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {author?.name || "Unknown"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {date}
              </span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium group-hover:bg-blue-600 group-hover:text-white transition">
              Read
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

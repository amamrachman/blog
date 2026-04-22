import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const navItems = [
    {
      icon: "📊",
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: "✍️",
      label: "Create Post",
      href: "/admin/posts/new",
    },
    {
      icon: "📝",
      label: "All Posts",
      href: "/admin",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border text-foreground shadow-sm"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border">
            <Link
              to="/admin"
              className="flex items-center gap-2"
              onClick={handleLinkClick}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">B</span>
              </div>
              <span className="text-xl font-bold text-foreground">BlogHub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-1">
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-foreground/50 truncate">
                  {user?.email || "admin@bloghub.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-foreground/40 hover:text-destructive transition p-1"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            BlogHub
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-foreground/80 hover:text-primary transition"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/admin"
                  className="text-foreground/80 hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <span className="text-foreground/60 text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-foreground/80 hover:text-primary transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-foreground/60 text-sm">
          <p>© 2026 BlogHub. Built with Vite + React + Go Fiber.</p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "@/api/client";
import { useAuth } from "@/context/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);
      authLogin(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen flex overflow-hidden bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/90 to-primary/60 flex-col items-center justify-center relative h-full flex-none">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 text-center px-8">
          <div className="mb-6">
            <span className="text-5xl font-bold text-white">BlogHub</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-white/80 text-lg max-w-md">
            Sign in to continue your journey of sharing and discovering amazing
            stories.
          </p>
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto bg-background focus:outline-none">
        <div className="min-h-full flex flex-col items-center justify-center sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center lg:hidden mb-8">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">B</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-foreground/60">
                Sign in to your BlogHub account
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card m-6 sm:p-8 shadow-sm">
              <div className="hidden lg:block mb-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">B</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome Back
                </h1>
                <p className="mt-2 text-sm text-foreground/60">
                  Sign in to your BlogHub account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/40 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <Link
                      to="#"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/40 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-primary-foreground"
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-foreground/60">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <footer className="mt-8 text-center text-xs text-foreground/40">
                <p>© 2026 BlogHub. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

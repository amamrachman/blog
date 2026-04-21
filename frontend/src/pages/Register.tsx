import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api/client";
import { useAuth } from "@/context/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const data = await register(email, password, name);
      authLogin(data.token, data.user);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/90 to-primary/60 flex-col items-center justify-center relative h-full flex-none">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 text-center px-8">
          <div className="mb-6">
            <span className="text-5xl font-bold text-white">BlogHub</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community!
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Start your journey as a writer and share your stories with thousands
            of readers.
          </p>
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto bg-background">
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center lg:hidden mb-8">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">B</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-foreground/60">
                Join BlogHub and start sharing your thoughts
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="hidden lg:block mb-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">B</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Create Account
                </h1>
                <p className="mt-2 text-sm text-foreground/60">
                  Join BlogHub and start sharing your thoughts
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/40 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

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
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Password
                  </label>
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/40 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-foreground/60">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

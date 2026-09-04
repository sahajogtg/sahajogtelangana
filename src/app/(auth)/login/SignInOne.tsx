"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

type LoginErrorType = {
  email?: string;
  password?: string;
};

export default function SignInOne({ error }: { error?: string }) {
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setError] = useState<LoginErrorType>();

  useEffect(() => {
    if (error) {
      console.log("Error from NextAuth:", error);
      setError({ email: error, password: "" });
    }
  }, [error]);

  const submitForm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const response = await res.json();

      if (response.status === 200) {
        const result = await signIn("credentials", {
          email: authData.email,
          password: authData.password,
          callbackUrl: "/",
          redirect: false,
        });

        if (result?.error) {
          setLoading(false);
          setError({ email: "Authentication failed: " + result.error, password: "" });
        } else if (result?.url) {
          window.location.href = result.url;
        }
      } else if (response.status === 400) {
        setLoading(false);
        setError(response?.errors);
      }
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
      setError({ email: "An error occurred during login", password: "" });
    }
  };

  const githubSignIn = async () => {
    await signIn("github", { callbackUrl: "/", redirect: true });
  };

  const googleLogin = async () => {
    await signIn("google", { callbackUrl: "/", redirect: true });
  };

  return (
    <section className="flex min-h-screen flex-col bg-[color:var(--bg)] text-[color:var(--ink)]">
      <Toast />
      <div className="grid flex-grow grid-cols-1 lg:grid-cols-2">
        {/* Left Sanctum Panel */}
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,var(--surface-2),var(--bg)_60%)] lg:flex lg:items-center lg:justify-center">
          <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-[color:color-mix(in_srgb,var(--accent-200)_50%,transparent)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[color:color-mix(in_srgb,var(--primary-200)_40%,transparent)] blur-3xl" />

          <div className="relative px-10 text-center">
            <div className="arch relative mx-auto h-[440px] w-[320px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] shadow-panel">
              <Image
                src="/pune.jpeg"
                alt="Sahaja Yoga"
                fill
                sizes="320px"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--primary-700)_30%,transparent)] via-transparent to-transparent" />
            </div>
            <div className="mx-auto -mt-2 flex h-12 w-40 items-center justify-center rounded-b-[20px] border border-t-0 border-[color:var(--border)] bg-[color:var(--surface)] shadow-card">
              <p className="eyebrow !tracking-[0.3em]">Sahaja Yoga</p>
            </div>
            <h3 className="mt-10 font-display text-[clamp(24px,2.6vw,32px)] leading-[1.25] text-[color:var(--ink)]">
              Welcome back
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.7] text-[color:var(--muted)]">
              Settle into silence. Your meditation practice awaits.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="eyebrow">Sign In</p>
              <h1 className="mt-3 font-display text-[clamp(28px,3.2vw,36px)] leading-[1.15] tracking-[-0.015em] text-[color:var(--ink)]">
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] text-[color:var(--muted)]">
                Sign in to continue your journey.
              </p>
            </div>

            <div className="space-y-5 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-panel sm:p-8">
              <form onSubmit={(e) => { e.preventDefault(); submitForm(); }} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    value={authData.email}
                    className="admin-input"
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  />
                  {errors?.email && <p className="mt-1.5 text-[13.5px] text-[color:var(--danger)]">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={authData.password}
                    className="admin-input"
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  />
                  {errors?.password && <p className="mt-1.5 text-[13.5px] text-[color:var(--danger)]">{errors.password}</p>}
                  <div className="mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm text-[color:var(--primary)] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading && <LoadingSpinner />}
                  {loading ? "Processing..." : "Sign In"}
                </button>
              </form>

              <div>
                <Link href="/register" className="btn btn-secondary w-full">
                  Create Account
                </Link>
              </div>

              <div>
                <Link href="/login/phone" className="btn btn-secondary w-full">
                  Login with Phone
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[color:var(--border)]" />
                <span className="text-[13px] text-[color:var(--muted)]">or continue with</span>
                <div className="h-px flex-1 bg-[color:var(--border)]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={googleLogin}
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={githubSignIn}
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

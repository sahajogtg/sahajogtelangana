"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Toast from "@/components/Toast";

export default function SignInOne() {
  const searchParam = useSearchParams();

  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setError] = useState<LoginErrorType>();

  useEffect(() => {
    const error = searchParam.get("error");
    if (error) {
      console.log("Error from NextAuth:", error);
      setError({ 
        email: error,
        password: ""
      });
    }
  }, [searchParam]);

  //   * Submit the data
  const submitForm = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", authData);
      const response = res.data;
      console.log("API response:", response);
      
      if (response.status === 200) {
        // Direct NextAuth signin
        const result = await signIn("credentials", {
          email: authData.email,
          password: authData.password,
          callbackUrl: "/",
          redirect: false
        });
        
        console.log("NextAuth signin result:", result);
        
        if (result?.error) {
          setLoading(false);
          setError({
            email: "Authentication failed: " + result.error,
            password: ""
          });
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
      setError({
        email: "An error occurred during login",
        password: ""
      });
    }
  };

  // * Github signin
  const githubSignIn = async () => {
    await signIn("github", {
      callbackUrl: "/",
      redirect: true,
    });
  };

  // * Google login
  const googleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <section className="min-h-screen flex flex-col">
      <Toast/>
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
        {/* Left Image Panel */}
        <div className="relative flex items-center justify-center px-4 py-10 bg-cover bg-center lg:px-8">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="/pune.jpeg"
              alt="Sahaja Yoga"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-4xl font-bold text-white">Sahaja Yoga</h3>
            <h2 className="text-white text-xl font-semibold mt-4">Welcome back</h2>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Login</h2>
            </div>
            <form action="#" method="POST" className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-base font-medium text-gray-900">Email address</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                />
                {errors?.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label className="text-base font-medium text-gray-900">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                />
                {errors?.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <div className="text-right mt-2">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="button"
                  onClick={submitForm}
                  className={`w-full rounded-md px-4 py-2 text-white font-semibold transition ${
                    loading ? "bg-gray-600" : "bg-black hover:bg-black/80"
                  }`}
                >
                  {loading ? "Processing..." : "Login"}
                </button>
              </div>

              {/* Create Account Button */}
              <div>
                <Link href="/register">
                  <button
                    type="button"
                    className="w-full rounded-md bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white font-semibold transition"
                  >
                    Create Account
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

  );
}

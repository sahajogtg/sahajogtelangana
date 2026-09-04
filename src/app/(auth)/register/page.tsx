"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SignUp() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [userState, setUserState] = useState({
    email: "",
    password: "",
    name: "",
    password_confirmation: "",
    homePractice: "",
  });

  const [errors, setError] = useState<registerErrorType>({});
  const [isHomePracticeCorrect, setIsHomePracticeCorrect] = useState(false);

  const normalizeHomePractice = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z]/g, "");

  const editDistance = (left: string, right: string) => {
    const distances = Array.from({ length: left.length + 1 }, (_, index) => index);

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      let previous = distances[0];
      distances[0] = rightIndex;

      for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        const current = distances[leftIndex];
        const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

        distances[leftIndex] = Math.min(
          distances[leftIndex] + 1,
          distances[leftIndex - 1] + 1,
          previous + substitutionCost
        );
        previous = current;
      }
    }

    return distances[left.length];
  };

  const isCloseAnswer = (answer: string, validAnswer: string) => {
    if (answer.includes(validAnswer) || validAnswer.includes(answer)) {
      return true;
    }

    const allowedDistance = validAnswer.length <= 8 ? 2 : 3;
    return editDistance(answer, validAnswer) <= allowedDistance;
  };

  const checkHomePracticeAnswer = (answer: string) => {
    const normalized = normalizeHomePractice(answer);

    if (!normalized) {
      return false;
    }

    const validAnswers = [
      "bandhan",
      "takebandhan",
      "takeabandhan",
      "givebandhan",
      "giveabandhan",
      "doabandhan",
      "dobandhan",
      "putbandhan",
      "putabandhan",
      "awakenkundalini",
      "awakenyourkundalini",
      "raisekundalini",
      "raiseyourkundalini",
      "liftkundalini",
      "liftyourkundalini",
    ].map(normalizeHomePractice);

    const acceptedKeywords = ["bandhan", "kundalini"].map(normalizeHomePractice);

    return (
      validAnswers.some((validAnswer) => isCloseAnswer(normalized, validAnswer)) ||
      acceptedKeywords.some((keyword) => isCloseAnswer(normalized, keyword))
    );
  };

  const handleHomePracticeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    setUserState({ ...userState, homePractice: answer });
    setIsHomePracticeCorrect(checkHomePracticeAnswer(answer));
  };

  const submitForm = async () => {
    setLoading(true);
    console.log("The payload is", userState);
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userState),
    })
      .then((res) => res.json())
      .then((response) => {
        setLoading(false);
        console.log("The response is", response);
        if (response.status == 200) {
          router.push(`/login?message=${response.msg}`);
        } else if (response?.status == 400) {
          setError(response?.errors);
        } else {
          setError({});
        }
      })
      .catch((err) => {
        console.log("The error is", err);
        setLoading(false);
      });
  };

  // * Github signin
  const githubSignIn = () => {
    signIn("github", {
      callbackUrl: "/",
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
    <section className="min-h-screen flex flex-col bg-[color:var(--bg)] text-[color:var(--ink)]">
      <div className="grid flex-grow grid-cols-1 lg:grid-cols-2">
        {/* Left Sanctum Panel */}
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,var(--surface-2),var(--bg)_60%)] lg:flex lg:items-center lg:justify-center">
          <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-[color:color-mix(in_srgb,var(--accent-200)_50%,transparent)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[color:color-mix(in_srgb,var(--primary-200)_40%,transparent)] blur-3xl" />
          <div className="relative px-10 text-center">
            <div className="arch relative mx-auto h-[440px] w-[320px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] shadow-panel">
              <Image src="/pune.jpeg" alt="" fill sizes="320px" className="object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--primary-700)_30%,transparent)] via-transparent to-transparent" />
            </div>
            <div className="mx-auto -mt-2 flex h-12 w-40 items-center justify-center rounded-b-[20px] border border-t-0 border-[color:var(--border)] bg-[color:var(--surface)] shadow-card">
              <p className="eyebrow !tracking-[0.3em]">Sahaja Yoga</p>
            </div>
            <h3 className="mt-10 font-display text-[clamp(24px,2.6vw,32px)] leading-[1.25] text-[color:var(--ink)]">
              Register as a Sahaja Yogi
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.7] text-[color:var(--muted)]">
              Begin your journey of self-realization and inner peace.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="eyebrow">Create Account</p>
              <h1 className="mt-3 font-display text-[clamp(28px,3.2vw,36px)] leading-[1.15] tracking-[-0.015em] text-[color:var(--ink)]">
                Sign up
              </h1>
              <p className="mt-2 text-[15px] text-[color:var(--muted)]">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-[color:var(--primary)] hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-panel sm:p-8">
              <form action="#" method="POST">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                      Full Name
                    </label>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Full Name"
                      id="name"
                      onChange={(e) => setUserState({ ...userState, name: e.target.value })}
                    />
                    {errors?.name && <span className="mt-1.5 block text-[13.5px] text-[color:var(--danger)]">{errors.name}</span>}
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                      Email address
                    </label>
                    <input
                      className="admin-input"
                      type="email"
                      placeholder="Email"
                      id="email"
                      onChange={(e) => setUserState({ ...userState, email: e.target.value })}
                    />
                    {errors?.email && <span className="mt-1.5 block text-[13.5px] text-[color:var(--danger)]">{errors.email}</span>}
                  </div>
                  <div>
                    <label htmlFor="password" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                      Password
                    </label>
                    <input
                      className="admin-input"
                      type="password"
                      placeholder="Password"
                      id="password"
                      onChange={(e) => setUserState({ ...userState, password: e.target.value })}
                    />
                    {errors?.password && <span className="mt-1.5 block text-[13.5px] text-[color:var(--danger)]">{errors.password}</span>}
                  </div>
                  <div>
                    <label htmlFor="password_confirmation" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                      Confirm Password
                    </label>
                    <input
                      className="admin-input"
                      type="password"
                      placeholder="Confirm Password"
                      id="password_confirmation"
                      onChange={(e) =>
                        setUserState({ ...userState, password_confirmation: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="homePractice" className="mb-2 block text-[14px] font-medium text-[color:var(--muted)]">
                      What should we do before leaving home?
                    </label>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Enter your answer"
                      id="homePractice"
                      onChange={handleHomePracticeChange}
                      value={userState.homePractice}
                    />
                    {!isHomePracticeCorrect && userState.homePractice && (
                      <span className="mt-1.5 block text-[13.5px] text-[color:var(--danger)]">
                        Please enter the correct answer.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn w-full ${
                      loading || !isHomePracticeCorrect ? "btn-disabled" : "btn-primary"
                    }`}
                    onClick={submitForm}
                    disabled={loading || !isHomePracticeCorrect}
                  >
                    {loading && <LoadingSpinner />}
                    {loading ? "Processing..." : "Create Account"}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <Link href="/login/phone" className="btn btn-secondary w-full">
                  Register with Phone
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

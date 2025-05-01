"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignUp() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [userState, setUserState] = useState({
    email: "",
    password: "",
    name: "",
    password_confirmation: "",
    dhanvantari: "", // New field for the Dhanvantari question
  });

  const [errors, setError] = useState<registerErrorType>({});
  const [isDhanvantariCorrect, setIsDhanvantariCorrect] = useState(false);

  // Function to check if the Dhanvantari answer is correct
  const checkDhanvantariAnswer = (answer: string) => {
    const correctAnswers = ['dhanvantari', 'dhanwantari', 'dhanwantri', 'dhnwantri', 'dhnwntri'];
    return correctAnswers.includes(answer.toLowerCase().trim());
  };

  const handleDhanvantariChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    setUserState({ ...userState, dhanvantari: answer });
    setIsDhanvantariCorrect(checkDhanvantariAnswer(answer));
  };

  const submitForm = async () => {
    setLoading(true);
    console.log("The payload is", userState);
    axios
      .post("/api/auth/register", userState)
      .then((res) => {
        setLoading(false);
        console.log("The response is", res.data);
        const response = res.data;
        if (response.status == 200) {
          router.push(`/login?message=${response.msg}`);
        } else if (response?.status == 400) {
          setError(response?.errors);
        } else {
          setError({});
        }
      })
      .catch((err) => console.log("The error is", err));
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
    <section className="min-h-screen flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
        <div className="relative flex items-center justify-center px-4 py-10 bg-cover bg-center lg:px-8">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="/sahaja.jpg"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-4xl font-bold text-white">
              Sahaja Yoga
            </h3>
            <h2 className="text-white text-xl font-semibold mt-4">
              Register as a Sahaja Yogi
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
                Sign up
              </h2>
              <p className="mt-2 text-base text-gray-600">
                Already have an account?
                <Link
                  href="/login"
                  className="font-medium text-black transition-all duration-200 hover:underline ml-2"
                >
                  Sign In
                </Link>
              </p>
            </div>
            <form action="#" method="POST" className="mt-8">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="text-base font-medium text-gray-900"
                  >
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="Full Name"
                      id="name"
                      onChange={(e) =>
                        setUserState({ ...userState, name: e.target.value })
                      }
                    ></input>
                    <span className="text-red-500 font-bold">
                      {errors?.name}
                    </span>
                  </div>
                </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-base font-medium text-gray-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="email"
                      placeholder="Email"
                      id="email"
                      onChange={(e) =>
                        setUserState({ ...userState, email: e.target.value })
                      }
                    ></input>
                    <span className="text-red-500 font-bold">
                      {errors?.email}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-base font-medium text-gray-900"
                    >
                      Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="password"
                      placeholder="Password"
                      id="password"
                      onChange={(e) =>
                        setUserState({ ...userState, password: e.target.value })
                      }
                    ></input>
                    <span className="text-red-500 font-bold">
                      {errors?.password}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-base font-medium text-gray-900"
                    >
                      Confirm Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="password"
                      placeholder="Confirm Password"
                      id="password_confirmation"
                      onChange={(e) =>
                        setUserState({
                          ...userState,
                          password_confirmation: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dhanvantari"
                    className="text-base font-medium text-gray-900 mt-4"
                  >
                    Which swaroop of Adishakti is referred to as the Doctor swaroop?
                  </label>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-4 mb-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="Enter the name of the swaroop"
                      id="dhanvantari"
                      onChange={handleDhanvantariChange}
                      value={userState.dhanvantari}
                    />
                    {!isDhanvantariCorrect && userState.dhanvantari && (
                      <span className="text-red-500 font-bold">
                        Please enter the correct swaroop name.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full items-center justify-center rounded-md px-3.5 py-2.5 font-semibold leading-7 text-white ${
                      loading || !isDhanvantariCorrect
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-black/80"
                    }`}
                    onClick={submitForm}
                    disabled={loading || !isDhanvantariCorrect}
                  >
                    {loading ? "Processing..." : "Create Account"}
                  </button>
                  </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
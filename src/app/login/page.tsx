"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoUser = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const seedDemoUser = () => {
    const existingUsers = JSON.parse(
      localStorage.getItem("careerflow_users") || "[]"
    );

    const demoExists = existingUsers.some(
      (user: DemoUser) => user.username === "user1"
    );

    if (!demoExists) {
      const updatedUsers = [
        ...existingUsers,
        {
          username: "user1",
          password: "User1@123",
        },
      ];

      localStorage.setItem("careerflow_users", JSON.stringify(updatedUsers));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    seedDemoUser();

    const users = JSON.parse(localStorage.getItem("careerflow_users") || "[]");

    const matchedUser = users.find(
      (user: DemoUser) =>
        user.username === formData.username &&
        user.password === formData.password
    );

    if (!matchedUser) {
      setError("Invalid username or password.");
      return;
    }

    localStorage.setItem(
      "careerflow_logged_in_user",
      JSON.stringify({ username: matchedUser.username })
    );

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Login to CareerFlow</h1>
          <p className="mt-2 text-slate-400">
            Recruiters can test the app using the demo account.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm">
          <p className="font-semibold text-emerald-300">Demo Login</p>
          <p className="mt-2 text-slate-200">Username: user1</p>
          <p className="text-slate-200">Password: User1@123</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
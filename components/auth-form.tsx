"use client";

import Link from "next/link";
import { Facebook, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = register
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = register
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const social = (provider: string) => {
    setError(`${provider} login is not connected yet.`);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-7xl place-items-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-soft md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-zinc-950 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-xl font-black tracking-[-0.12em]">
              ATELIER<span className="text-zinc-500">/</span>
            </p>

            <p className="mt-8 text-3xl font-black leading-tight tracking-[-0.055em]">
              Less noise.
              <br />
              More considered living.
            </p>
          </div>

          <p className="text-sm leading-6 text-zinc-400">
            Your saved pieces and orders travel with you, wherever you shop.
          </p>
        </div>

        <div className="p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
            Welcome {register ? "to Atelier" : "back"}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
            {register ? "Create your account" : "Sign in to your account"}
          </h1>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {register && (
              <Field
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Your name"
                icon={<UserRound size={16} />}
              />
            )}

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
              icon={<Mail size={16} />}
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={<LockKeyhole size={16} />}
            />

            {!register && (
              <Link
                href="/contact"
                className="block text-right text-xs font-medium underline"
              >
                Forgot password?
              </Link>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-950 py-3.5 text-xs font-bold tracking-[0.13em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "PLEASE WAIT..."
                : register
                  ? "CREATE ACCOUNT"
                  : "LOGIN"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            or continue with
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => social("Google")}
              className="rounded-xl border border-zinc-200 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              G Google
            </button>

            <button
              type="button"
              onClick={() => social("Facebook")}
              className="flex items-center justify-center gap-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              <Facebook size={15} />
              Facebook
            </button>
          </div>

          <p className="mt-7 text-center text-sm text-zinc-500">
            {register ? "Already have an account?" : "New to Atelier?"}{" "}
            <Link
              href={register ? "/login" : "/register"}
              className="font-bold text-zinc-950 underline"
            >
              {register ? "Log in" : "Create one"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>

      <span className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-3 text-zinc-400 focus-within:border-zinc-950">
        <span>{icon}</span>

        <input
          type={type}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 text-sm font-normal text-zinc-950 outline-none placeholder:text-zinc-400"
        />
      </span>
    </label>
  );
}
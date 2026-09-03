"use client";

import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const tabs = [
  { label: "My orders", icon: Package },
  { label: "Wishlist", icon: Heart },
  { label: "Addresses", icon: MapPin },
  { label: "Account settings", icon: Settings },
];

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState("My orders");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
          Loading your account...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-black tracking-[-0.06em]">
        My account
      </h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[255px_1fr]">
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 p-3 pb-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-zinc-100">
              <UserRound size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-1">
            {tabs.map(({ label, icon: Icon }) => (
              <button
                onClick={() => setActive(label)}
                key={label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  active === label
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}

            <button
              onClick={signOut}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-100"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-black tracking-[-0.04em]">
            {active}
          </h2>

          <ProfileContent
            active={active}
            email={user.email}
          />
        </section>
      </div>
    </div>
  );
}

function ProfileContent({
  active,
  email,
}: {
  active: string;
  email: string;
}) {
  if (active === "My orders") {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500">
        Your placed orders will appear here.
      </div>
    );
  }

  if (active === "Wishlist") {
    return (
      <p className="mt-5 text-sm text-zinc-500">
        Your saved pieces are available on the{" "}
        <a href="/wishlist" className="underline">
          Wishlist page
        </a>
        .
      </p>
    );
  }

  if (active === "Addresses") {
    return (
      <div className="mt-6 rounded-xl bg-zinc-50 p-5 text-sm text-zinc-500">
        No saved addresses yet. Your checkout address can be saved here soon.
      </div>
    );
  }

  return (
    <form className="mt-6 max-w-md space-y-4">
      <label className="block text-sm font-bold">
        Email
        <input
          defaultValue={email}
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 font-normal outline-none"
        />
      </label>

      <label className="block text-sm font-bold">
        Newsletter preference
        <select className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 font-normal">
          <option>Occasional Atelier updates</option>
          <option>Do not email me</option>
        </select>
      </label>

      <button
        type="button"
        className="rounded-lg bg-zinc-950 px-5 py-3 text-xs font-bold tracking-[0.1em] text-white"
      >
        SAVE CHANGES
      </button>
    </form>
  );
}
"use client";

import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  UserRound,
  Trash2,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

type Order = {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    colour?: string;
    image?: string;
  }>;
};

type Address = {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    if (active === "My orders") {
      setLoadingContent(true);
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingContent(false));
    } else if (active === "Addresses") {
      setLoadingContent(true);
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingContent(false));
    }
  }, [active]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses([data.address, ...addresses]);
        setShowAddressForm(false);
        setAddressForm({
          fullName: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          phone: "",
        });
      }
    } catch (err) {
      console.error("Failed to add address:", err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setAddresses(addresses.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  if (active === "My orders") {
    if (loadingContent) {
      return <div className="mt-6 text-sm text-zinc-500">Loading your orders...</div>;
    }

    if (!orders.length) {
      return (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500">
          Your placed orders will appear here.
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-zinc-200 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 text-sm">
              <div>
                <span className="font-bold">Order #{order.id.slice(-8).toUpperCase()}</span>
                <span className="ml-3 text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {order.status}
                </span>
                <span className="font-bold">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs text-zinc-500">
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`}{" "}
                      {item.colour && `• ${item.colour}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (active === "Wishlist") {
    return (
      <p className="mt-5 text-sm text-zinc-500">
        Your saved pieces are available on the{" "}
        <Link href="/wishlist" className="underline font-semibold">
          Wishlist page
        </Link>
        .
      </p>
    );
  }

  if (active === "Addresses") {
    if (loadingContent) {
      return <div className="mt-6 text-sm text-zinc-500">Loading addresses...</div>;
    }

    return (
      <div className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-zinc-600">Manage your shipping addresses.</p>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800"
          >
            <Plus size={14} /> {showAddressForm ? "Cancel" : "Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="rounded-xl border border-zinc-200 p-5 space-y-4 bg-zinc-50">
            <h3 className="font-bold text-sm">Add New Address</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
              />
              <input
                placeholder="Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
              />
              <input
                required
                placeholder="Address Line 1"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm sm:col-span-2 bg-white"
              />
              <input
                required
                placeholder="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
              />
              <input
                required
                placeholder="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
              />
              <input
                required
                placeholder="Postal / ZIP Code"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
            >
              SAVE ADDRESS
            </button>
          </form>
        )}

        {addresses.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="relative rounded-xl border border-zinc-200 p-4"
              >
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <p className="font-bold text-sm">{address.fullName}</p>
                <p className="text-xs text-zinc-600 mt-1">{address.line1}</p>
                {address.line2 && <p className="text-xs text-zinc-600">{address.line2}</p>}
                <p className="text-xs text-zinc-600">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                {address.phone && <p className="text-xs text-zinc-500 mt-2">Phone: {address.phone}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-5 text-sm text-zinc-500">
            No saved addresses yet.
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="mt-6 max-w-md space-y-4">
      <label className="block text-sm font-bold">
        Email
        <input
          defaultValue={email}
          readOnly
          className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-normal outline-none text-zinc-600"
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
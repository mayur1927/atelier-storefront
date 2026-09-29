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
  Pencil,
  ArrowRight,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/store-context";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

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
  shippingFullName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
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

  const handleUserUpdate = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
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
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        </section>
      </div>
    </div>
  );
}

function ProfileContent({
  active,
  user,
  onUserUpdate,
}: {
  active: string;
  user: User;
  onUserUpdate: (updatedUser: Partial<User>) => void;
}) {
  const { wishlistIds } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Address state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  // Account settings state
  const [nameInput, setNameInput] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    setNameInput(user.name);
  }, [user.name]);

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
    } else if (active === "Wishlist") {
      setLoadingContent(true);
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.items)) {
            setWishlistProducts(data.items);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingContent(false));
    }
  }, [active]);

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressError("");
    setAddressForm({
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
    });
  };

  const handleEditAddressClick = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode,
      phone: address.phone || "",
    });
    setAddressError("");
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressError("");

    try {
      const method = editingAddressId ? "PUT" : "POST";
      const payload = editingAddressId
        ? { id: editingAddressId, ...addressForm }
        : addressForm;

      const res = await fetch("/api/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddressError(data.error || "Failed to save address.");
        return;
      }

      if (editingAddressId) {
        setAddresses(addresses.map((a) => (a.id === editingAddressId ? data.address : a)));
      } else {
        setAddresses([data.address, ...addresses]);
      }

      resetAddressForm();
    } catch {
      setAddressError("An unexpected error occurred while saving address.");
    } finally {
      setSavingAddress(false);
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
        if (editingAddressId === id) {
          resetAddressForm();
        }
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  const handleSaveAccount = async (e: FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMessage("");
    setAccountError("");

    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {};

      if (nameInput.trim() !== user.name) {
        payload.name = nameInput.trim();
      }

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setAccountError("No profile changes were made.");
        setSavingAccount(false);
        return;
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAccountError(data.error || "Failed to update profile.");
        return;
      }

      if (data.user) {
        onUserUpdate({ name: data.user.name });
      }

      setAccountMessage("Your account profile has been updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setAccountError("An unexpected error occurred while updating profile.");
    } finally {
      setSavingAccount(false);
    }
  };

  // 1. MY ORDERS TAB
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
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 text-sm">
              <div>
                <span className="font-bold text-zinc-900">Order #{order.id.slice(-8).toUpperCase()}</span>
                <span className="ml-3 text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  {order.status}
                </span>
                <span className="font-bold text-zinc-900">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-14 w-12 rounded-xl object-cover bg-zinc-100"
                    />
                  ) : (
                    <div className="grid h-14 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400 text-xs">
                      Box
                    </div>
                  )}
                  <div className="flex-1 text-sm min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{item.productName}</p>
                    <p className="text-xs text-zinc-500">
                      Qty: {item.quantity} {item.size && `· Size: ${item.size}`}{" "}
                      {item.colour && `· Color: ${item.colour}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
              {order.shippingAddress ? (
                <span>
                  Delivering to: <strong className="text-zinc-800">{order.shippingFullName}</strong> ({order.shippingAddress}, {order.shippingCity})
                </span>
              ) : (
                <span />
              )}

              <Link
                href={`/orders/${encodeURIComponent(order.id)}`}
                className="flex items-center gap-1 font-bold text-zinc-950 underline hover:text-zinc-700"
              >
                VIEW RECEIPT & DETAILS <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. WISHLIST TAB
  if (active === "Wishlist") {
    if (loadingContent) {
      return <div className="mt-6 text-sm text-zinc-500">Loading saved items...</div>;
    }

    const saved = wishlistProducts.filter((product) => wishlistIds.includes(product.id));

    if (!saved.length) {
      return (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500">
          <Heart size={32} className="mx-auto text-zinc-400 mb-3" />
          <p className="font-bold text-zinc-900 text-base">Nothing saved yet</p>
          <p className="mt-1 text-xs text-zinc-500">Your favorite items will appear here.</p>
          <Link
            href="/category/all"
            className="mt-4 inline-block rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800"
          >
            EXPLORE COLLECTION
          </Link>
        </div>
      );
    }

    return (
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  // 3. ADDRESSES TAB
  if (active === "Addresses") {
    if (loadingContent) {
      return <div className="mt-6 text-sm text-zinc-500">Loading addresses...</div>;
    }

    return (
      <div className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-zinc-600">Manage your saved shipping addresses.</p>
          <button
            onClick={() => {
              if (showAddressForm) {
                resetAddressForm();
              } else {
                resetAddressForm();
                setShowAddressForm(true);
              }
            }}
            className="flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800"
          >
            <Plus size={14} /> {showAddressForm ? "Cancel" : "Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleSaveAddress} className="rounded-2xl border border-zinc-200 p-5 space-y-4 bg-zinc-50">
            <h3 className="font-bold text-sm text-zinc-900">
              {editingAddressId ? "Edit Address" : "Add New Address"}
            </h3>

            {addressError && (
              <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                {addressError}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white outline-none focus:border-zinc-950"
              />
              <input
                placeholder="Phone Number"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white outline-none focus:border-zinc-950"
              />
              <input
                required
                placeholder="Address Line 1"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm sm:col-span-2 bg-white outline-none focus:border-zinc-950"
              />
              <input
                placeholder="Address Line 2 (Optional)"
                value={addressForm.line2}
                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm sm:col-span-2 bg-white outline-none focus:border-zinc-950"
              />
              <input
                required
                placeholder="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white outline-none focus:border-zinc-950"
              />
              <input
                required
                placeholder="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white outline-none focus:border-zinc-950"
              />
              <input
                required
                placeholder="Postal / ZIP Code"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white outline-none focus:border-zinc-950"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingAddress}
                className="rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {savingAddress ? "SAVING..." : editingAddressId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
              </button>
              <button
                type="button"
                onClick={resetAddressForm}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {addresses.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="absolute right-3 top-3 flex items-center gap-2">
                  <button
                    onClick={() => handleEditAddressClick(address)}
                    className="p-1 text-zinc-400 hover:text-zinc-900"
                    title="Edit Address"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-1 text-zinc-400 hover:text-red-600"
                    title="Delete Address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p className="font-bold text-sm text-zinc-900">{address.fullName}</p>
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
          <div className="rounded-2xl bg-zinc-50 p-6 text-center text-sm text-zinc-500">
            No saved addresses yet. Add one to speed up checkout.
          </div>
        )}
      </div>
    );
  }

  // 4. ACCOUNT SETTINGS TAB
  return (
    <form onSubmit={handleSaveAccount} className="mt-6 max-w-md space-y-4">
      {accountMessage && (
        <p className="rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">
          {accountMessage}
        </p>
      )}

      {accountError && (
        <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
          {accountError}
        </p>
      )}

      <label className="block text-sm font-bold text-zinc-900">
        Full Name
        <input
          required
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 font-normal text-sm outline-none focus:border-zinc-950"
        />
      </label>

      <label className="block text-sm font-bold text-zinc-900">
        Email Address
        <input
          defaultValue={user.email}
          readOnly
          className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-normal text-sm outline-none text-zinc-500 cursor-not-allowed"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-400">
          Email address cannot be changed directly.
        </span>
      </label>

      <div className="border-t border-zinc-100 pt-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Change Password (Optional)
        </p>

        <label className="block text-sm font-bold text-zinc-900">
          Current Password
          <input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 font-normal text-sm outline-none focus:border-zinc-950"
          />
        </label>

        <label className="block text-sm font-bold text-zinc-900">
          New Password
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 font-normal text-sm outline-none focus:border-zinc-950"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={savingAccount}
        className="w-full rounded-xl bg-zinc-950 py-3.5 text-xs font-bold tracking-[0.12em] text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {savingAccount ? "SAVING CHANGES..." : "SAVE CHANGES"}
      </button>
    </form>
  );
}
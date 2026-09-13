"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setStatusMessage(data.error || "Failed to send message.");
        return;
      }

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setIsError(true);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
        Atelier support
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
        Send a message
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-500">
        Tell us how we can help and we’ll get back to you shortly.
      </p>

      {sent ? (
        <div className="mt-7 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="font-bold text-lg">Message sent</p>
          <p className="mt-2 text-sm text-zinc-500">
            Thanks — your message has been sent. We’ll get back to you shortly.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 rounded-xl bg-zinc-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
          >
            SEND ANOTHER MESSAGE
          </button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-7 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <label className="block text-sm font-bold">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm font-normal outline-none focus:border-zinc-950"
              placeholder="Enter your name"
            />
          </label>

          <label className="block text-sm font-bold">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm font-normal outline-none focus:border-zinc-950"
              placeholder="Enter your email"
            />
          </label>

          <label className="block text-sm font-bold">
            Message
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full resize-none rounded-lg border border-zinc-200 px-3 py-3 text-sm font-normal outline-none focus:border-zinc-950"
              placeholder="Type your message here..."
            />
          </label>

          {statusMessage && (
            <p
              className={`text-xs font-semibold ${
                isError ? "text-red-600" : "text-green-700"
              }`}
            >
              {statusMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-950 py-3.5 text-xs font-bold tracking-[0.12em] text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "SENDING..." : "SEND MESSAGE"}
          </button>
        </form>
      )}
    </div>
  );
}

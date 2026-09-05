"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

type Message = {
  author: "support" | "user";
  text: string;
  time: string;
};

export default function ChatPage() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      author: "support",
      text: "Hi! How can we help you today?",
      time: "10:30 AM",
    },
    {
      author: "user",
      text: "I have a question about my order.",
      time: "10:32 AM",
    },
    {
      author: "support",
      text: "Sure, please share your order ID and we’ll look into it.",
      time: "10:33 AM",
    },
  ]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setMessages((prev) => [
      ...prev,
      { author: "user", text: draft.trim(), time: "Now" },
    ]);
    setDraft("");
  };

  return (
    <div className="mx-auto grid min-h-[62vh] max-w-5xl place-items-center px-4 py-10">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft md:grid-cols-[1fr_0.75fr]">
        <section>
          <div className="bg-zinc-950 px-5 py-4 text-sm font-bold text-white">
            Chat with us
          </div>

          <div className="h-80 space-y-3 overflow-auto bg-zinc-50 p-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`w-fit max-w-[85%] rounded-xl px-3 py-2 text-xs leading-5 ${
                  message.author === "user"
                    ? "ml-auto bg-zinc-800 text-white"
                    : "bg-white text-zinc-600 shadow-sm"
                }`}
              >
                {message.text}
                <span
                  className={`mt-1 block text-[9px] ${
                    message.author === "user"
                      ? "text-zinc-400"
                      : "text-zinc-400"
                  }`}
                >
                  {message.time}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex border-t border-zinc-200 p-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message..."
              className="min-w-0 flex-1 px-2 text-sm outline-none"
            />
            <button className="p-2" aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </section>

        <aside className="border-t border-zinc-200 p-6 md:border-l md:border-t-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
            Need another route?
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em]">
            We’re here to help.
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Messages are answered by the Atelier support team. For a detailed
            request, use our contact form.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg border border-zinc-950 px-4 py-2.5 text-xs font-bold tracking-[0.1em]"
          >
            SEND A MESSAGE
          </Link>
        </aside>
      </div>
    </div>
  );
}

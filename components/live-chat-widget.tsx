"use client";

import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([{ from: "support", text: "Hi! How can we help you today?" }]);
  const send = (event: FormEvent) => { event.preventDefault(); if (!draft.trim()) return; setMessages((all) => [...all, { from: "user", text: draft.trim() }]); setDraft(""); };
  return <div className="fixed bottom-5 right-5 z-40">
    {open && <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"><div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-sm font-bold text-white"><span>Chat with us</span><button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></div><div className="max-h-60 space-y-3 overflow-auto bg-zinc-50 p-4">{messages.map((message, index) => <p key={index} className={`w-fit max-w-[85%] rounded-xl px-3 py-2 text-xs leading-5 ${message.from === "user" ? "ml-auto bg-zinc-800 text-white" : "bg-white text-zinc-600 shadow-sm"}`}>{message.text}</p>)}</div><form onSubmit={send} className="flex border-t border-zinc-100 p-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type your message..." className="min-w-0 flex-1 px-2 text-sm outline-none" /><button className="p-2 text-zinc-900" aria-label="Send message"><Send size={18} /></button></form><Link href="/chat" className="block border-t border-zinc-100 px-4 py-2 text-center text-xs font-semibold text-zinc-500 hover:text-zinc-950">Open full chat</Link></div>}
    <button onClick={() => setOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-full bg-zinc-950 text-white shadow-lg transition hover:scale-105" aria-label="Open live chat"><MessageCircle size={21} /></button>
  </div>;
}

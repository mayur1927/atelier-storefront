"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const slots = [
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function BookingPage() {
  const [day, setDay] = useState(12);
  const [slot, setSlot] = useState("11:00 AM");
  const [confirmed, setConfirmed] = useState(false);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-center text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
        Personal shopping
      </p>
      <h1 className="mt-2 text-center text-3xl font-black tracking-[-0.05em]">
        Book a time with us
      </h1>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-center justify-between">
          <button className="p-2" aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-bold">September 2026</p>
          <button className="p-2" aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-zinc-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 2 }, (_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {days.map((value) => (
            <button
              key={value}
              onClick={() => {
                setDay(value);
                setConfirmed(false);
              }}
              className={`aspect-square rounded-full text-xs transition ${
                value === day
                  ? "bg-zinc-950 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="mt-8 border-t border-zinc-100 pt-6">
          <p className="text-sm font-bold">Available time slots</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setSlot(value);
                  setConfirmed(false);
                }}
                className={`rounded-lg border py-2.5 text-xs font-semibold transition ${
                  slot === value
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            onClick={() => setConfirmed(true)}
            className="mt-6 w-full rounded-xl bg-zinc-950 py-4 text-xs font-bold tracking-[0.12em] text-white hover:bg-zinc-700"
          >
            CONFIRM BOOKING
          </button>

          {confirmed && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
              <Check size={17} /> Booked for September {day} at {slot}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

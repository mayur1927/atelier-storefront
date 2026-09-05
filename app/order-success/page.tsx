import Link from "next/link";
import { Check } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-9 text-center shadow-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-zinc-900">
          <Check size={35} />
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-[-0.05em]">
          Thank you!
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Your order has been placed successfully. We’ll send a confirmation
          email with tracking details shortly.
        </p>

        <Link
          href="/profile"
          className="mt-7 inline-block rounded-xl border border-zinc-950 px-6 py-3 text-xs font-bold tracking-[0.12em] hover:bg-zinc-100"
        >
          VIEW ORDER
        </Link>
      </div>
    </div>
  );
}

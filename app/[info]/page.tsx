import Link from "next/link";

const content: Record<string, { title: string; text: string }> = {
  about: {
    title: "About Atelier",
    text: "Atelier is a considered edit of everyday pieces. We believe fewer, better things make room for a more intentional life.",
  },
  shipping: {
    title: "Shipping & returns",
    text: "Orders over $75 ship free. If something is not quite right, return it in original condition within 30 days of delivery.",
  },
  terms: {
    title: "Terms of use",
    text: "By shopping with Atelier, you agree to use this storefront responsibly and provide accurate information at checkout.",
  },
  privacy: {
    title: "Privacy",
    text: "We use your details only to process orders, provide account features, and send messages you choose to receive.",
  },
};

export default async function InfoPage({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const page = content[info] ?? {
    title: "Atelier",
    text: "This page is not available.",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
        Atelier
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
        {page.title}
      </h1>
      <p className="mt-6 text-base leading-8 text-zinc-600">{page.text}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-semibold underline"
      >
        Back to home
      </Link>
    </div>
  );
}

import Link from "next/link";
import { getProduct } from "@/lib/mockData";
import { ProductDetail } from "@/components/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 text-center">
        <h1 className="text-3xl font-black">Product not found</h1>
        <Link href="/category/all" className="mt-5 inline-block underline">
          Explore the collection
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

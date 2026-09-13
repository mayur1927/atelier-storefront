import { CatalogPage } from "@/components/catalog-page";
import { getDbProducts } from "@/lib/products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title =
    slug === "all"
      ? "All products"
      : slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const initialProducts = await getDbProducts({
    category: slug === "all" ? undefined : slug,
  });

  return (
    <CatalogPage
      title={title}
      initialCategory={slug}
      initialProducts={initialProducts}
    />
  );
}

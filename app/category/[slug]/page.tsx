import { CatalogPage } from "@/components/catalog-page";
import { getDbProducts, getDbCategories, getDbBrands } from "@/lib/products";

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

  const [initialProducts, categories, brands] = await Promise.all([
    getDbProducts({
      category: slug === "all" ? undefined : slug,
    }),
    getDbCategories(),
    getDbBrands(),
  ]);

  return (
    <CatalogPage
      title={title}
      initialCategory={slug}
      initialProducts={initialProducts}
      categories={categories}
      brands={brands}
    />
  );
}

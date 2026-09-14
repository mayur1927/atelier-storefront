import { CatalogPage } from "@/components/catalog-page";
import { getDbProducts, getDbCategories, getDbBrands } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [initialProducts, categories, brands] = await Promise.all([
    getDbProducts({ search: q }),
    getDbCategories(),
    getDbBrands(),
  ]);

  return (
    <CatalogPage
      title={q ? `Search: “${q}”` : "Search products"}
      query={q}
      initialProducts={initialProducts}
      categories={categories}
      brands={brands}
    />
  );
}

import { CatalogPage } from "@/components/catalog-page";
import { getDbProducts } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const initialProducts = await getDbProducts({ search: q });

  return (
    <CatalogPage
      title={q ? `Search: “${q}”` : "Search products"}
      query={q}
      initialProducts={initialProducts}
    />
  );
}

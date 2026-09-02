import { CatalogPage } from "@/components/catalog-page";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <CatalogPage title={q ? `Search: “${q}”` : "Search products"} query={q} />;
}

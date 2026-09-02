import { CatalogPage } from "@/components/catalog-page";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug === "all" ? "All products" : slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <CatalogPage title={title} initialCategory={slug} />;
}

import { HomePage } from "@/components/home-page";
import { getDbProducts, getDbCategories } from "@/lib/products";

export default async function Page() {
  const [bestSellers, categories] = await Promise.all([
    getDbProducts({ bestSeller: true }),
    getDbCategories(),
  ]);

  return <HomePage bestSellers={bestSellers} categories={categories} />;
}

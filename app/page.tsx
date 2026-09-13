import { HomePage } from "@/components/home-page";
import { getDbProducts } from "@/lib/products";

export default async function Page() {
  const bestSellers = await getDbProducts({ bestSeller: true });
  return <HomePage bestSellers={bestSellers} />;
}

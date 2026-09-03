import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  products,
  getProductVariants,
} from "../lib/mockData";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding products...");

  for (const product of products) {
    const variants = getProductVariants(product);

    const dbProduct = await prisma.product.upsert({
      where: {
        slug: product.id,
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        sizes: product.sizes,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isBestSeller: product.isBestSeller ?? false,
      },
      create: {
        slug: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        sizes: product.sizes,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isBestSeller: product.isBestSeller ?? false,
      },
    });

    for (const variant of variants) {
      const dbVariant = await prisma.productVariant.upsert({
        where: {
          productId_colour: {
            productId: dbProduct.id,
            colour: variant.color,
          },
        },
        update: {
          sku: `${product.id}-${variant.color
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        },
        create: {
          productId: dbProduct.id,
          colour: variant.color,
          sku: `${product.id}-${variant.color
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
          inventory: 20,
        },
      });

      await prisma.productImage.deleteMany({
        where: {
          variantId: dbVariant.id,
        },
      });

      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          variantId: dbVariant.id,
          url: variant.image,
          alt: `${product.name} - ${variant.color}`,
          position: 0,
        },
      });
    }

    console.log(`✓ ${product.name}`);
  }

  console.log(`\n✅ Seeded ${products.length} products successfully.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
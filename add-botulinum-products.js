// Script to add Botulinum Toxin products to the database
import { db } from './server/db.js';
import { products, categories } from './shared/schema.js';

const botulinum_products = [
  {
    name: "Botox 100U (Allergan)",
    description: "Premium botulinum toxin type A for aesthetic and therapeutic applications. FDA approved for wrinkle reduction and muscle spasticity treatment.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=botox100",
    featured: true,
    inStock: true,
    tags: "botox, allergan, 100u, wrinkles, anti-aging"
  },
  {
    name: "Botox 200U (Allergan)",
    description: "High-concentration botulinum toxin type A for professional medical use. Ideal for larger treatment areas and therapeutic applications.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=botox200",
    featured: true,
    inStock: true,
    tags: "botox, allergan, 200u, therapeutic, medical"
  },
  {
    name: "Dysport 300U (Ipsen)",
    description: "Fast-acting botulinum toxin with excellent diffusion properties. Perfect for natural-looking results in facial aesthetics.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=dysport300",
    featured: true,
    inStock: true,
    tags: "dysport, ipsen, 300u, fast-acting, natural"
  },
  {
    name: "Dysport 500U (Ipsen)",
    description: "Professional-grade botulinum toxin for comprehensive treatment protocols. Excellent for both aesthetic and therapeutic use.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=dysport500",
    featured: false,
    inStock: true,
    tags: "dysport, ipsen, 500u, professional, comprehensive"
  },
  {
    name: "Xeomin 100U (Merz)",
    description: "Pure botulinum toxin without complexing proteins. Reduced risk of antibody formation for consistent long-term results.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=xeomin100",
    featured: true,
    inStock: true,
    tags: "xeomin, merz, 100u, pure, antibody-resistant"
  },
  {
    name: "Xeomin 200U (Merz)",
    description: "Higher concentration pure botulinum toxin for extended treatment sessions. Ideal for multiple injection sites.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=xeomin200",
    featured: false,
    inStock: true,
    tags: "xeomin, merz, 200u, high-concentration, multiple-sites"
  },
  {
    name: "Azzalure 125U (Galderma)",
    description: "European-grade botulinum toxin with proven efficacy. Excellent for crow's feet and glabellar lines treatment.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=azzalure125",
    featured: false,
    inStock: true,
    tags: "azzalure, galderma, 125u, european, crow's feet"
  },
  {
    name: "Bocouture 100U (Merz)",
    description: "Premium botulinum toxin with high purity standards. Optimized for aesthetic treatments with minimal side effects.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=bocouture100",
    featured: true,
    inStock: true,
    tags: "bocouture, merz, 100u, premium, minimal-side-effects"
  },
  {
    name: "Jeuveau 100U (Evolus)",
    description: "Modern botulinum toxin designed specifically for aesthetic use. Fast onset with natural-looking results.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=jeuveau100",
    featured: false,
    inStock: true,
    tags: "jeuveau, evolus, 100u, modern, aesthetic-focused"
  },
  {
    name: "Nabota 100U (Daewoong)",
    description: "Korean-manufactured botulinum toxin with excellent safety profile. Cost-effective option for volume practices.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=nabota100",
    featured: false,
    inStock: true,
    tags: "nabota, daewoong, 100u, korean, cost-effective"
  },
  {
    name: "Nabota 200U (Daewoong)",
    description: "Higher dose Korean botulinum toxin for comprehensive treatment plans. Excellent value for therapeutic applications.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=nabota200",
    featured: false,
    inStock: true,
    tags: "nabota, daewoong, 200u, comprehensive, therapeutic"
  },
  {
    name: "Relatox 100U (Medytox)",
    description: "Advanced botulinum toxin with refined purification process. Consistent results with minimal immunogenicity risk.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=relatox100",
    featured: false,
    inStock: true,
    tags: "relatox, medytox, 100u, advanced, refined"
  },
  {
    name: "Innotox 50U (Medytox)",
    description: "Ready-to-use liquid botulinum toxin. No reconstitution required, ensuring consistent concentration and convenience.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=innotox50",
    featured: true,
    inStock: true,
    tags: "innotox, medytox, 50u, ready-to-use, liquid"
  },
  {
    name: "Innotox 100U (Medytox)",
    description: "Liquid botulinum toxin in higher concentration. Perfect for busy practices requiring immediate use capability.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=innotox100",
    featured: false,
    inStock: true,
    tags: "innotox, medytox, 100u, liquid, immediate-use"
  },
  {
    name: "Meditoxin 100U (Medytox)",
    description: "Proven botulinum toxin with extensive clinical data. Reliable choice for both aesthetic and medical applications.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=meditoxin100",
    featured: false,
    inStock: true,
    tags: "meditoxin, medytox, 100u, proven, clinical-data"
  },
  {
    name: "Neuronox 100U (Medytox)",
    description: "High-quality botulinum toxin with competitive pricing. Excellent for establishing patient treatment protocols.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=neuronox100",
    featured: false,
    inStock: true,
    tags: "neuronox, medytox, 100u, high-quality, competitive"
  },
  {
    name: "HutoxIN 100U (Hugel)",
    description: "Korean botulinum toxin with strong safety profile. Designed for Asian aesthetic preferences and standards.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=hutoxin100",
    featured: false,
    inStock: true,
    tags: "hutoxin, hugel, 100u, korean, asian-standards"
  },
  {
    name: "Letybo 100U (Hugel)",
    description: "Advanced botulinum toxin formulation with enhanced stability. Long-lasting results with natural expressions.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=letybo100",
    featured: false,
    inStock: true,
    tags: "letybo, hugel, 100u, advanced, enhanced-stability"
  },
  {
    name: "BTX-A 100U (Generic)",
    description: "Cost-effective botulinum toxin type A for volume treatments. Suitable for practices focused on accessibility.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=btxa100",
    featured: false,
    inStock: true,
    tags: "btx-a, generic, 100u, cost-effective, accessibility"
  },
  {
    name: "Clostridium Botulinum Type A 50U",
    description: "Medical-grade botulinum toxin for therapeutic applications. Specialized for neurological and muscular treatments.",
    price: "0.00",
    imageUrl: "/api/placeholder/400/400?product=clostridium50",
    featured: false,
    inStock: true,
    tags: "clostridium, type-a, 50u, medical-grade, neurological"
  }
];

async function addBotulinum Products() {
  try {
    // Get the Botulinum Toxins category ID
    const botulinum Category = await db
      .select()
      .from(categories)
      .where(categories.slug === 'botulinum-toxins')
      .limit(1);

    if (botulinum Category.length === 0) {
      console.error('Botulinum Toxins category not found');
      return;
    }

    const categoryId = botulinum Category[0].id;

    // Add each product
    for (const product of botulinum_products) {
      const newProduct = await db
        .insert(products)
        .values({
          ...product,
          categoryId,
          originalPrice: "0.00",
          rating: "4.5",
          reviewCount: 0
        })
        .returning();

      console.log(`Added product: ${product.name}`);
    }

    console.log(`Successfully added ${botulinum_products.length} Botulinum Toxin products`);
  } catch (error) {
    console.error('Error adding products:', error);
  }
}

// Export for use
export { addBotulinum Products, botulinum_products };
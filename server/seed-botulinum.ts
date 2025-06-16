import { db } from './db';
import { products, categories } from '@shared/schema';
import { eq } from 'drizzle-orm';

const botulinum_products = [
  {
    name: "Botox 100U (Allergan)",
    description: "Premium botulinum toxin type A for aesthetic and therapeutic applications. FDA approved for wrinkle reduction and muscle spasticity treatment.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
    featured: true,
    inStock: true,
    tags: "botox, allergan, 100u, wrinkles, anti-aging"
  },
  {
    name: "Botox 200U (Allergan)", 
    description: "High-concentration botulinum toxin type A for professional medical use. Ideal for larger treatment areas and therapeutic applications.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
    featured: true,
    inStock: true,
    tags: "botox, allergan, 200u, therapeutic, medical"
  },
  {
    name: "Dysport 300U (Ipsen)",
    description: "Fast-acting botulinum toxin with excellent diffusion properties. Perfect for natural-looking results in facial aesthetics.",
    price: "0.00", 
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center",
    featured: true,
    inStock: true,
    tags: "dysport, ipsen, 300u, fast-acting, natural"
  },
  {
    name: "Dysport 500U (Ipsen)",
    description: "Professional-grade botulinum toxin for comprehensive treatment protocols. Excellent for both aesthetic and therapeutic use.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=400&fit=crop&crop=center",
    featured: false,
    inStock: true,
    tags: "dysport, ipsen, 500u, professional, comprehensive"
  },
  {
    name: "Xeomin 100U (Merz)",
    description: "Pure botulinum toxin without complexing proteins. Reduced risk of antibody formation for consistent long-term results.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031c65a?w=400&h=400&fit=crop&crop=center",
    featured: true,
    inStock: true,
    tags: "xeomin, merz, 100u, pure, antibody-resistant"
  },
  {
    name: "Xeomin 200U (Merz)",
    description: "Higher concentration pure botulinum toxin for extended treatment sessions. Ideal for multiple injection sites.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop&crop=center",
    featured: false,
    inStock: true,
    tags: "xeomin, merz, 200u, high-concentration, multiple-sites"
  },
  {
    name: "Azzalure 125U (Galderma)",
    description: "European-grade botulinum toxin with proven efficacy. Excellent for crow's feet and glabellar lines treatment.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&crop=center",
    featured: false,
    inStock: true,
    tags: "azzalure, galderma, 125u, european, crows-feet"
  },
  {
    name: "Bocouture 100U (Merz)",
    description: "Premium botulinum toxin with high purity standards. Optimized for aesthetic treatments with minimal side effects.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center&brightness=1.1",
    featured: true,
    inStock: true,
    tags: "bocouture, merz, 100u, premium, minimal-side-effects"
  },
  {
    name: "Jeuveau 100U (Evolus)",
    description: "Modern botulinum toxin designed specifically for aesthetic use. Fast onset with natural-looking results.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&brightness=0.9",
    featured: false,
    inStock: true,
    tags: "jeuveau, evolus, 100u, modern, aesthetic-focused"
  },
  {
    name: "Nabota 100U (Daewoong)",
    description: "Korean-manufactured botulinum toxin with excellent safety profile. Cost-effective option for volume practices.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=400&fit=crop&crop=center&brightness=1.1",
    featured: false,
    inStock: true,
    tags: "nabota, daewoong, 100u, korean, cost-effective"
  },
  {
    name: "Nabota 200U (Daewoong)",
    description: "Higher dose Korean botulinum toxin for comprehensive treatment plans. Excellent value for therapeutic applications.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031c65a?w=400&h=400&fit=crop&crop=center&brightness=0.9",
    featured: false,
    inStock: true,
    tags: "nabota, daewoong, 200u, comprehensive, therapeutic"
  },
  {
    name: "Relatox 100U (Medytox)",
    description: "Advanced botulinum toxin with refined purification process. Consistent results with minimal immunogenicity risk.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center&brightness=1.1",
    featured: false,
    inStock: true,
    tags: "relatox, medytox, 100u, advanced, refined"
  },
  {
    name: "Innotox 50U (Medytox)",
    description: "Ready-to-use liquid botulinum toxin. No reconstitution required, ensuring consistent concentration and convenience.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop&crop=center&brightness=1.1",
    featured: true,
    inStock: true,
    tags: "innotox, medytox, 50u, ready-to-use, liquid"
  },
  {
    name: "Innotox 100U (Medytox)",
    description: "Liquid botulinum toxin in higher concentration. Perfect for busy practices requiring immediate use capability.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&crop=center&brightness=0.9",
    featured: false,
    inStock: true,
    tags: "innotox, medytox, 100u, liquid, immediate-use"
  },
  {
    name: "Meditoxin 100U (Medytox)",
    description: "Proven botulinum toxin with extensive clinical data. Reliable choice for both aesthetic and medical applications.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center&saturation=1.1",
    featured: false,
    inStock: true,
    tags: "meditoxin, medytox, 100u, proven, clinical-data"
  },
  {
    name: "Neuronox 100U (Medytox)",
    description: "High-quality botulinum toxin with competitive pricing. Excellent for establishing patient treatment protocols.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=400&fit=crop&crop=center&saturation=1.1",
    featured: false,
    inStock: true,
    tags: "neuronox, medytox, 100u, high-quality, competitive"
  },
  {
    name: "HutoxIN 100U (Hugel)",
    description: "Korean botulinum toxin with strong safety profile. Designed for Asian aesthetic preferences and standards.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031c65a?w=400&h=400&fit=crop&crop=center&saturation=1.1",
    featured: false,
    inStock: true,
    tags: "hutoxin, hugel, 100u, korean, asian-standards"
  },
  {
    name: "Letybo 100U (Hugel)",
    description: "Advanced botulinum toxin formulation with enhanced stability. Long-lasting results with natural expressions.",
    price: "0.00",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&saturation=0.9",
    featured: false,
    inStock: true,
    tags: "letybo, hugel, 100u, advanced, enhanced-stability"
  }
];

async function main() {
  try {
    console.log('Starting Botulinum Toxin product seeding...');
    
    const [botulinumCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'botulinum-toxins'))
      .limit(1);

    if (!botulinumCategory) {
      console.error('Botulinum Toxins category not found');
      process.exit(1);
    }

    const categoryId = botulinumCategory.id;
    console.log(`Found category ID: ${categoryId}`);

    let addedCount = 0;
    for (const product of botulinum_products) {
      try {
        await db.insert(products).values({
          ...product,
          categoryId,
          originalPrice: "0.00",
          rating: "4.5",
          reviewCount: 0
        });
        
        console.log(`Added: ${product.name}`);
        addedCount++;
      } catch (error) {
        console.error(`Failed to add ${product.name}:`, error);
      }
    }

    console.log(`Successfully added ${addedCount} Botulinum Toxin products`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
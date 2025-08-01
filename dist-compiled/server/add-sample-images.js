"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function addSampleImages() {
    try {
        // Sample medical product images for different products
        const sampleImageSets = [
            {
                productId: 47, // Azzalure
                additionalImages: [
                    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1584467735871-8e27bf427d8b?w=500&h=500&fit=crop"
                ]
            },
            {
                productId: 49, // Bocouture
                additionalImages: [
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=500&fit=crop"
                ]
            },
            {
                productId: 50, // Xeomin
                additionalImages: [
                    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1584467735871-8e27bf427d8b?w=500&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop"
                ]
            }
        ];
        for (const { productId, additionalImages } of sampleImageSets) {
            await db_1.db
                .update(schema_1.products)
                .set({
                imageUrls: additionalImages
            })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
            console.log(`Added ${additionalImages.length} additional images to product ${productId}`);
        }
        console.log('Successfully added sample images to products');
    }
    catch (error) {
        console.error('Error adding sample images:', error);
    }
}
addSampleImages();
//# sourceMappingURL=add-sample-images.js.map

import { db } from "./db";
import { products } from "@shared/schema";

async function clearAllProducts() {
  try {
    console.log("Clearing all products from database...");
    
    const result = await db.delete(products);
    
    console.log(`✅ Successfully cleared all products from the database`);
    console.log(`Rows affected: ${result.rowCount || 0}`);
    
  } catch (error) {
    console.error("❌ Error clearing products:", error);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  clearAllProducts();
}

export { clearAllProducts };

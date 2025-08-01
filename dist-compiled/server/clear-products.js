"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllProducts = clearAllProducts;
const db_1 = require("./db");
const schema_1 = require("@shared/schema");
async function clearAllProducts() {
    try {
        console.log("Clearing all products from database...");
        const result = await db_1.db.delete(schema_1.products);
        console.log(`✅ Successfully cleared all products from the database`);
        console.log(`Rows affected: ${result.rowCount || 0}`);
    }
    catch (error) {
        console.error("❌ Error clearing products:", error);
    }
    finally {
        process.exit(0);
    }
}
// Run if called directly
if (require.main === module) {
    clearAllProducts();
}
//# sourceMappingURL=clear-products.js.map
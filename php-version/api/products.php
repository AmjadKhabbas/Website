<?php
/**
 * Products API endpoint - Replaces Express routes for product operations
 * Handles: GET /api/products, POST /api/products, PUT /api/products/:id, DELETE /api/products/:id
 */

require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGetProducts();
            break;
            
        case 'POST':
            handleCreateProduct();
            break;
            
        case 'PUT':
            handleUpdateProduct();
            break;
            
        case 'DELETE':
            handleDeleteProduct();
            break;
            
        default:
            errorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Products API error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}

/**
 * GET /api/products - Get products with filtering and pagination
 */
function handleGetProducts() {
    global $db;
    
    // Get query parameters
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
    $featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE conditions
    $whereConditions = ['p.id IS NOT NULL'];
    $params = [];
    
    if ($categoryId) {
        $whereConditions[] = 'p.category_id = ?';
        $params[] = $categoryId;
    }
    
    if ($search) {
        $whereConditions[] = '(p.name LIKE ? OR p.description LIKE ?)';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }
    
    if ($featured !== null) {
        $whereConditions[] = 'p.featured = ?';
        $params[] = $featured ? 1 : 0;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM products p WHERE $whereClause";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get products with category info
    $sql = "
        SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug,
            b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE $whereClause
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Process products (decode JSON fields, format prices)
    foreach ($products as &$product) {
        $product['price'] = floatval($product['price']);
        $product['original_price'] = $product['original_price'] ? floatval($product['original_price']) : null;
        $product['rating'] = floatval($product['rating']);
        $product['review_count'] = intval($product['review_count']);
        $product['featured'] = (bool)$product['featured'];
        $product['in_stock'] = (bool)$product['in_stock'];
        
        // Decode JSON fields
        if ($product['bulk_discounts']) {
            $product['bulk_discounts'] = json_decode($product['bulk_discounts'], true);
        }
        if ($product['image_urls']) {
            $product['image_urls'] = json_decode($product['image_urls'], true);
        }
    }
    
    successResponse([
        'products' => $products,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * POST /api/products - Create new product (Admin only)
 */
function handleCreateProduct() {
    global $db;
    
    // Check admin authentication
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['name', 'description', 'price', 'category_id'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            errorResponse("Field '$field' is required");
        }
    }
    
    // Validate and sanitize data
    $name = sanitizeInput($input['name']);
    $description = sanitizeInput($input['description']);
    $price = floatval($input['price']);
    $originalPrice = isset($input['original_price']) ? floatval($input['original_price']) : null;
    $categoryId = intval($input['category_id']);
    $brandId = isset($input['brand_id']) ? intval($input['brand_id']) : null;
    $imageUrl = isset($input['image_url']) ? sanitizeInput($input['image_url']) : '';
    $imageUrls = isset($input['image_urls']) ? json_encode($input['image_urls']) : null;
    $bulkDiscounts = isset($input['bulk_discounts']) ? json_encode($input['bulk_discounts']) : null;
    $featured = isset($input['featured']) ? (bool)$input['featured'] : false;
    $inStock = isset($input['in_stock']) ? (bool)$input['in_stock'] : true;
    
    // Validate price
    if ($price <= 0) {
        errorResponse('Price must be greater than 0');
    }
    
    // Verify category exists
    $categoryStmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $categoryStmt->execute([$categoryId]);
    if (!$categoryStmt->fetch()) {
        errorResponse('Invalid category ID');
    }
    
    // Insert product
    $sql = "
        INSERT INTO products (
            name, description, price, original_price, category_id, brand_id,
            image_url, image_urls, bulk_discounts, featured, in_stock, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $name, $description, $price, $originalPrice, $categoryId, $brandId,
        $imageUrl, $imageUrls, $bulkDiscounts, $featured, $inStock
    ];
    
    $stmt = $db->prepare($sql);
    if ($stmt->execute($params)) {
        $productId = $db->lastInsertId();
        
        // Get the created product
        $getStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $getStmt->execute([$productId]);
        $product = $getStmt->fetch();
        
        successResponse($product, 201);
    } else {
        errorResponse('Failed to create product');
    }
}

/**
 * PUT /api/products/:id - Update product (Admin only)
 */
function handleUpdateProduct() {
    global $db;
    
    // Check admin authentication
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    // Get product ID from URL
    $productId = getIdFromUrl();
    if (!$productId) {
        errorResponse('Product ID is required');
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verify product exists
    $productStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $productStmt->execute([$productId]);
    $existingProduct = $productStmt->fetch();
    
    if (!$existingProduct) {
        errorResponse('Product not found', 404);
    }
    
    // Build update query dynamically
    $updateFields = [];
    $params = [];
    
    $allowedFields = [
        'name', 'description', 'price', 'original_price', 'category_id', 
        'brand_id', 'image_url', 'image_urls', 'bulk_discounts', 'featured', 'in_stock'
    ];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = ?";
            
            if ($field === 'image_urls' || $field === 'bulk_discounts') {
                $params[] = json_encode($input[$field]);
            } else if ($field === 'featured' || $field === 'in_stock') {
                $params[] = (bool)$input[$field];
            } else if ($field === 'price' || $field === 'original_price') {
                $params[] = floatval($input[$field]);
            } else if ($field === 'category_id' || $field === 'brand_id') {
                $params[] = intval($input[$field]);
            } else {
                $params[] = sanitizeInput($input[$field]);
            }
        }
    }
    
    if (empty($updateFields)) {
        errorResponse('No valid fields to update');
    }
    
    // Add updated_at timestamp
    $updateFields[] = "updated_at = NOW()";
    $params[] = $productId;
    
    $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    if ($stmt->execute($params)) {
        // Get updated product
        $getStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $getStmt->execute([$productId]);
        $product = $getStmt->fetch();
        
        successResponse($product);
    } else {
        errorResponse('Failed to update product');
    }
}

/**
 * DELETE /api/products/:id - Delete product (Admin only)
 */
function handleDeleteProduct() {
    global $db;
    
    // Check admin authentication
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    // Get product ID from URL
    $productId = getIdFromUrl();
    if (!$productId) {
        errorResponse('Product ID is required');
    }
    
    // Verify product exists
    $productStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $productStmt->execute([$productId]);
    $product = $productStmt->fetch();
    
    if (!$product) {
        errorResponse('Product not found', 404);
    }
    
    // Check if product is in any orders (prevent deletion)
    $orderStmt = $db->prepare("SELECT COUNT(*) as count FROM order_items WHERE product_id = ?");
    $orderStmt->execute([$productId]);
    $orderCount = $orderStmt->fetch()['count'];
    
    if ($orderCount > 0) {
        errorResponse('Cannot delete product that has been ordered. Consider marking it as out of stock instead.');
    }
    
    // Delete product
    $deleteStmt = $db->prepare("DELETE FROM products WHERE id = ?");
    if ($deleteStmt->execute([$productId])) {
        successResponse(['message' => 'Product deleted successfully']);
    } else {
        errorResponse('Failed to delete product');
    }
}

/**
 * Extract ID from URL path
 */
function getIdFromUrl() {
    $path = $_SERVER['REQUEST_URI'];
    $parts = explode('/', $path);
    
    // Look for numeric ID in URL
    foreach ($parts as $part) {
        if (is_numeric($part)) {
            return intval($part);
        }
    }
    
    // Check for ID in query parameters
    return isset($_GET['id']) ? intval($_GET['id']) : null;
}
?>
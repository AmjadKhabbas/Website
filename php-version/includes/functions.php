<?php
/**
 * Common utility functions for Meds-Go Medical Marketplace
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/email.php';

/**
 * Security Functions
 */

/**
 * Hash password using PHP's password_hash
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate random token
 */
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Authentication Functions
 */

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

/**
 * Require user login
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /login.php');
        exit;
    }
}

/**
 * Require admin login
 */
function requireAdmin() {
    if (!isAdmin()) {
        header('Location: /admin/login.php');
        exit;
    }
}

/**
 * Get current user data
 */
function getCurrentUser() {
    global $db;
    
    if (!isLoggedIn()) {
        return null;
    }
    
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

/**
 * Get current admin data
 */
function getCurrentAdmin() {
    global $db;
    
    if (!isAdmin()) {
        return null;
    }
    
    $stmt = $db->prepare("SELECT * FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    return $stmt->fetch();
}

/**
 * File Upload Functions
 */

/**
 * Upload file with validation
 */
function uploadFile($file, $uploadDir = 'uploads/', $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    $fileName = $file['name'];
    $fileSize = $file['size'];
    $fileTmpName = $file['tmp_name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Validate file type
    if (!in_array($fileExtension, $allowedTypes)) {
        return false;
    }
    
    // Validate file size (max 5MB)
    if ($fileSize > 5 * 1024 * 1024) {
        return false;
    }
    
    // Generate unique filename
    $newFileName = uniqid() . '_' . time() . '.' . $fileExtension;
    $uploadPath = $uploadDir . $newFileName;
    
    // Create upload directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Move uploaded file
    if (move_uploaded_file($fileTmpName, $uploadPath)) {
        return $uploadPath;
    }
    
    return false;
}

/**
 * Upload multiple files
 */
function uploadMultipleFiles($files, $uploadDir = 'uploads/') {
    $uploadedFiles = [];
    
    if (!is_array($files['name'])) {
        // Single file
        $result = uploadFile($files, $uploadDir);
        if ($result) {
            $uploadedFiles[] = $result;
        }
    } else {
        // Multiple files
        for ($i = 0; $i < count($files['name']); $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
            
            $result = uploadFile($file, $uploadDir);
            if ($result) {
                $uploadedFiles[] = $result;
            }
        }
    }
    
    return $uploadedFiles;
}

/**
 * Utility Functions
 */

/**
 * Format price
 */
function formatPrice($price) {
    return '$' . number_format((float)$price, 2);
}

/**
 * Calculate bulk discount
 */
function calculateBulkDiscount($quantity, $price, $bulkDiscounts) {
    if (!$bulkDiscounts) {
        return $price * $quantity;
    }
    
    $discounts = json_decode($bulkDiscounts, true);
    if (!$discounts) {
        return $price * $quantity;
    }
    
    $discount = 0;
    foreach ($discounts as $tier) {
        if ($quantity >= $tier['quantity']) {
            $discount = $tier['discount'];
        }
    }
    
    $discountedPrice = $price * (1 - $discount / 100);
    return $discountedPrice * $quantity;
}

/**
 * Get bulk discount info
 */
function getBulkDiscountInfo($quantity, $bulkDiscounts) {
    if (!$bulkDiscounts) {
        return null;
    }
    
    $discounts = json_decode($bulkDiscounts, true);
    if (!$discounts) {
        return null;
    }
    
    $appliedDiscount = 0;
    foreach ($discounts as $tier) {
        if ($quantity >= $tier['quantity']) {
            $appliedDiscount = $tier['discount'];
        }
    }
    
    return [
        'discount' => $appliedDiscount,
        'tiers' => $discounts
    ];
}

/**
 * Generate order number
 */
function generateOrderNumber() {
    return 'MG' . date('Y') . strtoupper(uniqid());
}

/**
 * Get session ID for cart
 */
function getCartSessionId() {
    if (!isset($_SESSION['cart_session_id'])) {
        $_SESSION['cart_session_id'] = session_id();
    }
    return $_SESSION['cart_session_id'];
}

/**
 * Database helper functions
 */

/**
 * Get products with filters
 */
function getProducts($filters = []) {
    global $db;
    
    $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE 1=1";
    $params = [];
    
    if (!empty($filters['category_id'])) {
        $sql .= " AND p.category_id = ?";
        $params[] = $filters['category_id'];
    }
    
    if (!empty($filters['featured'])) {
        $sql .= " AND p.featured = 1";
    }
    
    if (!empty($filters['search'])) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = '%' . $filters['search'] . '%';
        $params[] = '%' . $filters['search'] . '%';
    }
    
    if (!empty($filters['in_stock'])) {
        $sql .= " AND p.in_stock = 1";
    }
    
    $sql .= " ORDER BY p.featured DESC, p.created_at DESC";
    
    if (!empty($filters['limit'])) {
        $sql .= " LIMIT " . intval($filters['limit']);
    }
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Get single product by ID
 */
function getProduct($id) {
    global $db;
    
    $stmt = $db->prepare("SELECT p.*, c.name as category_name, c.slug as category_slug 
                         FROM products p 
                         LEFT JOIN categories c ON p.category_id = c.id 
                         WHERE p.id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

/**
 * Get categories
 */
function getCategories() {
    global $db;
    
    $stmt = $db->query("SELECT * FROM categories ORDER BY name");
    return $stmt->fetchAll();
}

/**
 * Get cart items
 */
function getCartItems($sessionId = null) {
    global $db;
    
    if (!$sessionId) {
        $sessionId = getCartSessionId();
    }
    
    $stmt = $db->prepare("SELECT ci.*, p.name, p.price, p.image_url, p.bulk_discounts 
                         FROM cart_items ci 
                         JOIN products p ON ci.product_id = p.id 
                         WHERE ci.session_id = ?");
    $stmt->execute([$sessionId]);
    return $stmt->fetchAll();
}

/**
 * Add item to cart
 */
function addToCart($productId, $quantity = 1) {
    global $db;
    
    $sessionId = getCartSessionId();
    
    // Check if item already exists in cart
    $stmt = $db->prepare("SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?");
    $stmt->execute([$sessionId, $productId]);
    $existingItem = $stmt->fetch();
    
    if ($existingItem) {
        // Update quantity
        $newQuantity = $existingItem['quantity'] + $quantity;
        $stmt = $db->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?");
        return $stmt->execute([$newQuantity, $existingItem['id']]);
    } else {
        // Insert new item
        $stmt = $db->prepare("INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)");
        return $stmt->execute([$sessionId, $productId, $quantity]);
    }
}

/**
 * Update cart item quantity
 */
function updateCartItem($itemId, $quantity) {
    global $db;
    
    if ($quantity <= 0) {
        return removeCartItem($itemId);
    }
    
    $stmt = $db->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?");
    return $stmt->execute([$quantity, $itemId]);
}

/**
 * Remove cart item
 */
function removeCartItem($itemId) {
    global $db;
    
    $stmt = $db->prepare("DELETE FROM cart_items WHERE id = ?");
    return $stmt->execute([$itemId]);
}

/**
 * Clear cart
 */
function clearCart($sessionId = null) {
    global $db;
    
    if (!$sessionId) {
        $sessionId = getCartSessionId();
    }
    
    $stmt = $db->prepare("DELETE FROM cart_items WHERE session_id = ?");
    return $stmt->execute([$sessionId]);
}

/**
 * Calculate cart total
 */
function calculateCartTotal($items = null) {
    if (!$items) {
        $items = getCartItems();
    }
    
    $total = 0;
    foreach ($items as $item) {
        $total += calculateBulkDiscount($item['quantity'], $item['price'], $item['bulk_discounts']);
    }
    
    return $total;
}

/**
 * Response helpers
 */

/**
 * Return JSON response
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Return error response
 */
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}

/**
 * Return success response
 */
function successResponse($data = [], $message = 'Success') {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}
?>
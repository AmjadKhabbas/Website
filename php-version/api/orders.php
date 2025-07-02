<?php
/**
 * Orders API endpoint - Handles order management
 * Replaces Express routes for order operations
 */

require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGetOrders();
            break;
            
        case 'POST':
            handleCreateOrder();
            break;
            
        case 'PUT':
            handleUpdateOrder();
            break;
            
        default:
            errorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Orders API error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}

/**
 * GET /api/orders - Get orders (Admin sees all, users see their own)
 */
function handleGetOrders() {
    global $db;
    
    $orderId = isset($_GET['id']) ? intval($_GET['id']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Single order request
    if ($orderId) {
        $order = getOrderWithItems($orderId);
        if (!$order) {
            errorResponse('Order not found', 404);
        }
        
        // Check permissions
        if (!isAdmin() && (!isLoggedIn() || $order['user_id'] != getCurrentUser()['id'])) {
            errorResponse('Access denied', 403);
        }
        
        successResponse($order);
        return;
    }
    
    // Multiple orders request
    $whereConditions = [];
    $params = [];
    
    // Filter by user if not admin
    if (!isAdmin()) {
        if (!isLoggedIn()) {
            errorResponse('Authentication required', 401);
        }
        $whereConditions[] = 'o.user_id = ?';
        $params[] = getCurrentUser()['id'];
    }
    
    // Filter by status
    if ($status) {
        $whereConditions[] = 'o.status = ?';
        $params[] = $status;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM orders o $whereClause";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get orders
    $sql = "
        SELECT 
            o.*,
            u.full_name as user_name,
            u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        $whereClause
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $order['items'] = getOrderItems($order['id']);
        $order['total_amount'] = floatval($order['total_amount']);
    }
    
    successResponse([
        'orders' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * POST /api/orders - Create new order
 */
function handleCreateOrder() {
    global $db;
    
    if (!isLoggedIn()) {
        errorResponse('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $user = getCurrentUser();
    
    // Validate required fields
    $required = ['shipping_address', 'billing_address', 'payment_method'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            errorResponse("Field '$field' is required");
        }
    }
    
    // Get cart items
    $cartItems = getCartItems();
    if (empty($cartItems)) {
        errorResponse('Cart is empty');
    }
    
    // Calculate total
    $totalAmount = calculateCartTotal($cartItems);
    
    // Generate order number
    $orderNumber = 'ORD-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Create order
        $orderSql = "
            INSERT INTO orders (
                user_id, order_number, total_amount, status,
                shipping_address, billing_address, payment_method,
                doctor_banking_info, notes, created_at
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())
        ";
        
        $orderParams = [
            $user['id'],
            $orderNumber,
            $totalAmount,
            json_encode($input['shipping_address']),
            json_encode($input['billing_address']),
            sanitizeInput($input['payment_method']),
            isset($input['banking_info']) ? json_encode($input['banking_info']) : null,
            sanitizeInput($input['notes'] ?? '')
        ];
        
        $orderStmt = $db->prepare($orderSql);
        $orderStmt->execute($orderParams);
        $orderId = $db->lastInsertId();
        
        // Create order items
        foreach ($cartItems as $item) {
            $itemTotal = calculateBulkDiscount($item['quantity'], $item['price'], $item['bulk_discounts']);
            
            $itemSql = "
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, total_price, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            ";
            
            $itemParams = [
                $orderId,
                $item['product_id'],
                $item['quantity'],
                $item['price'],
                $itemTotal
            ];
            
            $itemStmt = $db->prepare($itemSql);
            $itemStmt->execute($itemParams);
        }
        
        // Clear cart
        clearCart();
        
        // Commit transaction
        $db->commit();
        
        // Send notification email to admin
        sendOrderNotificationEmail($orderId, $user);
        
        // Get complete order details
        $order = getOrderWithItems($orderId);
        
        successResponse($order, 201);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

/**
 * PUT /api/orders/:id - Update order status (Admin only)
 */
function handleUpdateOrder() {
    global $db;
    
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    $orderId = getIdFromUrl();
    if (!$orderId) {
        errorResponse('Order ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verify order exists
    $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch();
    
    if (!$order) {
        errorResponse('Order not found', 404);
    }
    
    $allowedStatuses = ['pending', 'approved', 'declined', 'shipped', 'delivered', 'cancelled'];
    
    // Update status
    if (isset($input['status'])) {
        $status = sanitizeInput($input['status']);
        
        if (!in_array($status, $allowedStatuses)) {
            errorResponse('Invalid status');
        }
        
        $admin = getCurrentAdmin();
        $notes = sanitizeInput($input['admin_notes'] ?? '');
        
        $sql = "
            UPDATE orders 
            SET status = ?, admin_notes = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
            WHERE id = ?
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$status, $notes, $admin['email'], $orderId]);
        
        // Send status update email to customer
        sendOrderStatusEmail($orderId, $status);
    }
    
    // Get updated order
    $order = getOrderWithItems($orderId);
    successResponse($order);
}

/**
 * Get order with items
 */
function getOrderWithItems($orderId) {
    global $db;
    
    // Get order
    $orderSql = "
        SELECT 
            o.*,
            u.full_name as user_name,
            u.email as user_email,
            u.phone as user_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ";
    
    $orderStmt = $db->prepare($orderSql);
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch();
    
    if (!$order) {
        return null;
    }
    
    // Get order items
    $order['items'] = getOrderItems($orderId);
    $order['total_amount'] = floatval($order['total_amount']);
    
    // Decode JSON fields
    if ($order['shipping_address']) {
        $order['shipping_address'] = json_decode($order['shipping_address'], true);
    }
    if ($order['billing_address']) {
        $order['billing_address'] = json_decode($order['billing_address'], true);
    }
    if ($order['doctor_banking_info']) {
        $order['doctor_banking_info'] = json_decode($order['doctor_banking_info'], true);
    }
    
    return $order;
}

/**
 * Get order items with product details
 */
function getOrderItems($orderId) {
    global $db;
    
    $sql = "
        SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$orderId]);
    $items = $stmt->fetchAll();
    
    foreach ($items as &$item) {
        $item['unit_price'] = floatval($item['unit_price']);
        $item['total_price'] = floatval($item['total_price']);
        $item['quantity'] = intval($item['quantity']);
    }
    
    return $items;
}

/**
 * Send order notification email to admin
 */
function sendOrderNotificationEmail($orderId, $user) {
    // Implementation depends on email configuration
    // This would use the email functions from includes/functions.php
}

/**
 * Send order status update email to customer
 */
function sendOrderStatusEmail($orderId, $status) {
    // Implementation depends on email configuration
    // This would use the email functions from includes/functions.php
}

/**
 * Extract ID from URL path
 */
function getIdFromUrl() {
    $path = $_SERVER['REQUEST_URI'];
    $parts = explode('/', $path);
    
    foreach ($parts as $part) {
        if (is_numeric($part)) {
            return intval($part);
        }
    }
    
    return isset($_GET['id']) ? intval($_GET['id']) : null;
}
?>
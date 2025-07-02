<?php
/**
 * Cart API endpoint for AJAX operations
 */

require_once '../includes/functions.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get cart items
            $items = getCartItems();
            $total = calculateCartTotal($items);
            
            successResponse([
                'items' => $items,
                'total' => $total,
                'count' => array_sum(array_column($items, 'quantity'))
            ]);
            break;
            
        case 'POST':
            // Add item to cart
            $productId = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
            $quantity = isset($_POST['quantity']) ? max(1, intval($_POST['quantity'])) : 1;
            
            if (!$productId) {
                errorResponse('Product ID is required');
            }
            
            // Verify product exists
            $product = getProduct($productId);
            if (!$product) {
                errorResponse('Product not found');
            }
            
            if (!$product['in_stock']) {
                errorResponse('Product is out of stock');
            }
            
            if (addToCart($productId, $quantity)) {
                successResponse(['message' => 'Product added to cart']);
            } else {
                errorResponse('Failed to add product to cart');
            }
            break;
            
        case 'PUT':
            // Update cart item quantity
            $input = json_decode(file_get_contents('php://input'), true);
            $itemId = isset($input['item_id']) ? intval($input['item_id']) : 0;
            $quantity = isset($input['quantity']) ? max(0, intval($input['quantity'])) : 0;
            
            if (!$itemId) {
                errorResponse('Item ID is required');
            }
            
            if (updateCartItem($itemId, $quantity)) {
                successResponse(['message' => 'Cart updated']);
            } else {
                errorResponse('Failed to update cart');
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['item_id'])) {
                // Remove specific item
                $itemId = intval($_GET['item_id']);
                if (removeCartItem($itemId)) {
                    successResponse(['message' => 'Item removed from cart']);
                } else {
                    errorResponse('Failed to remove item');
                }
            } else {
                // Clear entire cart
                if (clearCart()) {
                    successResponse(['message' => 'Cart cleared']);
                } else {
                    errorResponse('Failed to clear cart');
                }
            }
            break;
            
        default:
            errorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Cart API error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>
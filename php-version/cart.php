<?php
$pageTitle = "Shopping Cart";
$pageDescription = "Review your selected medical products and proceed to checkout.";

require_once 'includes/header.php';

// Get cart items
$cartItems = getCartItems();
$cartTotal = calculateCartTotal($cartItems);
?>

<!-- Breadcrumb -->
<div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
                <li><a href="/" class="text-gray-500 hover:text-gray-700">Home</a></li>
                <li><span class="text-gray-400">/</span></li>
                <li><span class="text-gray-900">Shopping Cart</span></li>
            </ol>
        </nav>
    </div>
</div>

<!-- Cart Content -->
<section class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <?php if (!empty($cartItems)): ?>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Cart Items -->
            <div class="lg:col-span-2 space-y-4">
                <?php foreach ($cartItems as $item): ?>
                <?php 
                $itemTotal = calculateBulkDiscount($item['quantity'], $item['price'], $item['bulk_discounts']);
                $bulkInfo = getBulkDiscountInfo($item['quantity'], $item['bulk_discounts']);
                ?>
                <div class="card p-6" id="cart-item-<?php echo $item['id']; ?>">
                    <div class="flex items-center space-x-4">
                        <!-- Product Image -->
                        <div class="w-20 h-20 bg-white rounded-lg overflow-hidden border">
                            <img src="<?php echo sanitizeInput($item['image_url']); ?>" 
                                 alt="<?php echo sanitizeInput($item['name']); ?>"
                                 class="w-full h-full object-cover">
                        </div>
                        
                        <!-- Product Info -->
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900">
                                <a href="/product.php?id=<?php echo $item['product_id']; ?>" class="hover:text-blue-600">
                                    <?php echo sanitizeInput($item['name']); ?>
                                </a>
                            </h3>
                            
                            <div class="flex items-center space-x-4 mt-2">
                                <span class="text-lg font-bold text-blue-600">
                                    <?php echo formatPrice($item['price']); ?>
                                </span>
                                
                                <?php if ($bulkInfo && $bulkInfo['discount'] > 0): ?>
                                <span class="text-sm text-green-600 font-medium">
                                    <?php echo $bulkInfo['discount']; ?>% bulk discount applied
                                </span>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <!-- Quantity Controls -->
                        <div class="flex items-center space-x-3">
                            <label class="text-sm text-gray-600">Qty:</label>
                            <div class="flex items-center border rounded">
                                <button onclick="updateQuantity(<?php echo $item['id']; ?>, <?php echo $item['quantity'] - 1; ?>)" 
                                        class="p-1 hover:bg-gray-100" <?php echo $item['quantity'] <= 1 ? 'disabled' : ''; ?>>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                    </svg>
                                </button>
                                <span class="px-3 py-1 min-w-[2rem] text-center"><?php echo $item['quantity']; ?></span>
                                <button onclick="updateQuantity(<?php echo $item['id']; ?>, <?php echo $item['quantity'] + 1; ?>)" 
                                        class="p-1 hover:bg-gray-100">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Item Total -->
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900">
                                <?php echo formatPrice($itemTotal); ?>
                            </div>
                            <?php if ($bulkInfo && $bulkInfo['discount'] > 0): ?>
                            <div class="text-sm text-gray-500">
                                Regular: <?php echo formatPrice($item['price'] * $item['quantity']); ?>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <!-- Remove Button -->
                        <button onclick="removeFromCart(<?php echo $item['id']; ?>)" 
                                class="text-red-600 hover:text-red-800 p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Bulk Pricing Info -->
                    <?php if ($item['bulk_discounts']): ?>
                    <div class="mt-4 p-3 bg-blue-50 rounded border">
                        <h4 class="text-sm font-medium text-blue-900 mb-2">Bulk Pricing Available</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <?php 
                            $discounts = json_decode($item['bulk_discounts'], true);
                            foreach ($discounts as $tier): 
                            ?>
                            <div class="flex justify-between <?php echo $item['quantity'] >= $tier['quantity'] ? 'text-green-700 font-medium' : 'text-gray-600'; ?>">
                                <span><?php echo $tier['quantity']; ?>+ units:</span>
                                <span><?php echo $tier['discount']; ?>% off</span>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Order Summary -->
            <div class="lg:col-span-1">
                <div class="card p-6 sticky top-24">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div class="space-y-3">
                        <?php foreach ($cartItems as $item): ?>
                        <?php $itemTotal = calculateBulkDiscount($item['quantity'], $item['price'], $item['bulk_discounts']); ?>
                        <div class="flex justify-between text-sm">
                            <span><?php echo sanitizeInput($item['name']); ?> (<?php echo $item['quantity']; ?>)</span>
                            <span><?php echo formatPrice($itemTotal); ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <hr class="my-4">
                    
                    <div class="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span class="text-blue-600"><?php echo formatPrice($cartTotal); ?></span>
                    </div>
                    
                    <div class="mt-6 space-y-3">
                        <?php if (isLoggedIn()): ?>
                        <a href="/checkout.php" class="w-full btn-primary text-center block">
                            Proceed to Checkout
                        </a>
                        <?php else: ?>
                        <a href="/login.php?redirect=cart" class="w-full btn-primary text-center block">
                            Login to Checkout
                        </a>
                        <?php endif; ?>
                        
                        <a href="/products.php" class="w-full btn-secondary text-center block">
                            Continue Shopping
                        </a>
                        
                        <button onclick="clearCart()" class="w-full text-red-600 hover:text-red-800 text-sm">
                            Clear Cart
                        </button>
                    </div>
                    
                    <!-- Security Notice -->
                    <div class="mt-6 p-3 bg-green-50 rounded border">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="text-sm text-green-700">Secure Checkout</span>
                        </div>
                        <p class="text-xs text-green-600 mt-1">Professional use only. All orders require admin approval.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <?php else: ?>
        <!-- Empty Cart -->
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13l-1.5 6.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p class="mt-2 text-gray-500">Start shopping to add products to your cart.</p>
            <div class="mt-6">
                <a href="/products.php" class="btn-primary">
                    Browse Products
                </a>
            </div>
        </div>
        <?php endif; ?>
    </div>
</section>

<script>
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    showLoading();
    
    fetch('/api/cart.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            item_id: itemId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            location.reload(); // Refresh to show updated totals
        } else {
            showToast(data.error || 'Failed to update quantity', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error updating quantity', 'error');
        console.error('Error:', error);
    });
}

function removeFromCart(itemId) {
    if (!confirm('Remove this item from your cart?')) {
        return;
    }
    
    showLoading();
    
    fetch(`/api/cart.php?item_id=${itemId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            document.getElementById(`cart-item-${itemId}`).remove();
            showToast('Item removed from cart', 'success');
            
            // Check if cart is empty and reload if so
            const remainingItems = document.querySelectorAll('[id^="cart-item-"]');
            if (remainingItems.length === 0) {
                location.reload();
            } else {
                updateCartBadge();
            }
        } else {
            showToast(data.error || 'Failed to remove item', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error removing item', 'error');
        console.error('Error:', error);
    });
}

function clearCart() {
    if (!confirm('Clear all items from your cart?')) {
        return;
    }
    
    showLoading();
    
    fetch('/api/cart.php', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            location.reload();
        } else {
            showToast(data.error || 'Failed to clear cart', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showToast('Error clearing cart', 'error');
        console.error('Error:', error);
    });
}
</script>

<?php require_once 'includes/footer.php'; ?>
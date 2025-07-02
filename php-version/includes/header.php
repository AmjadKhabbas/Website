<?php
require_once __DIR__ . '/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' : ''; ?>Meds-Go Medical Marketplace</title>
    <meta name="description" content="<?php echo isset($pageDescription) ? $pageDescription : 'Professional medical marketplace for healthcare providers. Botulinum toxins, dermal fillers, and medical equipment.'; ?>">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS -->
    <style>
        :root {
            --primary: 210 40% 98%;
            --primary-foreground: 222.2 84% 4.9%;
            --secondary: 210 40% 96%;
            --secondary-foreground: 222.2 84% 4.9%;
            --muted: 210 40% 98%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96%;
            --accent-foreground: 222.2 84% 4.9%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222.2 84% 4.9%;
            --radius: 0.5rem;
        }
        
        .btn-primary {
            @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors;
        }
        
        .btn-secondary {
            @apply bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg transition-colors;
        }
        
        .card {
            @apply bg-white rounded-lg shadow-sm border;
        }
        
        .medical-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .cart-badge {
            @apply absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center">
                    <a href="/" class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-lg">M</span>
                        </div>
                        <span class="text-xl font-bold text-gray-900">Meds-Go</span>
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden md:flex items-center space-x-6">
                    <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                    <a href="/products.php" class="text-gray-700 hover:text-blue-600 transition-colors">Products</a>
                    <a href="/products.php?category=botulinum-toxins" class="text-gray-700 hover:text-blue-600 transition-colors">Botox</a>
                    <a href="/products.php?category=dermal-fillers" class="text-gray-700 hover:text-blue-600 transition-colors">Fillers</a>
                    <a href="/products.php?category=medical-equipment" class="text-gray-700 hover:text-blue-600 transition-colors">Equipment</a>
                </div>

                <!-- User Actions -->
                <div class="flex items-center space-x-4">
                    <!-- Cart -->
                    <a href="/cart.php" class="relative text-gray-700 hover:text-blue-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13l-1.5 6.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
                        </svg>
                        <?php
                        $cartItems = getCartItems();
                        $cartCount = array_sum(array_column($cartItems, 'quantity'));
                        if ($cartCount > 0):
                        ?>
                        <span class="cart-badge"><?php echo $cartCount; ?></span>
                        <?php endif; ?>
                    </a>

                    <?php if (isLoggedIn()): ?>
                        <!-- User Menu -->
                        <div class="relative group">
                            <button class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <span><?php echo sanitizeInput(getCurrentUser()['full_name']); ?></span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <a href="/profile.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Profile</a>
                                <a href="/orders.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">My Orders</a>
                                <hr class="my-1">
                                <a href="/logout.php" class="block px-4 py-2 text-red-600 hover:bg-red-50">Logout</a>
                            </div>
                        </div>
                    <?php elseif (isAdmin()): ?>
                        <!-- Admin Menu -->
                        <div class="relative group">
                            <button class="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                                <span>Admin</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <a href="/admin/" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Dashboard</a>
                                <a href="/admin/products.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Products</a>
                                <a href="/admin/orders.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Orders</a>
                                <a href="/admin/users.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Users</a>
                                <hr class="my-1">
                                <a href="/admin/logout.php" class="block px-4 py-2 text-red-600 hover:bg-red-50">Logout</a>
                            </div>
                        </div>
                    <?php else: ?>
                        <!-- Login/Register -->
                        <a href="/login.php" class="text-gray-700 hover:text-blue-600 transition-colors">Login</a>
                        <a href="/register.php" class="btn-primary">Register</a>
                    <?php endif; ?>
                </div>

                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button onclick="toggleMobileMenu()" class="text-gray-700 hover:text-blue-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu -->
        <div id="mobile-menu" class="md:hidden hidden bg-white border-t">
            <div class="px-4 py-2 space-y-2">
                <a href="/" class="block text-gray-700 hover:text-blue-600 py-2">Home</a>
                <a href="/products.php" class="block text-gray-700 hover:text-blue-600 py-2">Products</a>
                <a href="/products.php?category=botulinum-toxins" class="block text-gray-700 hover:text-blue-600 py-2">Botox</a>
                <a href="/products.php?category=dermal-fillers" class="block text-gray-700 hover:text-blue-600 py-2">Fillers</a>
                <a href="/products.php?category=medical-equipment" class="block text-gray-700 hover:text-blue-600 py-2">Equipment</a>
                
                <?php if (isLoggedIn()): ?>
                    <hr class="my-2">
                    <a href="/profile.php" class="block text-gray-700 hover:text-blue-600 py-2">Profile</a>
                    <a href="/orders.php" class="block text-gray-700 hover:text-blue-600 py-2">My Orders</a>
                    <a href="/logout.php" class="block text-red-600 hover:text-red-800 py-2">Logout</a>
                <?php else: ?>
                    <hr class="my-2">
                    <a href="/login.php" class="block text-gray-700 hover:text-blue-600 py-2">Login</a>
                    <a href="/register.php" class="block text-blue-600 hover:text-blue-800 py-2">Register</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <script>
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }
    </script>
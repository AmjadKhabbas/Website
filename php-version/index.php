<?php
/**
 * Smart Hybrid Homepage - Serves React SPA for modern experience
 * with PHP fallback for maximum compatibility
 */

// Check if user wants PHP version explicitly or if this is an API/admin request
$requestUri = $_SERVER['REQUEST_URI'];
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$usePhpVersion = isset($_GET['php']) || 
                 strpos($requestUri, '/api/') !== false ||
                 strpos($requestUri, '/admin/') !== false ||
                 strpos($userAgent, 'bot') !== false; // Serve PHP for SEO bots

// If not explicitly requesting PHP, serve the React SPA
if (!$usePhpVersion && ($requestUri === '/' || $requestUri === '/index.php')) {
    // Include database config for session handling
    require_once 'config/database.php';
    session_start();
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meds-Go Medical Marketplace</title>
    <meta name="description" content="Premium medical products for healthcare professionals. Botulinum toxins, dermal fillers, and medical equipment with bulk pricing discounts.">
    
    <!-- SEO Meta Tags -->
    <meta name="keywords" content="medical supplies, botulinum toxin, dermal fillers, medical equipment, healthcare products">
    <meta name="author" content="Meds-Go">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Meds-Go Medical Marketplace">
    <meta property="og:description" content="Premium medical products for healthcare professionals with bulk pricing discounts.">
    
    <!-- Load production React app -->
    <script type="module" crossorigin src="/assets/index-CHq3CkF6.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-VsBLE9zj.css">
</head>
<body>
    <div id="root"></div>
    
    <!-- Fallback for no JavaScript -->
    <noscript>
        <div style="text-align: center; padding: 2rem; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1E40AF;">Meds-Go Medical Marketplace</h1>
            <p style="margin: 1rem 0;">This application works best with JavaScript enabled.</p>
            <a href="/?php=1" style="display: inline-block; background: #3B82F6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; margin: 1rem;">
                Continue with Basic Version
            </a>
        </div>
    </noscript>
</body>
</html>
    <?php
    exit;
}

// Continue with PHP version for fallback, bots, or explicit requests
$pageTitle = "Professional Medical Marketplace";
$pageDescription = "Premium medical products for healthcare professionals. Botulinum toxins, dermal fillers, and medical equipment with bulk pricing discounts.";

require_once 'includes/header.php';

// Get carousel items
$carouselStmt = $db->query("SELECT * FROM carousel_items WHERE is_active = 1 ORDER BY sort_order ASC");
$carouselItems = $carouselStmt->fetchAll();

// Get featured products
$featuredProducts = getProducts(['featured' => true, 'limit' => 8]);

// Get categories
$categories = getCategories();

// Get brands
$brandsStmt = $db->query("SELECT * FROM brands ORDER BY name");
$brands = $brandsStmt->fetchAll();
?>

<!-- Hero Carousel Section -->
<section class="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
    <?php if (!empty($carouselItems)): ?>
    <div id="hero-carousel" class="relative h-96 md:h-[500px]">
        <?php foreach ($carouselItems as $index => $item): ?>
        <div class="carousel-slide <?php echo $index === 0 ? 'active' : 'hidden'; ?> absolute inset-0 transition-all duration-500">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
                    <!-- Content -->
                    <div class="space-y-6">
                        <?php if ($item['on_sale']): ?>
                        <div class="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            On Sale
                        </div>
                        <?php endif; ?>
                        
                        <?php if ($item['discount']): ?>
                        <div class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-2">
                            Save <?php echo sanitizeInput($item['discount']); ?>
                        </div>
                        <?php endif; ?>
                        
                        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                            <?php echo sanitizeInput($item['title']); ?>
                        </h1>
                        
                        <?php if ($item['subtitle']): ?>
                        <p class="text-xl text-gray-600">
                            <?php echo sanitizeInput($item['subtitle']); ?>
                        </p>
                        <?php endif; ?>
                        
                        <p class="text-lg text-gray-600 leading-relaxed">
                            <?php echo sanitizeInput($item['description']); ?>
                        </p>
                        
                        <?php if ($item['price']): ?>
                        <div class="flex items-center space-x-4">
                            <span class="text-3xl font-bold text-blue-600">
                                $<?php echo sanitizeInput($item['price']); ?>
                            </span>
                            <?php if ($item['original_price']): ?>
                            <span class="text-xl text-gray-400 line-through">
                                $<?php echo sanitizeInput($item['original_price']); ?>
                            </span>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Image -->
                    <div class="relative">
                        <div class="aspect-square bg-white rounded-2xl p-4 shadow-lg overflow-hidden">
                            <img src="<?php echo sanitizeInput($item['image_url']); ?>" 
                                 alt="<?php echo sanitizeInput($item['title']); ?>"
                                 class="w-full h-full object-cover rounded-lg">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
        
        <!-- Carousel Controls -->
        <?php if (count($carouselItems) > 1): ?>
        <button onclick="prevSlide()" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>
        
        <button onclick="nextSlide()" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
        
        <!-- Carousel Indicators -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <?php foreach ($carouselItems as $index => $item): ?>
            <button onclick="goToSlide(<?php echo $index; ?>)" 
                    class="carousel-indicator w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all <?php echo $index === 0 ? 'bg-white' : ''; ?>">
            </button>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
    <?php else: ?>
    <!-- Default Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Professional Medical Marketplace
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Premium medical products for healthcare professionals. Botulinum toxins, dermal fillers, 
                and medical equipment with bulk pricing discounts.
            </p>
            <a href="/products.php" class="btn-primary text-lg px-8 py-3">
                Browse Products
            </a>
        </div>
    </div>
    <?php endif; ?>
</section>

<!-- Categories Section -->
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p class="text-lg text-gray-600">Explore our comprehensive range of medical products</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <?php foreach ($categories as $category): ?>
            <a href="/products.php?category=<?php echo urlencode($category['slug']); ?>" 
               class="card p-6 hover:shadow-lg transition-shadow group">
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                        <!-- Icon placeholder - you can add actual icons here -->
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2"><?php echo sanitizeInput($category['name']); ?></h3>
                    <p class="text-gray-600"><?php echo sanitizeInput($category['description']); ?></p>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Featured Products Section -->
<section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p class="text-lg text-gray-600">Premium medical products trusted by professionals</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <?php foreach ($featuredProducts as $product): ?>
            <div class="card overflow-hidden hover:shadow-lg transition-shadow">
                <div class="aspect-square bg-white overflow-hidden">
                    <img src="<?php echo sanitizeInput($product['image_url']); ?>" 
                         alt="<?php echo sanitizeInput($product['name']); ?>"
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <?php echo sanitizeInput($product['name']); ?>
                    </h3>
                    
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                        <?php echo sanitizeInput(substr($product['description'], 0, 100)) . '...'; ?>
                    </p>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                            <span class="text-lg font-bold text-blue-600">
                                <?php echo formatPrice($product['price']); ?>
                            </span>
                            <?php if ($product['original_price'] && $product['original_price'] > $product['price']): ?>
                            <span class="text-sm text-gray-400 line-through">
                                <?php echo formatPrice($product['original_price']); ?>
                            </span>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($product['rating'] > 0): ?>
                        <div class="flex items-center space-x-1">
                            <span class="text-yellow-400">⭐</span>
                            <span class="text-sm text-gray-600"><?php echo $product['rating']; ?></span>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="flex space-x-2">
                        <a href="/product.php?id=<?php echo $product['id']; ?>" 
                           class="flex-1 btn-secondary text-center">
                            View Details
                        </a>
                        
                        <?php if (isLoggedIn()): ?>
                        <button onclick="addToCart(<?php echo $product['id']; ?>)" 
                                class="btn-primary px-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="text-center mt-12">
            <a href="/products.php" class="btn-primary text-lg px-8 py-3">
                View All Products
            </a>
        </div>
    </div>
</section>

<!-- Trusted Brands Section -->
<?php if (!empty($brands)): ?>
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Trusted Brands</h2>
            <p class="text-lg text-gray-600">Partner with industry-leading manufacturers</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <?php foreach ($brands as $brand): ?>
            <div class="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img src="<?php echo sanitizeInput($brand['image_url']); ?>" 
                     alt="<?php echo sanitizeInput($brand['name']); ?>"
                     class="max-h-12 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all">
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Why Choose Us Section -->
<section class="py-16 bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4">Why Choose Meds-Go?</h2>
            <p class="text-lg text-gray-300">Professional healthcare marketplace you can trust</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Licensed & Verified</h3>
                <p class="text-gray-300">All healthcare professionals undergo rigorous license verification</p>
            </div>
            
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Bulk Pricing</h3>
                <p class="text-gray-300">Competitive bulk discounts for volume purchases</p>
            </div>
            
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p class="text-gray-300">Quick and secure delivery across Canada</p>
            </div>
        </div>
    </div>
</section>

<script>
// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.carousel-indicator');

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.remove('hidden');
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
            slide.classList.add('hidden');
        }
    });
    
    indicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('bg-white');
            indicator.classList.remove('bg-white/50');
        } else {
            indicator.classList.remove('bg-white');
            indicator.classList.add('bg-white/50');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
}

// Auto-advance carousel
if (slides.length > 1) {
    setInterval(nextSlide, 5000);
}
</script>

<?php require_once 'includes/footer.php'; ?>
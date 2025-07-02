<?php
$pageTitle = "Medical Products";
$pageDescription = "Browse our comprehensive catalog of professional medical products including botulinum toxins, dermal fillers, and medical equipment.";

require_once 'includes/header.php';

// Get filters from URL
$categorySlug = isset($_GET['category']) ? sanitizeInput($_GET['category']) : '';
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$perPage = 12;
$offset = ($page - 1) * $perPage;

// Build filters
$filters = [];
if ($categorySlug) {
    $categoryStmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
    $categoryStmt->execute([$categorySlug]);
    $category = $categoryStmt->fetch();
    if ($category) {
        $filters['category_id'] = $category['id'];
    }
}
if ($search) {
    $filters['search'] = $search;
}

// Get total count for pagination
$countSql = "SELECT COUNT(*) as total FROM products p";
$countParams = [];
if (!empty($filters['category_id'])) {
    $countSql .= " WHERE p.category_id = ?";
    $countParams[] = $filters['category_id'];
}
if (!empty($filters['search'])) {
    $countSql .= (!empty($countParams) ? " AND" : " WHERE") . " (p.name LIKE ? OR p.description LIKE ?)";
    $countParams[] = '%' . $filters['search'] . '%';
    $countParams[] = '%' . $filters['search'] . '%';
}

$countStmt = $db->prepare($countSql);
$countStmt->execute($countParams);
$totalProducts = $countStmt->fetch()['total'];
$totalPages = ceil($totalProducts / $perPage);

// Get products with pagination
$sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id";
$params = [];

if (!empty($filters['category_id'])) {
    $sql .= " WHERE p.category_id = ?";
    $params[] = $filters['category_id'];
}
if (!empty($filters['search'])) {
    $sql .= (!empty($params) ? " AND" : " WHERE") . " (p.name LIKE ? OR p.description LIKE ?)";
    $params[] = '%' . $filters['search'] . '%';
    $params[] = '%' . $filters['search'] . '%';
}

$sql .= " ORDER BY p.featured DESC, p.created_at DESC LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Get categories for filter
$categories = getCategories();

// Get current category info
$currentCategory = null;
if ($categorySlug) {
    foreach ($categories as $cat) {
        if ($cat['slug'] === $categorySlug) {
            $currentCategory = $cat;
            break;
        }
    }
}
?>

<!-- Breadcrumb -->
<div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
                <li><a href="/" class="text-gray-500 hover:text-gray-700">Home</a></li>
                <li><span class="text-gray-400">/</span></li>
                <li><span class="text-gray-900">Products</span></li>
                <?php if ($currentCategory): ?>
                <li><span class="text-gray-400">/</span></li>
                <li><span class="text-gray-900"><?php echo sanitizeInput($currentCategory['name']); ?></span></li>
                <?php endif; ?>
            </ol>
        </nav>
    </div>
</div>

<!-- Page Header -->
<section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                <?php echo $currentCategory ? sanitizeInput($currentCategory['name']) : 'All Products'; ?>
            </h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                <?php echo $currentCategory ? sanitizeInput($currentCategory['description']) : 'Professional medical products for healthcare providers'; ?>
            </p>
        </div>
    </div>
</section>

<!-- Filters and Products -->
<section class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Filters Bar -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <!-- Search -->
                <form method="GET" class="flex-1 max-w-md">
                    <?php if ($categorySlug): ?>
                    <input type="hidden" name="category" value="<?php echo sanitizeInput($categorySlug); ?>">
                    <?php endif; ?>
                    <div class="relative">
                        <input type="text" 
                               name="search" 
                               value="<?php echo sanitizeInput($search); ?>"
                               placeholder="Search products..." 
                               class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </form>
                
                <!-- Category Filter -->
                <div class="flex items-center space-x-4">
                    <label class="text-sm font-medium text-gray-700">Category:</label>
                    <select onchange="filterByCategory(this.value)" class="border rounded-lg px-3 py-2">
                        <option value="">All Categories</option>
                        <?php foreach ($categories as $category): ?>
                        <option value="<?php echo sanitizeInput($category['slug']); ?>" 
                                <?php echo $categorySlug === $category['slug'] ? 'selected' : ''; ?>>
                            <?php echo sanitizeInput($category['name']); ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <!-- Results Count -->
                <div class="text-sm text-gray-500">
                    Showing <?php echo min($offset + 1, $totalProducts); ?>-<?php echo min($offset + $perPage, $totalProducts); ?> of <?php echo $totalProducts; ?> products
                </div>
            </div>
        </div>
        
        <!-- Products Grid -->
        <?php if (!empty($products)): ?>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <?php foreach ($products as $product): ?>
            <div class="card overflow-hidden hover:shadow-lg transition-shadow">
                <!-- Product Image -->
                <div class="aspect-square bg-white overflow-hidden">
                    <img src="<?php echo sanitizeInput($product['image_url']); ?>" 
                         alt="<?php echo sanitizeInput($product['name']); ?>"
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                
                <!-- Product Info -->
                <div class="p-4">
                    <!-- Category Badge -->
                    <div class="mb-2">
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            <?php echo sanitizeInput($product['category_name']); ?>
                        </span>
                        <?php if ($product['featured']): ?>
                        <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-1">
                            Featured
                        </span>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Product Name -->
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <a href="/product.php?id=<?php echo $product['id']; ?>" class="hover:text-blue-600">
                            <?php echo sanitizeInput($product['name']); ?>
                        </a>
                    </h3>
                    
                    <!-- Description -->
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                        <?php echo sanitizeInput(substr($product['description'], 0, 100)) . '...'; ?>
                    </p>
                    
                    <!-- Price and Rating -->
                    <div class="flex items-center justify-between mb-4">
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
                            <span class="text-xs text-gray-500">(<?php echo $product['review_count']; ?>)</span>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Bulk Pricing Info -->
                    <?php if ($product['bulk_discounts']): ?>
                    <div class="mb-4 p-2 bg-green-50 rounded border">
                        <p class="text-xs text-green-700 font-medium">Bulk Discounts Available</p>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Actions -->
                    <div class="flex space-x-2">
                        <a href="/product.php?id=<?php echo $product['id']; ?>" 
                           class="flex-1 btn-secondary text-center text-sm">
                            View Details
                        </a>
                        
                        <?php if (isLoggedIn()): ?>
                        <button onclick="addToCart(<?php echo $product['id']; ?>)" 
                                class="btn-primary px-3 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </button>
                        <?php else: ?>
                        <a href="/login.php" class="btn-primary px-3 text-sm">
                            Login
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
        <div class="flex justify-center">
            <nav class="flex items-center space-x-2">
                <!-- Previous Button -->
                <?php if ($page > 1): ?>
                <a href="?<?php echo http_build_query(array_merge($_GET, ['page' => $page - 1])); ?>" 
                   class="px-3 py-2 text-gray-500 hover:text-gray-700 border rounded">
                    Previous
                </a>
                <?php endif; ?>
                
                <!-- Page Numbers -->
                <?php for ($i = max(1, $page - 2); $i <= min($totalPages, $page + 2); $i++): ?>
                <?php if ($i == $page): ?>
                <span class="px-3 py-2 bg-blue-600 text-white border rounded">
                    <?php echo $i; ?>
                </span>
                <?php else: ?>
                <a href="?<?php echo http_build_query(array_merge($_GET, ['page' => $i])); ?>" 
                   class="px-3 py-2 text-gray-700 hover:text-blue-600 border rounded">
                    <?php echo $i; ?>
                </a>
                <?php endif; ?>
                <?php endfor; ?>
                
                <!-- Next Button -->
                <?php if ($page < $totalPages): ?>
                <a href="?<?php echo http_build_query(array_merge($_GET, ['page' => $page + 1])); ?>" 
                   class="px-3 py-2 text-gray-500 hover:text-gray-700 border rounded">
                    Next
                </a>
                <?php endif; ?>
            </nav>
        </div>
        <?php endif; ?>
        
        <?php else: ?>
        <!-- No Products Found -->
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p class="mt-2 text-gray-500">
                <?php if ($search): ?>
                No products match your search for "<?php echo sanitizeInput($search); ?>".
                <?php else: ?>
                No products available in this category.
                <?php endif; ?>
            </p>
            <div class="mt-6">
                <a href="/products.php" class="btn-primary">
                    View All Products
                </a>
            </div>
        </div>
        <?php endif; ?>
    </div>
</section>

<script>
function filterByCategory(categorySlug) {
    const url = new URL(window.location);
    if (categorySlug) {
        url.searchParams.set('category', categorySlug);
    } else {
        url.searchParams.delete('category');
    }
    url.searchParams.delete('page'); // Reset to first page
    window.location.href = url.toString();
}
</script>

<?php require_once 'includes/footer.php'; ?>
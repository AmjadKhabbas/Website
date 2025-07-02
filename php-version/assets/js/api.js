/**
 * Frontend API client for PHP backend
 * Replaces fetch calls that were used with Node.js/Express
 */

class MedsGoAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = this.getToken();
    }

    /**
     * Get authentication token from localStorage or session
     */
    getToken() {
        return localStorage.getItem('auth_token') || '';
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Make HTTP request to PHP API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin' // Include session cookies
        };

        // Add authorization header if token exists
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ===== AUTHENTICATION METHODS =====

    /**
     * Login user
     */
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    /**
     * Register new user
     */
    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        return await this.request('/auth/user');
    }

    /**
     * Logout user
     */
    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.setToken(null);
    }

    // ===== PRODUCTS METHODS =====

    /**
     * Get products with filtering
     */
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return await this.request(endpoint);
    }

    /**
     * Get single product
     */
    async getProduct(id) {
        return await this.request(`/products?id=${id}`);
    }

    /**
     * Create product (Admin only)
     */
    async createProduct(productData) {
        return await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Update product (Admin only)
     */
    async updateProduct(id, productData) {
        return await this.request(`/products?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Delete product (Admin only)
     */
    async deleteProduct(id) {
        return await this.request(`/products?id=${id}`, {
            method: 'DELETE'
        });
    }

    // ===== CART METHODS =====

    /**
     * Get cart items
     */
    async getCart() {
        return await this.request('/cart');
    }

    /**
     * Add item to cart
     */
    async addToCart(productId, quantity = 1) {
        return await this.request('/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `product_id=${productId}&quantity=${quantity}`
        });
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(itemId, quantity) {
        return await this.request('/cart', {
            method: 'PUT',
            body: JSON.stringify({ item_id: itemId, quantity })
        });
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        return await this.request(`/cart?item_id=${itemId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        return await this.request('/cart', {
            method: 'DELETE'
        });
    }

    // ===== ORDERS METHODS =====

    /**
     * Get orders
     */
    async getOrders(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/orders?${queryString}` : '/orders';
        
        return await this.request(endpoint);
    }

    /**
     * Get single order
     */
    async getOrder(id) {
        return await this.request(`/orders?id=${id}`);
    }

    /**
     * Create order
     */
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    /**
     * Update order status (Admin only)
     */
    async updateOrder(id, updateData) {
        return await this.request(`/orders?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    // ===== USERS METHODS =====

    /**
     * Get users (Admin only)
     */
    async getUsers(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/users?${queryString}` : '/users';
        
        return await this.request(endpoint);
    }

    /**
     * Update user (Admin only)
     */
    async updateUser(id, userData) {
        return await this.request(`/users?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Delete user (Admin only)
     */
    async deleteUser(id) {
        return await this.request(`/users?id=${id}`, {
            method: 'DELETE'
        });
    }
}

// Initialize global API instance
const api = new MedsGoAPI();

// ===== USAGE EXAMPLES =====

/**
 * Example: Login form handler
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    try {
        showLoading();
        const response = await api.login(email, password);
        
        if (response.user) {
            showToast('Login successful!', 'success');
            
            // Redirect based on user role
            if (response.user.role === 'admin') {
                window.location.href = '/admin/';
            } else {
                window.location.href = '/';
            }
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Example: Add to cart
 */
async function addToCart(productId, quantity = 1) {
    try {
        showLoading();
        const response = await api.addToCart(productId, quantity);
        
        if (response.success) {
            showToast('Product added to cart!', 'success');
            updateCartBadge(); // Update cart count in UI
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Example: Load products with filters
 */
async function loadProducts(filters = {}) {
    try {
        showLoading();
        const response = await api.getProducts(filters);
        
        if (response.products) {
            displayProducts(response.products);
            displayPagination(response.pagination);
        }
    } catch (error) {
        showToast('Failed to load products', 'error');
        console.error('Error loading products:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Example: Create order
 */
async function createOrder(orderData) {
    try {
        showLoading();
        const response = await api.createOrder(orderData);
        
        if (response.id) {
            showToast('Order placed successfully!', 'success');
            window.location.href = `/order-confirmation?id=${response.id}`;
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Example: Admin approve user
 */
async function approveUser(userId, approved = true) {
    try {
        showLoading();
        const response = await api.updateUser(userId, { is_approved: approved });
        
        if (response.id) {
            const action = approved ? 'approved' : 'rejected';
            showToast(`User ${action} successfully!`, 'success');
            
            // Refresh user list
            loadUsers();
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show loading indicator
 */
function showLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = 'block';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Implementation depends on your toast library
    console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * Update cart badge count
 */
async function updateCartBadge() {
    try {
        const cartData = await api.getCart();
        const badge = document.getElementById('cart-badge');
        
        if (badge && cartData.count) {
            badge.textContent = cartData.count;
            badge.style.display = cartData.count > 0 ? 'inline' : 'none';
        }
    } catch (error) {
        console.error('Failed to update cart badge:', error);
    }
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);
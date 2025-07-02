<?php
$pageTitle = "Doctor Login";
$pageDescription = "Login to access premium medical products and manage your orders.";

require_once 'includes/header.php';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $redirect = sanitizeInput($_GET['redirect'] ?? '');
    
    if (empty($email) || empty($password)) {
        $error = "Please enter both email and password.";
    } else {
        // Check admin login first
        $adminStmt = $db->prepare("SELECT * FROM admin_users WHERE email = ? AND is_active = 1");
        $adminStmt->execute([$email]);
        $admin = $adminStmt->fetch();
        
        if ($admin && verifyPassword($password, $admin['password_hash'])) {
            // Admin login successful
            $_SESSION['admin_id'] = $admin['id'];
            
            // Update last login
            $updateStmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$admin['id']]);
            
            // Redirect to admin panel
            header('Location: /admin/');
            exit;
        }
        
        // Check regular user login
        $userStmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $userStmt->execute([$email]);
        $user = $userStmt->fetch();
        
        if ($user && verifyPassword($password, $user['password_hash'])) {
            if (!$user['is_approved']) {
                $error = "Your account is pending approval. Please wait for admin confirmation.";
            } else {
                // User login successful
                $_SESSION['user_id'] = $user['id'];
                
                // Redirect to intended page or default
                $redirectUrl = '/';
                if ($redirect) {
                    $redirectUrl = '/' . $redirect . '.php';
                } else if (isset($_GET['return_to'])) {
                    $redirectUrl = sanitizeInput($_GET['return_to']);
                }
                
                header('Location: ' . $redirectUrl);
                exit;
            }
        } else {
            $error = "Invalid email or password.";
        }
    }
}
?>

<!-- Login Form -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-xl">M</span>
                </div>
                <span class="text-2xl font-bold text-gray-900">Meds-Go</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p class="mt-2 text-gray-600">Access professional medical products</p>
        </div>
        
        <!-- Login Form -->
        <div class="card p-8">
            <?php if (isset($error)): ?>
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-red-800"><?php echo $error; ?></span>
                </div>
            </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-6">
                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           value="<?php echo isset($email) ? sanitizeInput($email) : ''; ?>"
                           required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="doctor@example.com">
                </div>
                
                <!-- Password -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input type="password" 
                           id="password" 
                           name="password" 
                           required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Enter your password">
                </div>
                
                <!-- Remember Me -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" 
                               id="remember" 
                               name="remember" 
                               class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <label for="remember" class="ml-2 text-sm text-gray-600">
                            Remember me
                        </label>
                    </div>
                    
                    <a href="/forgot-password.php" class="text-sm text-blue-600 hover:text-blue-800">
                        Forgot password?
                    </a>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" class="w-full btn-primary py-3 text-lg">
                    Sign In
                </button>
            </form>
            
            <!-- Divider -->
            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">New to Meds-Go?</span>
                    </div>
                </div>
            </div>
            
            <!-- Register Link -->
            <div class="mt-6 text-center">
                <a href="/register.php" class="text-blue-600 hover:text-blue-800 font-medium">
                    Create your professional account
                </a>
            </div>
        </div>
        
        <!-- Security Notice -->
        <div class="mt-8 text-center">
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Professional use only • Secure platform</span>
            </div>
            <p class="mt-2 text-xs text-gray-400">
                All accounts require medical license verification
            </p>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
<?php
/**
 * Users API endpoint - Handles user authentication and management
 * Replaces Express routes for user operations
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
$path = $_SERVER['REQUEST_URI'];

try {
    // Route handling
    if (strpos($path, '/auth/login') !== false) {
        handleLogin();
    } elseif (strpos($path, '/auth/register') !== false) {
        handleRegister();
    } elseif (strpos($path, '/auth/user') !== false) {
        handleGetCurrentUser();
    } elseif (strpos($path, '/auth/logout') !== false) {
        handleLogout();
    } else {
        switch ($method) {
            case 'GET':
                handleGetUsers();
                break;
            case 'PUT':
                handleUpdateUser();
                break;
            case 'DELETE':
                handleDeleteUser();
                break;
            default:
                errorResponse('Method not allowed', 405);
        }
    }
} catch (Exception $e) {
    error_log("Users API error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}

/**
 * POST /api/auth/login - User login
 */
function handleLogin() {
    global $db;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        errorResponse('Email and password are required');
    }
    
    // Check admin login first
    $adminStmt = $db->prepare("SELECT * FROM admin_users WHERE email = ? AND is_active = 1");
    $adminStmt->execute([$email]);
    $admin = $adminStmt->fetch();
    
    if ($admin && verifyPassword($password, $admin['password_hash'])) {
        $_SESSION['admin_id'] = $admin['id'];
        
        // Update last login
        $updateStmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$admin['id']]);
        
        successResponse([
            'user' => [
                'id' => $admin['id'],
                'email' => $admin['email'],
                'full_name' => $admin['full_name'],
                'role' => 'admin'
            ],
            'token' => session_id()
        ]);
        return;
    }
    
    // Check regular user login
    $userStmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $userStmt->execute([$email]);
    $user = $userStmt->fetch();
    
    if ($user && verifyPassword($password, $user['password_hash'])) {
        if (!$user['is_approved']) {
            errorResponse('Your account is pending approval');
        }
        
        $_SESSION['user_id'] = $user['id'];
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => 'user',
                'is_approved' => (bool)$user['is_approved'],
                'is_license_verified' => (bool)$user['is_license_verified']
            ],
            'token' => session_id()
        ]);
    } else {
        errorResponse('Invalid credentials');
    }
}

/**
 * POST /api/auth/register - User registration
 */
function handleRegister() {
    global $db;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['email', 'password', 'full_name', 'phone', 'license_number', 'practice_name'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            errorResponse("Field '$field' is required");
        }
    }
    
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    $fullName = sanitizeInput($input['full_name']);
    $phone = sanitizeInput($input['phone']);
    $licenseNumber = sanitizeInput($input['license_number']);
    $practiceName = sanitizeInput($input['practice_name']);
    $practiceAddress = sanitizeInput($input['practice_address'] ?? '');
    $specialization = sanitizeInput($input['specialization'] ?? '');
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('Invalid email format');
    }
    
    // Validate password strength
    if (strlen($password) < 8) {
        errorResponse('Password must be at least 8 characters long');
    }
    
    // Check if email already exists
    $checkStmt = $db->prepare("SELECT id FROM users WHERE email = ? UNION SELECT id FROM admin_users WHERE email = ?");
    $checkStmt->execute([$email, $email]);
    if ($checkStmt->fetch()) {
        errorResponse('Email already registered');
    }
    
    // Hash password
    $passwordHash = hashPassword($password);
    
    // Insert user
    $sql = "
        INSERT INTO users (
            email, password_hash, full_name, phone, license_number,
            practice_name, practice_address, specialization, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $email, $passwordHash, $fullName, $phone, $licenseNumber,
        $practiceName, $practiceAddress, $specialization
    ];
    
    $stmt = $db->prepare($sql);
    if ($stmt->execute($params)) {
        $userId = $db->lastInsertId();
        
        // Send notification email to admin (if configured)
        sendAdminNotificationEmail($email, $fullName, $licenseNumber);
        
        successResponse([
            'message' => 'Registration successful. Your account is pending approval.',
            'user_id' => $userId
        ], 201);
    } else {
        errorResponse('Registration failed');
    }
}

/**
 * GET /api/auth/user - Get current authenticated user
 */
function handleGetCurrentUser() {
    if (isAdmin()) {
        $admin = getCurrentAdmin();
        successResponse([
            'user' => [
                'id' => $admin['id'],
                'email' => $admin['email'],
                'full_name' => $admin['full_name'],
                'role' => 'admin'
            ]
        ]);
    } elseif (isLoggedIn()) {
        $user = getCurrentUser();
        successResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => 'user',
                'is_approved' => (bool)$user['is_approved'],
                'is_license_verified' => (bool)$user['is_license_verified']
            ]
        ]);
    } else {
        errorResponse('Not authenticated', 401);
    }
}

/**
 * POST /api/auth/logout - User logout
 */
function handleLogout() {
    session_destroy();
    successResponse(['message' => 'Logged out successfully']);
}

/**
 * GET /api/users - Get users list (Admin only)
 */
function handleGetUsers() {
    global $db;
    
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : 'all';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    
    switch ($status) {
        case 'pending':
            $whereConditions[] = 'is_approved = 0';
            break;
        case 'approved':
            $whereConditions[] = 'is_approved = 1';
            break;
        case 'verified':
            $whereConditions[] = 'is_license_verified = 1';
            break;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM users $whereClause";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get users
    $sql = "
        SELECT id, email, full_name, phone, license_number, practice_name,
               practice_address, specialization, is_approved, is_license_verified,
               created_at, approved_at, approved_by
        FROM users 
        $whereClause
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    // Format users
    foreach ($users as &$user) {
        $user['is_approved'] = (bool)$user['is_approved'];
        $user['is_license_verified'] = (bool)$user['is_license_verified'];
    }
    
    successResponse([
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * PUT /api/users/:id - Update user (Admin only)
 */
function handleUpdateUser() {
    global $db;
    
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    $userId = getIdFromUrl();
    if (!$userId) {
        errorResponse('User ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verify user exists
    $userStmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    
    if (!$user) {
        errorResponse('User not found', 404);
    }
    
    // Handle approval
    if (isset($input['is_approved'])) {
        $isApproved = (bool)$input['is_approved'];
        $adminEmail = getCurrentAdmin()['email'];
        
        $sql = "UPDATE users SET is_approved = ?, approved_by = ?, approved_at = NOW() WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$isApproved, $adminEmail, $userId]);
        
        // Send approval/rejection email
        sendApprovalEmail($user['email'], $user['full_name'], $isApproved);
    }
    
    // Handle license verification
    if (isset($input['is_license_verified'])) {
        $isVerified = (bool)$input['is_license_verified'];
        
        $sql = "UPDATE users SET is_license_verified = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$isVerified, $userId]);
    }
    
    // Get updated user
    $userStmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $updatedUser = $userStmt->fetch();
    
    successResponse($updatedUser);
}

/**
 * DELETE /api/users/:id - Delete user (Admin only)
 */
function handleDeleteUser() {
    global $db;
    
    if (!isAdmin()) {
        errorResponse('Admin access required', 403);
    }
    
    $userId = getIdFromUrl();
    if (!$userId) {
        errorResponse('User ID is required');
    }
    
    // Check if user has orders
    $orderStmt = $db->prepare("SELECT COUNT(*) as count FROM orders WHERE user_id = ?");
    $orderStmt->execute([$userId]);
    $orderCount = $orderStmt->fetch()['count'];
    
    if ($orderCount > 0) {
        errorResponse('Cannot delete user with existing orders');
    }
    
    // Delete user
    $deleteStmt = $db->prepare("DELETE FROM users WHERE id = ?");
    if ($deleteStmt->execute([$userId])) {
        successResponse(['message' => 'User deleted successfully']);
    } else {
        errorResponse('Failed to delete user');
    }
}

/**
 * Send admin notification email about new registration
 */
function sendAdminNotificationEmail($userEmail, $userName, $licenseNumber) {
    // Implementation depends on email configuration
    // This would use the email functions from includes/functions.php
}

/**
 * Send approval/rejection email to user
 */
function sendApprovalEmail($userEmail, $userName, $approved) {
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
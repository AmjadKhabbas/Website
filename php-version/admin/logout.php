<?php
require_once '../includes/functions.php';

// Clear all session data
session_destroy();

// Redirect to admin login
header('Location: /login.php');
exit;
?>
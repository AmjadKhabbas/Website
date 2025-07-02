<?php
require_once 'includes/functions.php';

// Clear all session data
session_destroy();

// Redirect to login page
header('Location: /login.php');
exit;
?>
<?php
/**
 * Email Configuration for Meds-Go Medical Marketplace
 * Configure your email settings here
 */

// Email configuration
define('SMTP_HOST', 'smtp.gmail.com');      // SMTP server (Gmail example)
define('SMTP_PORT', 587);                   // SMTP port (587 for TLS, 465 for SSL)
define('SMTP_SECURE', 'tls');               // Security type: tls, ssl, or false
define('SMTP_USERNAME', 'your-email@gmail.com'); // Your email address
define('SMTP_PASSWORD', 'your-app-password');     // Your email app password
define('FROM_EMAIL', 'your-email@gmail.com');     // From email address
define('FROM_NAME', 'Meds-Go Medical Marketplace'); // From name

// Admin notification email
define('ADMIN_EMAIL', 'admin@yourdomain.com');

/**
 * Email service class using PHPMailer or basic PHP mail
 */
class EmailService {
    
    /**
     * Send email using PHP mail function (basic version)
     * For production, consider using PHPMailer for better SMTP support
     */
    public function sendEmail($to, $subject, $message, $isHTML = true) {
        $headers = [
            'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
            'Reply-To: ' . FROM_EMAIL,
            'MIME-Version: 1.0'
        ];
        
        if ($isHTML) {
            $headers[] = 'Content-Type: text/html; charset=UTF-8';
        } else {
            $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        }
        
        $headerString = implode("\r\n", $headers);
        
        return mail($to, $subject, $message, $headerString);
    }
    
    /**
     * Send doctor registration confirmation email
     */
    public function sendDoctorRegistrationConfirmation($doctorEmail, $doctorName) {
        $subject = "Registration Confirmation - Meds-Go Medical Marketplace";
        
        $message = "
        <html>
        <head>
            <title>Registration Confirmation</title>
        </head>
        <body>
            <h2>Welcome to Meds-Go Medical Marketplace</h2>
            <p>Dear Dr. {$doctorName},</p>
            
            <p>Thank you for registering with Meds-Go Medical Marketplace. Your account has been created successfully and is currently under review.</p>
            
            <h3>What happens next?</h3>
            <ul>
                <li>Our team will verify your medical license and credentials</li>
                <li>You will receive an email notification once your account is approved</li>
                <li>Upon approval, you'll have full access to our medical product catalog</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The Meds-Go Team</p>
        </body>
        </html>
        ";
        
        return $this->sendEmail($doctorEmail, $subject, $message);
    }
    
    /**
     * Send admin notification about new doctor registration
     */
    public function sendAdminNotification($doctorData) {
        $subject = "New Doctor Registration - Requires Approval";
        
        $message = "
        <html>
        <head>
            <title>New Doctor Registration</title>
        </head>
        <body>
            <h2>New Doctor Registration Pending Approval</h2>
            
            <h3>Doctor Information:</h3>
            <ul>
                <li><strong>Name:</strong> {$doctorData['full_name']}</li>
                <li><strong>Email:</strong> {$doctorData['email']}</li>
                <li><strong>License Number:</strong> {$doctorData['license_number']}</li>
                <li><strong>College:</strong> {$doctorData['college_name']}</li>
                <li><strong>Province/State:</strong> {$doctorData['province_state']}</li>
                <li><strong>Practice Name:</strong> {$doctorData['practice_name']}</li>
                <li><strong>Practice Address:</strong> {$doctorData['practice_address']}</li>
            </ul>
            
            <p>Please review and approve this registration in the admin panel.</p>
            
            <p><a href='" . getSiteUrl() . "/admin/users.php'>View Pending Registrations</a></p>
        </body>
        </html>
        ";
        
        return $this->sendEmail(ADMIN_EMAIL, $subject, $message);
    }
    
    /**
     * Send approval/rejection email to doctor
     */
    public function sendApprovalEmail($doctorEmail, $doctorName, $approved, $reason = '') {
        if ($approved) {
            $subject = "Account Approved - Meds-Go Medical Marketplace";
            $message = "
            <html>
            <head>
                <title>Account Approved</title>
            </head>
            <body>
                <h2>Congratulations! Your Account Has Been Approved</h2>
                <p>Dear Dr. {$doctorName},</p>
                
                <p>Great news! Your Meds-Go Medical Marketplace account has been approved and activated.</p>
                
                <p>You can now:</p>
                <ul>
                    <li>Browse our complete catalog of medical products</li>
                    <li>Place orders with bulk pricing discounts</li>
                    <li>Access exclusive professional-grade products</li>
                    <li>Manage your orders and account settings</li>
                </ul>
                
                <p><a href='" . getSiteUrl() . "/login.php'>Login to Your Account</a></p>
                
                <p>Thank you for choosing Meds-Go Medical Marketplace.</p>
                
                <p>Best regards,<br>
                The Meds-Go Team</p>
            </body>
            </html>
            ";
        } else {
            $subject = "Account Application Update - Meds-Go Medical Marketplace";
            $message = "
            <html>
            <head>
                <title>Account Application Update</title>
            </head>
            <body>
                <h2>Account Application Update</h2>
                <p>Dear Dr. {$doctorName},</p>
                
                <p>Thank you for your interest in Meds-Go Medical Marketplace. Unfortunately, we were unable to approve your account at this time.</p>
                
                " . ($reason ? "<p><strong>Reason:</strong> {$reason}</p>" : "") . "
                
                <p>If you believe this is an error or would like to resubmit your application, please contact our support team.</p>
                
                <p>Best regards,<br>
                The Meds-Go Team</p>
            </body>
            </html>
            ";
        }
        
        return $this->sendEmail($doctorEmail, $subject, $message);
    }
}

/**
 * Get site URL helper function
 */
function getSiteUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['PHP_SELF']);
    return $protocol . '://' . $host . rtrim($path, '/');
}

// Create global email service instance
$emailService = new EmailService();
?>
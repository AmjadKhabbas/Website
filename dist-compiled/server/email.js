"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
    }
    /**
     * Initialize email transporter with Gmail SMTP
     * Requires GMAIL_USER and GMAIL_APP_PASSWORD environment variables
     */
    async initialize() {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        if (!gmailUser || !gmailPass) {
            console.warn('Gmail credentials not provided - email functionality disabled');
            return;
        }
        try {
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: gmailUser,
                    pass: gmailPass, // Gmail App Password (not regular password)
                },
            });
            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize email service:', error);
            this.transporter = null;
        }
    }
    /**
     * Send email using configured transporter
     */
    async sendEmail(emailData) {
        if (!this.transporter) {
            console.warn('Email service not initialized - skipping email send');
            return false;
        }
        try {
            const info = await this.transporter.sendMail({
                from: `"MedMarketplace" <${process.env.GMAIL_USER}>`,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
            });
            console.log('✅ Email sent successfully:', info.messageId);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
    /**
     * Send doctor registration confirmation email
     */
    async sendDoctorRegistrationConfirmation(doctorEmail, doctorName) {
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MedMarketplace</h1>
            <p>Professional Medical Supply Platform</p>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName},</h2>
            <p><strong>Thank you for your registration!</strong></p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">✓ Registration Received</span>
            </div>
            
            <p>Your medical professional account has been successfully submitted and is currently under review by our verification team.</p>
            
            <h3>Next Steps:</h3>
            <ul>
              <li>Our team will verify your medical license credentials</li>
              <li>You'll receive an approval notification within 1-2 business days</li>
              <li>Once approved, you'll have full access to our medical product catalog</li>
            </ul>
            
            <p><strong>Important:</strong> Your account is pending approval. You'll be notified once verification is complete.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>
            The MedMarketplace Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const emailText = `
      Hello Dr. ${doctorName},

      Thank you for your registration with MedMarketplace!

      Your medical professional account has been successfully submitted and is currently under review by our verification team.

      Next Steps:
      - Our team will verify your medical license credentials
      - You'll receive an approval notification within 1-2 business days
      - Once approved, you'll have full access to our medical product catalog

      Your account is pending approval. You'll be notified once verification is complete.

      Best regards,
      The MedMarketplace Team
    `;
        return await this.sendEmail({
            to: doctorEmail,
            subject: 'Registration Confirmation - Account Pending Approval',
            html: emailHtml,
            text: emailText,
        });
    }
    /**
     * Send admin notification about new doctor registration
     */
    async sendAdminNotification(doctorData) {
        const adminEmail = 'amjadkhabbas2002@gmail.com';
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Registration Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .detail-row { margin: 10px 0; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .label { font-weight: bold; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Registration Request</h2>
          </div>
          <div class="content">
            <p><strong>A new medical professional has submitted a registration request:</strong></p>
            
            <div class="detail-row"><span class="label">Full Name:</span> ${doctorData.fullName}</div>
            <div class="detail-row"><span class="label">Email:</span> ${doctorData.email}</div>
            ${doctorData.phone ? `<div class="detail-row"><span class="label">Phone:</span> ${doctorData.phone}</div>` : ''}
            <div class="detail-row"><span class="label">License Number:</span> ${doctorData.licenseNumber}</div>
            <div class="detail-row"><span class="label">Medical College:</span> ${doctorData.collegeName}</div>
            <div class="detail-row"><span class="label">Province/State:</span> ${doctorData.provinceState}</div>
            <div class="detail-row"><span class="label">Practice Name:</span> ${doctorData.practiceName}</div>
            <div class="detail-row"><span class="label">Practice Address:</span> ${doctorData.practiceAddress}</div>
            <div class="detail-row"><span class="label">Registration Date:</span> ${new Date().toLocaleString()}</div>
            
            <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <strong>Action Required:</strong> Please review this registration and approve or reject via the admin dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
        const emailText = `
      New Registration Request

      A new medical professional has submitted a registration request:

      Name: ${doctorData.fullName}
      Email: ${doctorData.email}
      ${doctorData.phone ? `Phone: ${doctorData.phone}` : ''}
      License Number: ${doctorData.licenseNumber}
      Medical College: ${doctorData.collegeName}
      Province/State: ${doctorData.provinceState}
      Practice Name: ${doctorData.practiceName}
      Practice Address: ${doctorData.practiceAddress}
      Registration Date: ${new Date().toLocaleString()}

      Please review this registration and approve or reject via the admin dashboard.
    `;
        return await this.sendEmail({
            to: adminEmail,
            subject: 'New Registration Request',
            html: emailHtml,
            text: emailText,
        });
    }
    /**
     * Send approval/rejection email to doctor
     */
    async sendApprovalEmail(doctorEmail, doctorName, approved) {
        const status = approved ? 'Approved' : 'Rejected';
        const statusColor = approved ? '#10b981' : '#ef4444';
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Registration ${status}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Medical Marketplace</h1>
            <p>Registration ${status}</p>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName},</h2>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${approved ? '✓' : '✗'} ${status}</span>
            </div>
            
            ${approved ? `
              <p><strong>Congratulations!</strong> Your medical professional account has been approved.</p>
              <p>You now have full access to our medical product catalog and can begin placing orders.</p>
              <p>You can log in to your account using the credentials you provided during registration.</p>
            ` : `
              <p>We regret to inform you that your registration application has not been approved at this time.</p>
              <p>This decision may be due to incomplete information or verification requirements not being met.</p>
              <p>If you believe this is an error or would like to resubmit your application, please contact our support team.</p>
            `}
            
            <p>Best regards,<br>
            The Medical Marketplace Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: doctorEmail,
            subject: `Registration ${status} - Medical Marketplace`,
            html: emailHtml,
        });
    }
}
// Export singleton instance
exports.emailService = new EmailService();
// Initialize on import
exports.emailService.initialize();
//# sourceMappingURL=email.js.map
import nodemailer from 'nodemailer';

/**
 * Email Service for Doctor Registration Confirmations
 * Uses Gmail SMTP for reliable email delivery
 * Alternative to SendGrid - requires Gmail app password
 */

interface EmailConfig {
  user: string;
  pass: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

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
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass, // Gmail App Password (not regular password)
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  /**
   * Send email using configured transporter
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
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
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send doctor registration confirmation email
   */
  async sendDoctorRegistrationConfirmation(doctorEmail: string, doctorName: string): Promise<boolean> {
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
  async sendAdminNotification(doctorData: any): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'amjadkhabbas2002@gmail.com';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Doctor Registration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { background: #f1f5f9; padding: 20px; }
          .detail-row { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Doctor Registration</h2>
          </div>
          <div class="content">
            <p><strong>A new medical professional has registered and requires approval.</strong></p>
            
            <div class="detail-row"><strong>Name:</strong> ${doctorData.fullName}</div>
            <div class="detail-row"><strong>Email:</strong> ${doctorData.email}</div>
            <div class="detail-row"><strong>License Number:</strong> ${doctorData.licenseNumber}</div>
            <div class="detail-row"><strong>College:</strong> ${doctorData.collegeName}</div>
            <div class="detail-row"><strong>Practice:</strong> ${doctorData.practiceName}</div>
            <div class="detail-row"><strong>Address:</strong> ${doctorData.practiceAddress}</div>
            <div class="detail-row"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</div>
            
            <p style="margin-top: 20px;">
              <strong>Action Required:</strong> Please review and approve/reject this registration in the admin panel.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: `New Doctor Registration: ${doctorData.fullName}`,
      html: emailHtml,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Initialize on import
emailService.initialize();
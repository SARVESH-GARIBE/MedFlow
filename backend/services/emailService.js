import nodemailer from 'nodemailer';

// Demo mode flag - set to true to auto-approve doctors
export const IS_DEMO_MODE = process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true';

// Create transporter for sending emails
const createTransporter = () => {
  // For development, use Ethereal (test email service)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHREAL_USER || '',
        pass: process.env.ETHREAL_PASS || ''
      }
    });
  }

  // For production, use your email provider
  return nodemailer.createTransport({
    service: 'gmail', // or 'sendgrid', 'ses', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send doctor verification email
export const sendDoctorVerificationEmail = async (doctorEmail, doctorName, isApproved = true, rejectionReason = '') => {
  try {
    const transporter = createTransporter();

    const subject = isApproved 
      ? '🎉 Welcome to MedFlow - Your Account is Verified!' 
      : 'MedFlow Doctor Registration - Update Required';

    const html = isApproved 
      ? `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏥 MedFlow</h1>
                <p>Your Doctor Account is Verified!</p>
              </div>
              <div class="content">
                <h2>Welcome, Dr. ${doctorName}!</h2>
                <p>Congratulations! Your doctor account has been successfully verified. You now have full access to the MedFlow platform.</p>
                
                <h3>What you can do now:</h3>
                <ul>
                  <li>✅ Manage your patient appointments</li>
                  <li>✅ View and update patient records</li>
                  <li>✅ Set your availability and schedule</li>
                  <li>✅ Receive and respond to patient reviews</li>
                  <li>✅ Access the AI-powered diagnostic tools</li>
                </ul>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/dashboard" class="button">
                    Go to Doctor Dashboard
                  </a>
                </div>

                <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
                
                <div class="footer">
                  <p>Best regards,<br>The MedFlow Team</p>
                  <p>🏥 Transforming Healthcare Together</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ MedFlow</h1>
                <p>Registration Update Required</p>
              </div>
              <div class="content">
                <h2>Hello, Dr. ${doctorName}</h2>
                <p>We regret to inform you that your doctor registration could not be approved at this time.</p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <strong>Reason for rejection:</strong><br>
                  ${rejectionReason || 'Please contact support for more details.'}
                </div>

                <h3>Next Steps:</h3>
                <ul>
                  <li>Review the reason provided above</li>
                  <li>Update your profile with correct information</li>
                  <li>Resubmit your application for verification</li>
                </ul>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/profile" class="button" style="background: #f59e0b;">
                    Update My Profile
                  </a>
                </div>

                <div class="footer">
                  <p>Need help? Contact our support team.</p>
                  <p>The MedFlow Team</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MedFlow <noreply@medflow.local>',
      to: doctorEmail,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw - email failure shouldn't break the verification flow
    return { success: false, error: error.message };
  }
};

// Send welcome email to new doctors (pending verification)
export const sendWelcomeEmail = async (doctorEmail, doctorName) => {
  try {
    const transporter = createTransporter();

    const subject = 'Welcome to MedFlow - Registration Received';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .status { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MedFlow</h1>
              <p>Registration Received</p>
            </div>
            <div class="content">
              <h2>Welcome, Dr. ${doctorName}!</h2>
              <p>Thank you for registering with MedFlow. Your application has been received and is being processed.</p>
              
              <div class="status">
                <strong>Current Status:</strong> ⏳ Under Verification<br>
                <small>Our team typically reviews applications within 24-48 hours.</small>
              </div>

              <h3>What happens next?</h3>
              <ul>
                <li>Our verification team will review your credentials</li>
                <li>You'll receive an email once your account is verified</li>
                <li>After verification, you can access all doctor features</li>
              </ul>

              <p>We'll notify you as soon as your account is approved. If you have any questions, feel free to contact our support team.</p>

              <div class="footer">
                <p>Best regards,<br>The MedFlow Team</p>
                <p>🏥 Transforming Healthcare Together</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MedFlow <noreply@medflow.local>',
      to: doctorEmail,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email failed:', error.message);
    return { success: false, error: error.message };
  }
};
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email notification types
type NotificationType = 
  | 'INQUIRY_RECEIVED'
  | 'INQUIRY_SENT'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'DEALER_APPROVED'
  | 'WELCOME';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Mock email sender - Replace with your preferred provider (SendGrid, AWS SES, etc.)
async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  // In production, replace this with actual email provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send(data);

  console.log('📧 Email Notification:', {
    to: data.to,
    subject: data.subject,
  });

  // For now, just log the email. In production, integrate with email service
  return { success: true };
}

// Email templates
function getEmailTemplate(type: NotificationType, data: any): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shelbyexchange.com';

  switch (type) {
    case 'INQUIRY_RECEIVED':
      return {
        to: data.sellerEmail,
        subject: `New inquiry about your ${data.vehicleYear} ${data.vehicleModel}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002D72;">New Vehicle Inquiry</h2>
            <p>Hello ${data.sellerName},</p>
            <p>You have received a new inquiry about your vehicle listing:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</h3>
              <p><strong>From:</strong> ${data.buyerName}</p>
              <p><strong>Email:</strong> ${data.buyerEmail}</p>
              <p><strong>Phone:</strong> ${data.buyerPhone || 'Not provided'}</p>
              <p><strong>Message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px;">${data.message}</p>
            </div>
            <p><a href="${baseUrl}/listings/${data.listingId}" style="background: #002D72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Listing</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This email was sent by Shelby Exchange. Please do not reply directly to this email.
            </p>
          </div>
        `,
        text: `New inquiry about your ${data.vehicleYear} ${data.vehicleModel}. From: ${data.buyerName} (${data.buyerEmail}). Message: ${data.message}`,
      };

    case 'INQUIRY_SENT':
      return {
        to: data.buyerEmail,
        subject: `Your inquiry has been sent - ${data.vehicleYear} ${data.vehicleModel}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002D72;">Inquiry Confirmation</h2>
            <p>Hello ${data.buyerName},</p>
            <p>Your inquiry about the following vehicle has been sent to the seller:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</h3>
              <p><strong>Your message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px;">${data.message}</p>
            </div>
            <p>The seller will contact you directly at ${data.buyerEmail} or ${data.buyerPhone}.</p>
            <p><a href="${baseUrl}/listings/${data.listingId}" style="background: #002D72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Listing</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Thank you for using Shelby Exchange!
            </p>
          </div>
        `,
        text: `Your inquiry about ${data.vehicleYear} ${data.vehicleModel} has been sent. The seller will contact you soon.`,
      };

    case 'LISTING_APPROVED':
      return {
        to: data.sellerEmail,
        subject: `Your listing has been approved!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002D72;">Listing Approved 🎉</h2>
            <p>Hello ${data.sellerName},</p>
            <p>Great news! Your vehicle listing has been approved and is now live on Shelby Exchange.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</h3>
              <p><strong>Listing ID:</strong> ${data.listingId}</p>
            </div>
            <p><a href="${baseUrl}/listings/${data.listingId}" style="background: #002D72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Your Listing</a></p>
            <p style="margin-top: 20px;">You can manage your listing from your <a href="${baseUrl}/profile">profile page</a>.</p>
          </div>
        `,
        text: `Your listing for ${data.vehicleYear} ${data.vehicleModel} has been approved and is now live!`,
      };

    case 'LISTING_REJECTED':
      return {
        to: data.sellerEmail,
        subject: `Your listing requires attention`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E31837;">Listing Update Required</h2>
            <p>Hello ${data.sellerName},</p>
            <p>Unfortunately, your vehicle listing was not approved at this time.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</h3>
            </div>
            <p>Please review our <a href="${baseUrl}/terms">listing guidelines</a> and submit a new listing with complete information.</p>
            <p>If you have questions, please contact our support team.</p>
          </div>
        `,
        text: `Your listing was not approved. ${data.reason ? `Reason: ${data.reason}` : ''}`,
      };

    case 'DEALER_APPROVED':
      return {
        to: data.dealerEmail,
        subject: `Welcome to Shelby Exchange Dealer Network!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002D72;">Dealer Application Approved! 🎉</h2>
            <p>Hello ${data.dealerName},</p>
            <p>Congratulations! Your dealership <strong>${data.dealershipName}</strong> has been approved for the Shelby Exchange Dealer Network.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Subscription</h3>
              <p><strong>Plan:</strong> ${data.subscriptionTier}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <p>You can now:</p>
            <ul>
              <li>List vehicles without per-listing fees</li>
              <li>Access your dealer dashboard</li>
              <li>Receive priority support</li>
            </ul>
            <p><a href="${baseUrl}/dealers/login" style="background: #002D72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Dealer Dashboard</a></p>
          </div>
        `,
        text: `Your dealer application for ${data.dealershipName} has been approved!`,
      };

    case 'WELCOME':
      return {
        to: data.userEmail,
        subject: `Welcome to Shelby Exchange!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002D72;">Welcome to Shelby Exchange!</h2>
            <p>Hello ${data.userName},</p>
            <p>Thank you for joining the world&apos;s premier marketplace for Ford Shelby vehicles.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Get Started</h3>
              <ul>
                <li><a href="${baseUrl}/listings">Browse listings</a></li>
                <li><a href="${baseUrl}/sell">Sell your Shelby</a></li>
                <li><a href="${baseUrl}/dealers">Join our dealer network</a></li>
              </ul>
            </div>
            <p>We&apos;re excited to have you as part of our community!</p>
          </div>
        `,
        text: `Welcome to Shelby Exchange! Browse listings, sell your vehicle, or join our dealer network.`,
      };

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      );
    }

    // Generate email template
    const emailData = getEmailTemplate(type as NotificationType, data);

    // Send email
    const result = await sendEmail(emailData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log notification in database (optional)
    try {
      await supabase.from('email_notifications').insert({
        recipient_email: emailData.to,
        notification_type: type,
        subject: emailData.subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch {
      // Silent fail for logging - don't block the response
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

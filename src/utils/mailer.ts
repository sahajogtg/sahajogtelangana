import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail address
    pass: process.env.EMAIL_PASSWORD,  // Your Gmail app password
  },
});

interface RegistrationEmailData {
  name: string;
  eventTitle: string;
  registrationId: string;
  age: number;
  amountPaid: number;
  state: string;
  city: string;
  transactionNumber: string;
  createdAt: string;
  email: string;
}

export async function sendRegistrationEmail(data: RegistrationEmailData) {
  // Format date safely with fallback
  const formattedDate = data.createdAt 
    ? format(new Date(data.createdAt), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');

  // Create HTML content for the email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .receipt { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .section { margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .amount { color: #2F855A; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Sahaja Yoga Telangana</h2>
          <p>Event Registration Receipt</p>
        </div>
        
        <div class="receipt">
          <div class="section">
            <p><strong>Receipt #:</strong> ${data.registrationId.substring(0, 8)}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
          </div>
          
          <div class="section">
            <h3>Event Details</h3>
            <p><strong>${data.eventTitle}</strong></p>
          </div>
          
          <div class="section">
            <h3>Participant Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Age:</strong> ${data.age} years</p>
            <p><strong>Location:</strong> ${data.city}, ${data.state}</p>
            <p><strong>Registration ID:</strong> ${data.registrationId}</p>
          </div>
          
          <div class="section">
            <h3>Payment Information</h3>
            <p><strong>Amount Paid:</strong> <span class="amount">₹${data.amountPaid.toLocaleString()}</span></p>
            <p><strong>Transaction ID:</strong> ${data.transactionNumber}</p>
            <p><strong>Payment Status:</strong> <span style="color: #2F855A;">Confirmed</span></p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for registering for the event!</p>
          <p>For any inquiries, please contact us at info@sahajayogatelangana.org</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Sahaja Yoga Telangana" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `Registration Confirmation - ${data.eventTitle}`,
    html: htmlContent,
  });

  return info;
} 
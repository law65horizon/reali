import { info } from 'console';
import nodemailer from 'nodemailer';

let emailTransporter;

// Function to create a new email transporter
export const createEmailTransporter = async () => {
  try {
    // Create a test account for Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Set up the email transporter using the test account
    emailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,  // Set to true if using SSL
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📧 Email transporter created. Preview URLs will be logged.');

    // Generate a sample verification code
    const verificationCode = '123456'; // Replace with dynamic code

    // Send the email
    const info = await emailTransporter.sendMail({
      from: '"Real Estate App" <noreply@realestate.com>',
      to: 'miw@gmail.com',
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Real Estate App</h2>
          <p style="font-size: 16px; color: #666;">Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #2563eb;">${verificationCode}</h1>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            This code expires in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

     const dms = nodemailer.getTestMessageUrl(info);
      console.log('Test email sent! Preview URL:', dms);

    return emailTransporter;  // Return the transporter for use in sending emails
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;  // Propagate the error
  }
};



// export const createEmailTransporterw = async() => {
//   // Create test account for development
//   const testAccount = await nodemailer.createTestAccount();
  
//   emailTransporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   });

//   const code = '10';
  
//   console.log('📧 Email transporter created. Preview URLs will be logged.');

//   let pev = emailTransporter.sendMail({
//     from: '"Real Estate App" <noreply@realestate.com>',
//         to: "miw@gmail.com",
//         subject: 'Your Verification Code',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #333;">Welcome to Real Estate App</h2>
//             <p style="font-size: 16px; color: #666;">Your verification code is:</p>
//             <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
//               <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #2563eb;">${code}</h1>
//             </div>
//             <p style="font-size: 14px; color: #999; margin-top: 20px;">
//               This code expires in 10 minutes. If you didn't request this code, please ignore this email.
//             </p>
//           </div>
//         `,
//   })
//   console.log(pev)
//   const dms = nodemailer.getTestMessageUrl(pev);
//   console.log({dms})
// }
// }

export default emailTransporter

export const getEmailTransporter = () => {
  if (!emailTransporter) {
    throw new Error('Email transporter not initialized. Call createEmailTransporter first.');
  }
  return emailTransporter;
};
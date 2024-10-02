const nodemailer = require('nodemailer');
const cron = require('node-cron');
const express = require('express');
const app = express();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'syedatheralikazmi@gmail.com',
    pass: 'smoj vdyo rkgf qequ'
  }
}); //SMTP

const recipients = [
  { username: "Ali Haider", email: "haider.ayaz9090@gmail.com" },

];

let openedEmails = new Set();
let emailsSentToday = 0;
let emailsAlreadySent = new Set();  
let currentRecipientIndex = 0; 
const MAX_EMAILS_PER_DAY = 100;
let lastSentDate = new Date().toISOString().split('T')[0];



const resetEmailCountIfNewDay = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  if (currentDate !== lastSentDate) {
    lastSentDate = currentDate;
    emailsSentToday = 0;
    console.log('New day, email count reset.');
  }
};

const sendEmailToRecipient = async (recipient) => {
  const { email, username } = recipient;


  if (emailsAlreadySent.has(email)) {
    console.log(`Email already sent to ${email}, skipping.`);
    return;
  }

  const mailOptions = {
    from: `"Syed Ather" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "4 Simple Steps to Grow Your Coaching Business",
    html: `
      <html>
      <body style="font-family: 'Arial', sans-serif; color: #333; background-color: #f0f0f0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">4 Simple Steps to Grow Your Coaching Business</h2>
          <p style="color: #34495e; font-size: 16px;">Hi <strong>${username}</strong>,</p>
          <p style="color: #34495e; font-size: 16px;">I hope you're doing well! I wanted to share <strong>4 super simple and GUARANTEED steps</strong> that can help you attract more clients and boost your coaching business in the next <strong>30 days</strong>.</p>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #27ae60; font-size: 20px; margin-bottom: 10px;">Step 1:</h3>
            <ul style="color: #2c3e50; font-size: 16px; list-style-type: none; padding-left: 0;">
              <li style="margin-bottom: 10px;"><span style="color: #e74c3c;">✔</span> Improve your website’s SEO to attract more traffic.</li>
              <li style="margin-bottom: 10px;"><span style="color: #e74c3c;">✔</span> Create engaging content on Instagram and TikTok, like reels that speak directly to your audience.</li>
              <li style="margin-bottom: 10px;"><span style="color: #e74c3c;">✔</span> Optimize your LinkedIn profile to reach potential clients who need coaching.</li>
              <li><span style="color: #e74c3c;">✔</span> Build a community with regular updates to keep your followers engaged.</li>
            </ul>
          </div>

          <p style="color: #34495e; font-size: 16px;">If you'd prefer to focus on coaching and leave these tasks to an expert, I'm happy to take care of one of them for you—completely free!</p>

          <p style="color: #34495e; font-size: 16px;">Looking forward to hearing from you.<br/><strong>Thanks,<br/>Syed</strong></p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${email}`);
    emailsAlreadySent.add(email); 
    currentRecipientIndex++;  
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


const sendEmailsWithDelay = async () => {
  resetEmailCountIfNewDay();


  if (currentRecipientIndex >= recipients.length) {
    console.log('All recipients have received an email. Stopping further email sending.');
    return;
  }

  const recipient = recipients[currentRecipientIndex];

  if (emailsSentToday >= MAX_EMAILS_PER_DAY) {
    console.log('Email sending limit reached for today.');
    return;
  }


  await sendEmailToRecipient(recipient);
  emailsSentToday++;

  console.log(`Total emails sent today: ${emailsSentToday}`);

  await delay(10 * 60 * 1000); // 10 minutes 

 
  await sendEmailsWithDelay();
};

cron.schedule('*/45 * * * *', async () => {
  await sendEmailsWithDelay();
  console.log('Scheduled email sending completed.');
});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

sendEmailsWithDelay().then(() => {
  console.log('Initial email sending started.');
});

console.log('Email automation script running. Emails will be sent every 10 minutes between recipients.');

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

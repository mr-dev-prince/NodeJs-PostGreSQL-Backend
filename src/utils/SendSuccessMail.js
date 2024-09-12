import nodemailer from "nodemailer";

export const SendSuccessMail = async (
  username,
  email,
  successMessage,
  subject
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: "princechaurasiaofficial24@gmail.com",
      pass: "jdusxkabqywnoghj",
    },
  });

  const mailOptions = {
    from: "princechaurasiaofficial24@gmail.com",
    to: email,
    subject: `${subject} : Journey Journals`,
    html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            text-align: center;
          }
          .content h1 {
            color: #333333;
            margin-bottom: 20px;
          }
          .content p {
            color: #555555;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #888888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://via.placeholder.com/150" alt="Your App Logo">
          </div>
          <div class="content">
            <h1>${subject}</h1>
            <p>Hi ${username},</p>
            <p>${successMessage}</p>
            <p>If its not you, for now we don't have functionality to report :(</p>
            <p>Sorry for that :(</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Journey Journals. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send mail", err);
    throw new Error(`Failed to send ${subject} mail`, err);
  }
};

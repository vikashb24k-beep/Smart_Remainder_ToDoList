const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTaskReminderEmail({ to, name, title }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Reminder: Task Due",
    text: `Hey ${name}, it's time to: ${title}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendTaskReminderEmail,
};

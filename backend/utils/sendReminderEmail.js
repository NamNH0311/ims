// const sendReminderEmail = async (interview) => {
//   // Fetch the interviewer's details
//   const interviewer = await User.findById(interview.interviewer);
//   if (!interviewer) {
//     console.error("Interviewer not found");
//     return;
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: interviewer.email, // Use the interviewer's email
//     subject: "Interview Reminder",
//     text: `Dear ${interviewer.fullname},\n\nThis is a reminder that you have an interview scheduled with ${interview.candidate} in 30 minutes.\n\nBest regards,\nYour Company`,
//   };

//   await transporter.sendMail(mailOptions);
// };


// module.exports = sendReminderEmail;

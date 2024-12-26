// const cron = require("node-cron");
// const sendReminderEmail = require("./sendReminderEmail"); // Adjust the path as needed
// const { Interview } = require("../models");

// const scheduleReminders = () => {
//   // Check for upcoming interviews every minute
//   cron.schedule("* * * * *", async () => {
//     // Correctly using cron.schedule
//     const now = new Date();

//     // Find interviews that are starting in the next 30 minutes
//     const interviews = await Interview.find({
//       interview_date: {
//         $gte: new Date(now.getTime() + 30 * 60000), // 30 minutes from now
//         $lt: new Date(now.getTime() + 31 * 60000), // Just after 30 minutes
//       },
//     }).populate("interviewer", "fullname email"); // Populate the interviewer to get their email

//     for (const interview of interviews) {
//       await sendReminderEmail(interview);
//     }
//   });
// };

// module.exports = scheduleReminders;

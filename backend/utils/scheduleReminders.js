const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const Interview = require("../models/interview.model");

class ReminderService {
  constructor() {
    // Initialize with null transporter - will be created when needed
    this.transporter = null;
    this.scheduledJobs = new Map();
    this.isInitialized = false;
  }

  async initializeTransporter() {
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials are not properly configured in environment variables"
      );
    }

    try {
      // Create transporter with Gmail OAuth2 configuration
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // This should be an App Password for Gmail
        },
        tls: {
          rejectUnauthorized: true, // Enable strict security
        },
      });

      // Verify transporter configuration
      await this.transporter.verify();
      console.log("Email transporter initialized successfully");
    } catch (error) {
      console.error("Failed to initialize email transporter:", error);
      throw error;
    }
  }

  async sendReminderEmail(interview) {
    if (!this.transporter) {
      await this.initializeTransporter();
    }

    if (!interview.interviewer?.email) {
      throw new Error(
        `No interviewer email found for interview: ${interview._id}`
      );
    }

    const emailContent = {
      from: {
        name: "HR Team",
        address: process.env.EMAIL_USER,
      },
      to: interview.interviewer.email,
      subject: "Interview Reminder - Starting in 30 minutes",
      html: `
        <h2>Interview Reminder</h2>
        <p>Hello ${interview.interviewer.fullname || "Interviewer"},</p>
        <p>This is a reminder that you have an interview scheduled in 30 minutes.</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Date: ${new Date(interview.interview_date).toLocaleString()}</li>
          <li>Meeting Link: ${interview.meeting_link || "Not provided"}</li>
          <li>Candidate: ${
            interview.candidate ? interview.candidate.fullname : "Not specified"
          }</li>
          <li>Job Position: ${
            interview.job ? interview.job.title : "Not specified"
          }</li>
        </ul>
        <p>Please ensure you're prepared and have a stable internet connection for the meeting.</p>
        <p>Best regards,<br>HR Team</p>
      `,
      text:
        `Interview Reminder\n\nHello ${
          interview.interviewer.fullname || "Interviewer"
        },\n\n` +
        `This is a reminder that you have an interview scheduled in 30 minutes.\n\n` +
        `Interview Details:\n` +
        `Date: ${new Date(interview.interview_date).toLocaleString()}\n` +
        `Meeting Link: ${interview.meeting_link || "Not provided"}\n` +
        `Candidate: ${
          interview.candidate ? interview.candidate.fullname : "Not specified"
        }\n` +
        `Job Position: ${
          interview.job ? interview.job.title : "Not specified"
        }\n\n` +
        `Please ensure you're prepared and have a stable internet connection for the meeting.\n\n` +
        `Best regards,\nHR Team`,
    };

    try {
      const info = await this.transporter.sendMail(emailContent);
      console.log(
        `Reminder email sent for interview ${interview._id} to ${interview.interviewer.email}. MessageId: ${info.messageId}`
      );
      return info;
    } catch (error) {
      console.error(
        `Failed to send reminder email to ${interview.interviewer.email}:`,
        error
      );
      // Reset transporter on authentication errors to force re-initialization
      if (error.code === "EAUTH") {
        this.transporter = null;
      }
      throw error;
    }
  }

  async scheduleReminder(interview) {
    try {
      const reminderTime = new Date(interview.interview_date);
      reminderTime.setMinutes(reminderTime.getMinutes() - 30); // Set to 30 minutes before
      console.log(
        `Reminder time for interview ${
          interview._id
        }: ${reminderTime.toLocaleString()}`
      );

      // Only schedule if the reminder time is in the future
      if (reminderTime > new Date()) {
        // Cancel existing reminder if any
        if (this.scheduledJobs.has(interview._id.toString())) {
          this.scheduledJobs.get(interview._id.toString()).cancel();
          console.log(
            `Cancelled existing reminder for interview ${interview._id}`
          );
        }

        // Schedule new reminder
        const job = schedule.scheduleJob(reminderTime, async () => {
          try {
            // Fetch fresh interview data with populated fields
            const freshInterview = await Interview.findById(interview._id)
              .populate("interviewer")
              .populate("candidate")
              .populate("job");

            if (!freshInterview) {
              console.log("Interview not found for ID:", interview._id);
            } else {
              await this.sendReminderEmail(freshInterview);
            }

            // Remove the job from tracking after execution
            this.scheduledJobs.delete(interview._id.toString());
            console.log(`Removed scheduled job for interview ${interview._id}`);
          } catch (error) {
            console.error("Error processing interview reminder:", error);
          }
        });

        this.scheduledJobs.set(interview._id.toString(), job);
        console.log(
          `Scheduled reminder for interview ${
            interview._id
          } at ${reminderTime.toLocaleString()}`
        );
      } else {
        console.log(
          `Reminder time for interview ${interview._id} is in the past, not scheduling.`
        );
      }
    } catch (error) {
      console.error("Error scheduling reminder:", error);
    }
  }

  async initializeReminders() {
    if (this.isInitialized) {
      console.log("Reminder service already initialized.");
      return;
    }

    try {
      console.log("Initializing interview reminders...");

      // Get current time and the time 30 minutes from now
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000); // Add 30 minutes

      // Find interviews starting within the next 30 minutes
      const upcomingInterviews = await Interview.find({
        interview_date: { $gt: now, $lt: thirtyMinutesFromNow }, // Only those starting in the next 30 minutes
        result: { $in: ["N/A", null] }, // Only for interviews not yet completed
      })
        .populate("interviewer")
        .populate("candidate")
        .populate("job");

      console.log(
        `Found ${upcomingInterviews.length} interviews starting in the next 30 minutes:`,
        upcomingInterviews.map((interview) =>
          interview.interview_date.toLocaleString()
        )
      );

      // console.log("Email User:", process.env.EMAIL_USER);
      // console.log("Email Pass:", process.env.EMAIL_PASS ? "****" : "Not Set");
      // Schedule reminders for each upcoming interview
      for (const interview of upcomingInterviews) {
        console.log(`Scheduling reminder for interview ${interview._id}`);
        await this.scheduleReminder(interview);
      }

      // Set up a daily check for new interviews
      schedule.scheduleJob("0 0 * * *", async () => {
        console.log("Daily reminder check is running...");
        await this.checkAndScheduleNewReminders();
      });

      this.isInitialized = true;
      console.log("Interview reminder system initialized successfully");
    } catch (error) {
      console.error("Error initializing reminder system:", error);
      throw error;
    }
  }

  async checkAndScheduleNewReminders() {
    try {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);

      const upcomingInterviews = await Interview.find({
        interview_date: {
          $gt: new Date(),
          $lt: nextDay,
        },
        result: { $in: ["N/A", null] },
      })
        .populate("interviewer")
        .populate("candidate")
        .populate("job");

      for (const interview of upcomingInterviews) {
        if (!this.scheduledJobs.has(interview._id.toString())) {
          console.log(`New interview found for scheduling: ${interview._id}`);
          await this.scheduleReminder(interview);
        } else {
          console.log(`Interview ${interview._id} is already scheduled.`);
        }
      }
    } catch (error) {
      console.error("Error in daily reminder check:", error);
    }
  }

  cancelReminder(interviewId) {
    if (this.scheduledJobs.has(interviewId)) {
      this.scheduledJobs.get(interviewId).cancel();
      this.scheduledJobs.delete(interviewId);
      console.log(`Cancelled reminder for interview ${interviewId}`);
    }
  }
}

// Create and export a singleton instance
const reminderService = new ReminderService();
module.exports = reminderService;

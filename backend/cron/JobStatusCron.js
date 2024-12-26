const cron = require("node-cron");
const Job = require("../models/job.model");
const Status = require("../models/status.model");

cron.schedule("0 0 * * *", async () => {
  try {
    const closedStatus = await Status.findOne({ name: "closed" });
    if (!closedStatus) {
      console.error("Closed status not found");
      return;
    }

    const currentDate = new Date();

    await Job.updateMany(
      { end_date: { $lt: currentDate } },
      { status: closedStatus._id, updatedAt: new Date() }
    );

    console.log("Job statuses updated to 'closed' where necessary.");
  } catch (error) {
    console.error("Error updating job statuses:", error);
  }
});

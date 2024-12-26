const Job = require("../models/job.model");
const Status = require("../models/status.model");
const mongoose = require("mongoose");
const cron = require("node-cron");

// Get all jobs
async function getAllIJob(req, res, next) {
  const { page = 1, limit = 5 } = req.query;

  try {
    const jobs = await Job.find()
      .populate("createdBy")
      .populate("status")
      .skip((page - 1) * limit) 
      .limit(parseInt(limit)); 

    const totalJobs = await Job.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      jobs,
      totalJobs,
      // pagination: {
      //   totalJobs,
      //   totalPages,
      //   currentPage: parseInt(page),
      //   jobsPerPage: parseInt(limit),
      // },
    });
  } catch (err) {
    next(err);
  }
}

async function getJobList(req, res, next) {
  try {
    const jobs = await Job.find().populate("createdBy").populate("status");
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
}

// get job by role

async function getJobs(req, res, next) {
  try {
    const { role, userId, statusFilter, workingType, search } = req.query;
    const { page = 1, limit = 5 } = req.query;
    console.log("role", role);

    const openStatusId = await Status.findById("671c7baa265bb9e80b7d4736");
    const closedStatusId = await Status.findById("671c7baa265bb9e80b7d4738");
    const waitingForApprovalId = await Status.findById(
      "671c7ab3265bb9e80b7d4726"
    );

    let filter = {};

    if (role === "Recruiter" || role === "Interviewer") {
      // Recruiters and Interviewers can view only open and closed jobs
      filter.status = { $in: [openStatusId, closedStatusId] };
    } else if (role === "Manager") {
      // Managers can view their own 'waiting for approval' jobs + 'open' & 'closed'
      filter = {
        $or: [
          { status: { $in: [openStatusId, closedStatusId] } },
          { status: waitingForApprovalId, createdBy: userId },
        ],
      };
    } else if (role === "Admin" || role === "Accountant") {
      // Admin and Accountant can view all jobs
      filter = {};
    }

    if (statusFilter) {
      const statusConditions = {
        opened: openStatusId,
        closed: closedStatusId,
        waiting: waitingForApprovalId,
      };
      const specificStatus = statusConditions[statusFilter];
      if (specificStatus) {
        if (filter.status && Array.isArray(filter.status.$in)) {
          if (filter.status.$in.includes(specificStatus)) {
            filter.status = specificStatus;
          }
        } else {
          filter.status = specificStatus;
        }
      }
    }

    if (workingType) {
      filter.working_type = workingType;
    }

    if (search) {
      filter.job_name = { $regex: search, $options: "i" };
    }

    const jobs = await Job.find(filter)
      .populate("createdBy")
      .populate("status")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({ jobs, totalJobs });
  } catch (err) {
    next(err);
  }
}

// Add new job
async function addJob(req, res, next) {
  // const { role } = req.user;
  // if (role !== "manager") {
  //   return res.status(403).json({ message: "Only managers can add new jobs." });
  // }

  try {
    const waitingStatus = await Status.findById("671c7ab3265bb9e80b7d4726");
    if (!waitingStatus) {
      return res
        .status(500)
        .json({ message: "Waiting for approved status not found" });
    }

    const {
      job_name,
      salary_max,
      salary_min,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
    } = req.body;

    const errors = {};

    // Basic field validation
    if (!job_name) errors.job_name = "Job Title is required";
    if (!salary_max) errors.salary_max = "Max Salary is required";
    if (!salary_min) errors.salary_min = "Min Salary is required";
    if (!start_date) errors.start_date = "Start Date is required";
    if (!end_date) errors.end_date = "End Date is required";
    if (!levels) errors.levels = "Level is required";
    if (!skills || skills.length === 0)
      errors.skills = "At least one skill is required";
    if (!working_type) errors.working_type = "Working Type is required";
    if (!experience) errors.experience = "Experience is required";
    if (!number_of_vacancies)
      errors.number_of_vacancies = "Number of Vacancies is required";

    // Additional validations
    if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
      errors.salary_max = "Max Salary should be greater than Min Salary";
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      errors.end_date = "End Date should be after Start Date";
    }

    if (experience && !/(\byear\b|\bmonth\b|\byears\b|\bmonths\b)/i.test(experience)) {
      errors.experience = "Experience should include 'year' or 'month'";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const startDate = new Date(start_date);

    if (start_date && startDate < today) {
      errors.start_date = "Start Date should be today or later";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation errors", errors });
    }

    if (
      !job_name ||
      !salary_max ||
      !salary_min ||
      !start_date ||
      !end_date ||
      !levels ||
      !skills ||
      !working_type ||
      !experience ||
      !number_of_vacancies
      // !description ||
      // !createdBy
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const jobData = {
      job_name,
      salary_max,
      salary_min,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
      status: waitingStatus._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newJob = new Job(jobData);
    await newJob.save();

    res.status(201).json({
      message: "Job created and set to 'waiting for approval'",
      job: newJob,
    });
  } catch (err) {
    next(err);
  }
}

async function openJob(req, res, next) {
  // const { role } = req.user; 
  const { jobId } = req.params;

  // Check if the user is an accountant
  // if (role !== "accountant") {
  //   return res.status(403).json({ message: "Only accountants can open jobs." });
  // }

  try {
    const job = await Job.findById(jobId).populate("status");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const openStatus = await Status.findOne({ name: "open" });
    if (!openStatus)
      return res.status(500).json({ message: "Open status not found" });

    job.status = openStatus._id;
    await job.save();

    res.status(200).json({ message: "Job status changed to open", job });
  } catch (error) {
    res.status(400).json({ message: "Failed to open job", error });
  }
}

// Close job
async function closeJob(req, res, next) {
  // const { role } = req.user;
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate("status");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const closedStatus = await Status.findOne({ name: "closed" });
    const openStatus = await Status.findOne({ name: "open" });
    const waitingStatus = await Status.findOne({
      name: "waiting for approved",
    });

    if (!closedStatus || !openStatus || !waitingStatus) {
      return res.status(500).json({ message: "Required statuses not found" });
    }

    // Check permissions based on role and current job status
    // if (role === "accountant" && job.status.toString() !== waitingStatus._id.toString()) {
    //   return res.status(403).json({ message: "Accountant can only close jobs with 'waiting for approved' status" });
    // }

    // Change job status to closed
    job.status = closedStatus._id;
    await job.save();

    res.status(200).json({ message: "Job status changed to closed", job });
  } catch (error) {
    res.status(400).json({ message: "Failed to close job", error });
  }
}

// Update a job
async function updateJob(req, res, next) {
  const { jobId } = req.params;
  const {
    job_name,
    salary_min,
    salary_max,
    start_date,
    end_date,
    levels,
    skills,
    working_type,
    experience,
    number_of_vacancies,
    benefits,
    description,
    createdBy,
  } = req.body;

  const errors = {};

    // Basic field validation
    if (!job_name) errors.job_name = "Job Title is required";
    if (!salary_max) errors.salary_max = "Max Salary is required";
    if (!salary_min) errors.salary_min = "Min Salary is required";
    if (!start_date) errors.start_date = "Start Date is required";
    if (!end_date) errors.end_date = "End Date is required";
    if (!levels) errors.levels = "Level is required";
    if (!skills || skills.length === 0)
      errors.skills = "At least one skill is required";
    if (!working_type) errors.working_type = "Working Type is required";
    if (!experience) errors.experience = "Experience is required";
    if (!number_of_vacancies)
      errors.number_of_vacancies = "Number of Vacancies is required";

    // Additional validations
    if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
      errors.salary_max = "Max Salary should be greater than Min Salary";
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      errors.end_date = "End Date should be after Start Date";
    }

    if (experience && !/(\byear\b|\bmonth\b|\byears\b|\bmonths\b)/i.test(experience)) {
      errors.experience = "Experience should include 'year' or 'month'";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const startDate = new Date(start_date);

    if (start_date && startDate < today) {
      errors.start_date = "Start Date should be today or later";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation errors", errors });
    }

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const waitingStatus = await Status.findById("671c7ab3265bb9e80b7d4726");
    if (!waitingStatus)
      return res.status(500).json({ message: "Status not found" });

    if (job.status.toString() !== waitingStatus._id.toString()) {
      return res.status(403).json({
        message:
          "Job can only be updated when status is 'waiting for approved'",
      });
    }

    if (
      !job_name ||
      !salary_min ||
      !salary_max ||
      !start_date ||
      !end_date ||
      !levels ||
      !skills ||
      !working_type ||
      !experience ||
      !number_of_vacancies
      // !description ||
      // !createdBy
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const updatedJob = job.set({
      job_name,
      salary_min,
      salary_max,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
      updatedAt: new Date(),
    });

    await job.save();

    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    next(err);
  }
}

// Delete job
async function deleteJob(req, res, next) {
  const { jobId } = req.params;

  try {
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// Get job by ID
async function getJobById(req, res, next) {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId)
      .populate("createdBy")
      .populate("status");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}


const jobController = {
  getAllIJob,
  getJobs,
  addJob,
  openJob,
  closeJob,
  updateJob,
  deleteJob,
  getJobById,
  getJobList,
};

module.exports = jobController;

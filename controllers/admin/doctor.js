const bcrypt = require("bcrypt");

const { adminModel } = require("../../models/admin");
const { doctorModel } = require("../../models/doctor");
const mongoose = require('mongoose');
const moment = require("moment-timezone");


// const addDoctor = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       age,
//       gender,
//       email,
//       mobile,
//       specialization,
//       experience,
//       qualifications,
//       license,
//       schedule,
//       username,
//       password,
//       about,
//       status,
//       timeZone, // <-- Ensure timeZone is received
//     } = req.body;

//     if (!firstName || !lastName || !gender || !email || !mobile || !username) {
//       return res.status(400).json({
//         status: false,
//         message: "All fields are required",
//         desc: "Please fill all required fields",
//       });
//     }

//     if (!timeZone || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
//       return res.status(400).json({
//         status: false,
//         message: "Timezone is required",
//         desc: "Please select a valid timezone.",
//       });
//     }

//     // Check for duplicate email or username
//     const existingUser = await doctorModel.findOne({
//       $or: [{ email: email }, { username: username }],
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         status: false,
//         message: "Email or username already exists.",
//         desc: "Please use a different email or username.",
//       });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     // Default schedule format
//     const parsedSchedule = schedule || {
//       sun: { start: "", end: "" },
//       mon: { start: "", end: "" },
//       tue: { start: "", end: "" },
//       wed: { start: "", end: "" },
//       thu: { start: "", end: "" },
//       fri: { start: "", end: "" },
//       sat: { start: "", end: "" },
//     };

//     // Create the doctor
//     const user = new doctorModel({
//       firstName,
//       lastName,
//       age,
//       gender,
//       email,
//       mobile,
//       specialization,
//       experience,
//       qualifications,
//       license,
//       schedule: parsedSchedule,
//       about,
//       username,
//       status,
//       timeZone, // <-- Ensure it is stored
//       password: hashedPassword,
//     });

//     await user.save();
//     return res.status(201).json({
//       status: true,
//       message: "Doctor created successfully",
//       doctorId: user._id,
//       desc: "Doctor profile has been created successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Failed to create doctor",
//       error: error.message,
//       desc: "Oops! Something went wrong. Please try again later.",
//     });
//   }
// };

const addDoctor = async (req, res) => {
  try {
    const {
      firstName, lastName, age, gender, email, mobile, specialization,
      experience, qualifications, license, schedule, username, password,
      about, status, timeZone, slotDuration // New field
    } = req.body;

    if (!firstName || !lastName || !gender || !email || !mobile || !username || !password || !slotDuration) {
      return res.status(400).json({ status: false, message: "All fields are required", desc: "Please fill all required fields" });
    }

    const existingUser = await doctorModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ status: false, message: "Email or username already exists", desc: "Please use a different email or username." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parsedSchedule = schedule || { sun: { start: "", end: "" }, mon: { start: "", end: "" }, tue: { start: "", end: "" }, wed: { start: "", end: "" }, thu: { start: "", end: "" }, fri: { start: "", end: "" }, sat: { start: "", end: "" } };

    const user = new doctorModel({
      firstName, lastName, age, gender, email, mobile, specialization, experience,
      qualifications, license, schedule: parsedSchedule, about, username, status, timeZone,
      slotDuration, password: hashedPassword
    });

    await user.save();
    return res.status(201).json({ status: true, message: "Doctor created successfully", doctorId: user._id, desc: "Doctor profile has been created successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to create doctor", error: error.message, desc: "Oops! Something went wrong." });
  }
};

const addAdmin = async (req, res) => {
  const { firstname, lastname, email, username, password } = req.body;
  try {
    const emailUsernameExist = await adminModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (emailUsernameExist) {
      return res.status(500).json({
        status: false,
        message: "Email or username already exist",
        desc: "Please try a different email or username",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await adminModel.create({
      first_name: firstname,
      last_name: lastname,
      email,
      username,
      password: hashedPassword,
    });
    return res.status(500).json({
      status: false,
      message: "Admin created",
      desc: "new admin created successfull",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message, desc: "Internal Error" });
  }
};


const getSingleDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params; // Get the doctor ID from request params

    // Find the doctor by ID and populate the specialization field with department details
    const doctor = await doctorModel.findById(doctorId).populate("specialization", "department");

    // Check if the doctor exists
    if (!doctor) {
      return res.status(404).json({
        status: false,
        message: "Doctor not found",
        desc: "The doctor with the provided ID does not exist.",
      });
    }

    // Return the doctor details
    return res.status(200).json({
      status: true,
      message: "Doctor found successfully",
      doctor,
      desc: "Doctor details fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve doctor details",
      error: error.message,
      desc: "Oops! Something went wrong. Please try again later.",
    });
  }
};




const getAllDoctors = async (req, res) => {
  try {
    // Optional: Pagination query parameters (page, limit)
    const { page = 1, limit = 10 } = req.query;

    // Calculate the skip and limit for pagination
    const skip = (page - 1) * limit;
    const doctors = await doctorModel
      .find()
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Count the total number of doctors for pagination info
    const totalDoctors = await doctorModel.countDocuments();

    // Return the doctors and pagination info
    return res.status(200).json({
      message: "Doctors retrieved successfully",
      doctors,
      pagination: {
        totalDoctors,
        currentPage: page,
        totalPages: Math.ceil(totalDoctors / limit),
      },
      status: true,
      desc: "List of doctors fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    return res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
      status: false,
      desc: "Oops! Something went wrong. Please try again later.",
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Find the doctor by ID and remove it
    const doctor = await doctorModel.findByIdAndDelete(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found",staus:"false", desc: "No doctor found with the provided ID" });
    }

    // Return success response
    res.status(200).json({ status: true,message: "Doctor deleted successfully", desc: "Doctor has been deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ staus: false,message: "Failed to delete doctor", desc: "Error deleting doctor" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    // Find the doctor by ID
    const doctor = await doctorModel.findById(doctorId);
    doctor.password = "**********";

    if (!doctor) {
      return res.status(404).json({
        status: false,
        message: "Doctor not found",
        desc: "No doctor found with the provided ID",
      });
    }

    // Return the doctor details
    return res.status(200).json({
      status: true,
      message: "Doctor retrieved successfully",
      doctor,
      desc: "Doctor details fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching doctor:", error.message);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch doctor",
      error: error.message,
      desc: "Oops! Something went wrong. Please try again later.",
    });
  }
};






// const editDoctor = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { timeZone, schedule, ...updatedData } = req.body;

//     // Ensure schedule exists before processing
//     if (!schedule) {
//       return res.status(400).json({ status: false, message: "Schedule is required" });
//     }

//     // Convert all schedule times to UTC
//     const convertedSchedule = {};
//     Object.keys(schedule).forEach((day) => {
//       if (schedule[day].start && schedule[day].end) {
//         convertedSchedule[day] = {
//           start: moment.tz(schedule[day].start, "HH:mm", timeZone).utc().format("HH:mm"),
//           end: moment.tz(schedule[day].end, "HH:mm", timeZone).utc().format("HH:mm"),
//         };
//       } else {
//         convertedSchedule[day] = { start: "", end: "" };
//       }
//     });

//     const updatedDoctor = await doctorModel.findByIdAndUpdate(
//       doctorId,
//       { ...updatedData, timeZone, schedule: convertedSchedule },
//       { new: true }
//     );

//     res.json({
//       status: true,
//       doctor: updatedDoctor,
//       message: "Doctor updated successfully.",
//     });
//   } catch (error) {
//     console.error("Error updating doctor:", error);
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// };







// const editDoctor = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { timeZone, schedule, ...updatedData } = req.body;

//     // Ensure schedule exists before processing
//     if (!schedule) {
//       return res.status(400).json({ status: false, message: "Schedule is required" });
//     }

//     // Store the time as it is, without UTC conversion
//     const updatedSchedule = {};
//     Object.keys(schedule).forEach((day) => {
//       updatedSchedule[day] = {
//         start: schedule[day].start || "", // Store the time directly
//         end: schedule[day].end || "",
//       };
//     });

//     const updatedDoctor = await doctorModel.findByIdAndUpdate(
//       doctorId,
//       { ...updatedData, timeZone, schedule: updatedSchedule }, // Store schedule without conversion
//       { new: true }
//     );

//     res.json({
//       status: true,
//       doctor: updatedDoctor,
//       message: "Doctor updated successfully.",
//     });
//   } catch (error) {
//     console.error("Error updating doctor:", error);
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// };














// const editDoctor = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { timeZone, schedule,slotDuration , ...updatedData } = req.body;

//     // Validate if timeZone is provided
//     if (!timeZone) {
//       return res.status(400).json({ status: false, message: "TimeZone is required" });
//     }

//     // Validate if schedule exists and is properly formatted
//     if (!schedule || typeof schedule !== "object") {
//       return res.status(400).json({ status: false, message: "Valid schedule is required" });
//     }

//     // Process schedule without time conversion
//     const updatedSchedule = {};
//     Object.keys(schedule).forEach((day) => {
//       updatedSchedule[day] = {
//         start: schedule[day]?.start || "", // Store time as received
//         end: schedule[day]?.end || "",
//       };
//     });

//     // Update doctor details
//     const updatedDoctor = await doctorModel.findByIdAndUpdate(
//       doctorId,
//       { ...updatedData, timeZone, schedule: updatedSchedule, slotDuration  }, // Store schedule & timeZone as entered
//       { new: true }
//     );

//     if (!updatedDoctor) {
//       return res.status(404).json({ status: false, message: "Doctor not found" });
//     }

//     res.json({
//       status: true,
//       doctor: updatedDoctor,
//       message: "Doctor updated successfully.",
//     });
//   } catch (error) {
//     console.error("Error updating doctor:", error);
//     res.status(500).json({ status: false, message: "Server error", error: error.message });
//   }
// };


const editDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { schedule, ...updatedData } = req.body;

    // Ensure schedule is properly formatted as an array of slots per day
    const updatedSchedule = {};
    Object.keys(schedule).forEach((day) => {
      updatedSchedule[day] = Array.isArray(schedule[day])
        ? schedule[day].map(slot => ({
            start: slot.start || "",
            end: slot.end || "",
          }))
        : [];
    });

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { ...updatedData, schedule: updatedSchedule },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ status: false, message: "Doctor not found" });
    }

    res.json({ status: true, doctor: updatedDoctor, message: "Doctor updated successfully." });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};



module.exports = {
  addDoctor,
  addAdmin,
  getAllDoctors,
  deleteDoctor,
  getDoctorById,
  editDoctor, getSingleDoctor
};

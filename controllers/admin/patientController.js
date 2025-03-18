const { appointmentModel } = require("../../models/appointmentModel");
const { doctorModel } = require("../../models/doctor");
const { patientModel } = require("../../models/patient");
const bcrypt = require("bcrypt");
const moment =require ("moment-timezone");

const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// const addPatient = async (req, res) => {
//   try {
//     const {
//       first_name,
//       last_name,
//       gender,
//       age,
//       blood_group,
//       treatment,
//       mobile,
//       email,
//       address,
//       password,
//     } = req.body;

//     // Validate required fields
//     if (
//       !first_name ||
//       !last_name ||
//       !gender ||
//       !age ||
//       !blood_group ||
//       !treatment ||
//       !mobile ||
//       !email ||
//       !address ||
//       !password
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);
//     // Create a new patient
//     const patient = new patientModel({
//       first_name,
//       last_name,
//       gender,
//       age,
//       blood_group,
//       treatment,
//       mobile,
//       email,
//       address,
//       password: hashPassword,
//     });

//     await patient.save();
//     res.status(201).json({
//       status: true,
//       message: "Patient created successfully",
//       desc: "Patient Created Successfully",
//       tittle: "Success",
//       data: patient,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         status: false,
//         message: "Email or mobile number already exists",
//         desc: error.message,
//       });
//     }
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       desc: "Internal Server Error",
//     });
//   }
// };

// echo


// const addPatient = async (req, res) => {
//   try {
//     const {
//       first_name,
//       last_name,
//       gender,
//       age,
//       blood_group,
//       treatment,
//       mobile,
//       email,
//       address,
//       state,
//       postal_code,
//       password,
//     } = req.body;

//     // Validate required fields
//     if (
//       !first_name ||
//       !last_name ||
//       !gender ||
//       !age ||
//       !blood_group ||
//       !treatment ||
//       !mobile ||
//       !email ||
//       !address ||
//       !state ||
//       !postal_code ||
//       !password
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);
//     // Create a new patient
//     const patient = new patientModel({
//       first_name,
//       last_name,
//       gender,
//       age,
//       blood_group,
//       treatment,
//       mobile,
//       email,
//       address,
//       state,
//       postal_code,
//       password: hashPassword,
//     });

//     await patient.save();
//     res.status(201).json({
//       status: true,
//       message: "Patient created successfully",
//       desc: "Patient Created Successfully",
//       tittle: "Success",
//       data: patient,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         status: false,
//         message: "Email or mobile number already exists",
//         desc: error.message,
//       });
//     }
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       desc: "Internal Server Error",
//     });
//   }
// };


const addPatient = async (req, res) => {
  try {
    const {
      first_name, last_name, gender, age, blood_group, treatment, mobile, email, 
      address, state, postal_code, password, doctor
    } = req.body;

    if (!first_name || !last_name || !gender || !age || !blood_group || !treatment || 
        !mobile || !email || !address || !state || !postal_code || !password || !doctor) {
      return res.status(400).json({ message: "All fields are required, including doctor" });
    }

    // Verify doctor exists
    const existingDoctor = await doctorModel.findById(doctor);
    if (!existingDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const patient = new patientModel({
      first_name, last_name, gender, age, blood_group, treatment, mobile, email,
      address, state, postal_code, password: hashPassword, doctor,
    });

    await patient.save();
    res.status(201).json({ status: true, message: "Patient added successfully", data: patient });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the patient
    const deletedPatient = await patientModel.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    // If password is being updated, hash it
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    // Find and update the patient
    const updatedPatient = await patientModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const getAllPatient = async (req, res) => {
//   try {
//     const patients = await patientModel.find();
//     res.status(200).json({
//       message: "Patients retrieved successfully",
//       data: patients,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



const getAllPatient = async (req, res) => {
  try {
    const patients = await patientModel.find().populate("doctor", "firstName lastName email specialization");
    res.status(200).json({ message: "Patients retrieved successfully", data: patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getSinglePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await patientModel.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getAllPatientFilterByDoctor = async (req, res) => {
  try {
    const { doctorId, page = 1, limit = 10 } = req.query; // Get query parameters with defaults

    let filter = {};
    if (doctorId) {
      filter.doctor = doctorId; // Filter patients by doctor ID if provided
    }

    const patients = await patientModel
      .find(filter)
      .populate("doctor", "firstName lastName email specialization")
      .skip((page - 1) * limit) // Skip patients for pagination
      .limit(Number(limit)); // Limit results per page

    const totalPatients = await patientModel.countDocuments(filter); // Get total count

    res.status(200).json({
      message: "Patients retrieved successfully",
       patients,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalPatients / limit),
        totalPatients,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePatientByDoctor = async (req, res) => {
  try {
    const { doctorId, patientId } = req.query; // Get doctor and patient IDs from query params

    if (!doctorId || !patientId) {
      return res.status(400).json({ message: "Doctor ID and Patient ID are required" });
    }

    // Find the patient and ensure they belong to the requesting doctor
    const patient = await patientModel.findOne({ _id: patientId, doctor: doctorId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found or does not belong to this doctor" });
    }

    // Delete the patient
    await patientModel.deleteOne({ _id: patientId });

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const editPatientByDoctor = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params; // Get doctor & patient ID from params
    const updatedData = req.body; // Get updated patient details

    if (!doctorId || !patientId) {
      return res.status(400).json({ message: "Doctor ID and Patient ID are required" });
    }

    // Check if the patient exists and belongs to the doctor
    const patient = await patientModel.findOne({ _id: patientId, doctor: doctorId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found or does not belong to this doctor" });
    }

    // Update patient details
    const updatedPatient = await patientModel.findByIdAndUpdate(patientId, updatedData, { new: true });

    res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getSinglePatientByDoctor = async (req, res) => {
  try {
    const { patientId } = req.params; // Extract patient ID from request parameters

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await patientModel.findById(patientId).populate("doctor", "first_name last_name email");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllDoctorsByPatient = async (req, res) => {
  try {
    // Optional: Pagination query parameters (page, limit)
    const { page = 1, limit = 10 } = req.query;

    // Calculate the skip and limit for pagination
    const skip = (page - 1) * limit;

    // Find doctors and populate the specialization field
    const doctors = await doctorModel
      .find()
      .populate("specialization", "department desc")
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










// const getBookedAppointments = async (req, res) => {
//   try {
//     const { doctorId, date } = req.params;
//     const doctor = await doctorModel.findById(doctorId);
//     const doctorTimeZone = doctor.timeZone || "America/Chicago"; // Ensure correct timezone

//     const bookedAppointments = await appointmentModel.find({ 
//         doctor: doctorId, 
//         date: moment.tz(date, doctorTimeZone).format("YYYY-MM-DD") 
//     });

//     const bookedSlots = bookedAppointments.map(appointment =>
//       moment.tz(`${date} ${appointment.time}`, "YYYY-MM-DD HH:mm", "UTC")
//             .tz(doctorTimeZone).format("HH:mm")
//     );

//     res.status(200).json({ status: true, bookedSlots });
//   } catch (error) {
//     res.status(500).json({ status: false, message: "Error fetching slots", error });
//   }
// };



const getBookedAppointments = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await doctorModel.findById(doctorId);
    const doctorTimeZone = doctor.timeZone || "America/Chicago"; // Ensure correct timezone

    // Format the date in the doctor's timezone
    const formattedDate = moment.tz(date, doctorTimeZone).format("YYYY-MM-DD");

    // Fetch booked appointments for that specific doctor and date
    const bookedAppointments = await appointmentModel.find({
      doctor: doctorId,
      date: formattedDate
    });

    // Map the booked slots to the correct format
    const bookedSlots = bookedAppointments.map(appointment => {
      let appointmentTime = moment.tz(`${date} ${appointment.time}`, "YYYY-MM-DD HH:mm", "UTC")
                               .tz(doctorTimeZone);

      // Check if the appointment crosses midnight, dynamically adjust
      if (appointmentTime.isAfter(appointmentTime.clone().endOf('day'))) {
        // Shift it to the next day if crossing midnight
        appointmentTime = appointmentTime.add(1, 'days');
      }

      return appointmentTime.format("HH:mm");
    });

    res.status(200).json({ status: true, bookedSlots });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching slots", error });
  }
};




const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, patientTimeZone } = req.body;

    const doctor = await doctorModel.findById(doctorId);
    const doctorTimeZone = doctor.timeZone || "America/Chicago"; // Ensure correct timezone

    // Convert the time provided by patient (in patient's time zone) to UTC
    const appointmentTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", patientTimeZone);
    
    // Convert the appointment time to the doctor's local time zone to handle DST correctly
    const doctorTime = appointmentTime.clone().tz(doctorTimeZone);

    // Convert the doctor's time to UTC for consistency
    const appointmentTimeUTC = doctorTime.utc().format("YYYY-MM-DD HH:mm");

    // Check if the slot is already booked
    const existingAppointment = await appointmentModel.findOne({ 
        doctor: doctorId, 
        date: moment.tz(date, doctorTimeZone).format("YYYY-MM-DD"), 
        time: appointmentTimeUTC.split(" ")[1]
    });

    if (existingAppointment) {
      return res.status(400).json({ status: false, message: "Slot already booked" });
    }

    // Save the appointment with UTC time
    const newAppointment = new appointmentModel({ 
        patient: patientId, 
        doctor: doctorId, 
        date: appointmentTimeUTC.split(" ")[0], 
        time: appointmentTimeUTC.split(" ")[1] 
    });
    await newAppointment.save();

    res.status(201).json({ status: true, message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error booking appointment", error });
  }
};


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});



// const createMeeting = async (req, res) => {
//   try {
//     const { doctorId, patientId, meetingLink, date, time } = req.body; // ✅ Extract date & time

//     console.log("req.body",req.body)

//     if (!doctorId || !patientId || !meetingLink || !date || !time) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     // Store in the database
//     const newAppointment = await appointmentModel.create({
//       patient: patientId,
//       doctor: doctorId,
//       date,  // ✅ Save date
//       time,  // ✅ Save time
//       meetingLink, // Store meeting link in appointment
//       status: "confirmed",
//     });

//     // Fetch patient & doctor details
//     const patient = await patientModel.findById(patientId);
//     const doctor = await doctorModel.findById(doctorId);

//     if (!patient || !doctor) {
//       return res.status(404).json({ success: false, message: "Doctor or Patient not found" });
//     }

//     // Send email with appointment details
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: patient.email,
//       subject: "Your Appointment Meeting Link",
//       html: `
//         <p>Dear ${patient.first_name},</p>
//         <p>Your appointment with Dr. ${doctor.firstName} is confirmed.</p>
//         <p><strong>Date:</strong> ${date}</p>
//         <p><strong>Time:</strong> ${time}</p>
//         <p>Click the link below to join the meeting:</p>
//         <a href="${meetingLink}">${meetingLink}</a>
//         <p>Thank you!</p>
//       `,
//     });

//     res.json({ success: true, message: "Meeting created and email sent", meetingLink });
//   } catch (error) {
//     console.error("Error creating meeting:", error);
//     res.status(500).json({ success: false, message: "Failed to create meeting" });
//   }
// };







const createMeeting = async (req, res) => {
  try {
      const { doctorId, patientId, date, time, meetingMode, patientTimeZone } = req.body;

      // **Simulate payment (Replace with actual payment gateway integration)**
      const paymentSuccess = true;

      if (!paymentSuccess) {
          return res.status(400).json({
              success: false,
              message: "Payment failed. Please try again.",
          });
      }

      // 1. Get Doctor's TimeZone
      const doctor = await doctorModel.findById(doctorId);
      if (!doctor) {
          return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      const doctorTimeZone = doctor.timeZone || "UTC";  // Default to UTC if not specified

      // 2. Convert time to UTC

      //Convert the time provided by patient (in patient's time zone) to UTC
      const appointmentTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", patientTimeZone);

      // Convert the appointment time to the doctor's local time zone to handle DST correctly
      const doctorTime = appointmentTime.clone().tz(doctorTimeZone);

      // Convert the doctor's time to UTC for consistency
      const appointmentTimeUTC = doctorTime.utc().format("YYYY-MM-DD HH:mm");


      // 3. Generate a Room/Meeting Link: Replace with your meeting platform's logic
      const room = "room_" + Math.random().toString(36).substring(2, 9);
      // const meetingLink = `http://localhost:5173/patient/meeting/${room}`;

      // const meetingLink = `http://localhost:5173/patient/meeting/${room}`;
      const meetingLink = `https://ensembledemospace.com/patient/meeting/${room}`;


      // 4. Save Appointment to Database
      const newAppointment = await appointmentModel.create({
          patient: patientId,
          doctor: doctorId,
          date: appointmentTimeUTC.split(" ")[0], // Store date part
          time: appointmentTimeUTC.split(" ")[1], // Store time part
          meetingLink,
          meetingMode,
          status: "confirmed",
          room, // Save the room part
      });

      // 5. Fetch Patient and Doctor Details for Email
      const patient = await patientModel.findById(patientId);
      const doctorDetails = await doctorModel.findById(doctorId);

      if (!patient || !doctorDetails) {
          return res.status(404).json({ success: false, message: "Doctor or Patient not found" });
      }

      // 6. Send Email with Meeting Link
      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: patient.email,
          subject: "Your Appointment Meeting Link",
          html: `
              <p>Dear ${patient.first_name},</p>
              <p>Your appointment with Dr. ${doctorDetails.firstName} has been confirmed.</p>
              <p><strong>Date:</strong> ${doctorTime.format("YYYY-MM-DD")}</p>  // Use formatted doctor time
              <p><strong>Time:</strong> ${doctorTime.format("HH:mm")}</p>  // Use formatted doctor time
              <p>Click the link below to join the meeting:</p>
              <a href="${meetingLink}">${meetingLink}</a>
              <p>Thank you!</p>
          `,
      });
    res.status(201).json({
          success: true,
          message: "Appointment booked and meeting link sent.",
          meetingLink,
          appointment:newAppointment
      });
  } catch (error) {
      console.error("Error creating meeting and booking appointment:", error);
      res.status(500).json({ success: false, message: "Failed to create appointment and send link", error: error.message });
  }
};


// const createMeeting = async (req, res) => {
//   try {
//       const { doctorId, patientId, date, time, meetingMode, patientTimeZone, meetingLink } = req.body;

//       // 1. Validate required fields
//       if (!doctorId || !patientId || !date || !time || !meetingMode || !patientTimeZone || !meetingLink) {
//           return res.status(400).json({
//               success: false,
//               message: "Missing required fields",
//           });
//       }

//       // 2. Get Doctor's Details
//       const doctor = await doctorModel.findById(doctorId);
//       if (!doctor) {
//           return res.status(404).json({ success: false, message: "Doctor not found" });
//       }
//       console.log("Doctor Details:", JSON.stringify(doctor));
//       const doctorTimeZone = doctor.timeZone || "UTC";
//       const slotDuration = doctor.slotDuration || 30;

//       // 3. Convert requested time to doctor's timezone
//       const appointmentTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", patientTimeZone);
//       if (!appointmentTime.isValid()) {
//           return res.status(400).json({
//               success: false,
//               message: "Invalid date or time format",
//           });
//       }
//       const doctorTime = appointmentTime.clone().tz(doctorTimeZone);
//       const appointmentTimeUTC = doctorTime.utc().format("YYYY-MM-DD HH:mm");

//       console.log("Requested Date (Doctor's Timezone):", doctorTime.format("YYYY-MM-DD"));
//       console.log("Requested Time (Doctor's Timezone):", doctorTime.format("HH:mm"));
//       console.log("Doctor TimeZone:", doctorTimeZone);
//       console.log("Slot Duration:", slotDuration);

//       // 4. Check if the slot is within the doctor's schedule
//       const dayOfWeek = doctorTime.format("ddd").toLowerCase();
//       const doctorSchedule = doctor.schedule[dayOfWeek];
//       console.log("Day of Week:", dayOfWeek);
//       console.log("Doctor's Schedule for the Day:", doctorSchedule);

//       if (!doctorSchedule || doctorSchedule.length === 0) {
//           return res.status(400).json({
//               success: false,
//               message: "Doctor is not available on this day",
//           });
//       }

//       const requestedTime = doctorTime.format("HH:mm");
//       let slotAvailable = false;

//       for (let slot of doctorSchedule) {
//           const slotStart = moment.tz(
//               `${doctorTime.format("YYYY-MM-DD")} ${slot.start}`,
//               "YYYY-MM-DD HH:mm",
//               doctorTimeZone
//           );
//           const slotEnd = moment.tz(
//               `${doctorTime.format("YYYY-MM-DD")} ${slot.end}`,
//               "YYYY-MM-DD HH:mm",
//               doctorTimeZone
//           );

//           console.log(`Checking slot: ${slot.start} - ${slot.end}`);
//           console.log(`Slot Start: ${slotStart.format("HH:mm")}, Slot End: ${slotEnd.format("HH:mm")}`);

//           let currentSlot = slotStart.clone();
//           while (currentSlot.isBefore(slotEnd) || currentSlot.isSame(slotEnd)) {
//               const slotTime = currentSlot.format("HH:mm");
//               console.log(`Generated Slot Time: ${slotTime}`);

//               if (requestedTime === slotTime) {
//                   slotAvailable = true;
//                   console.log(`Slot ${slotTime} is available`);
//                   break;
//               }
//               currentSlot.add(slotDuration, "minutes");
//           }

//           if (slotAvailable) break;
//       }

//       if (!slotAvailable) {
//           console.log("No matching slot found for:", requestedTime);
//           return res.status(400).json({
//               success: false,
//               message: "The selected slot is not available in the doctor's schedule",
//           });
//       }

//       // 5. Check if the slot is already booked
//       const existingAppointment = await appointmentModel.findOne({
//           doctor: doctorId,
//           date: appointmentTimeUTC.split(" ")[0],
//           time: appointmentTimeUTC.split(" ")[1],
//           status: "confirmed",
//       });

//       if (existingAppointment) {
//           return res.status(400).json({
//               success: false,
//               message: "The selected slot is already booked. Try another slot.",
//           });
//       }

//       // 6. Simulate payment
//       const paymentSuccess = true;
//       if (!paymentSuccess) {
//           return res.status(400).json({
//               success: false,
//               message: "Payment failed. Please try again.",
//           });
//       }

//       // 7. Save Appointment to Database
//       const newAppointment = await appointmentModel.create({
//           patient: patientId,
//           doctor: doctorId,
//           date: appointmentTimeUTC.split(" ")[0],
//           time: appointmentTimeUTC.split(" ")[1],
//           meetingLink,
//           meetingMode,
//           status: "confirmed",
//       });

//       // 8. Fetch Patient and Doctor Details for Email
//       const patient = await patientModel.findById(patientId);
//       const doctorDetails = await doctorModel.findById(doctorId);

//       if (!patient || !doctorDetails) {
//           return res.status(404).json({ success: false, message: "Doctor or Patient not found" });
//       }

//       // 9. Send Email with Meeting Link
//       await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: patient.email,
//           subject: "Your Appointment Meeting Link",
//           html: `
//               <p>Dear ${patient.first_name},</p>
//               <p>Your appointment with Dr. ${doctorDetails.firstName} has been confirmed.</p>
//               <p><strong>Date:</strong> ${doctorTime.format("YYYY-MM-DD")}</p>
//               <p><strong>Time:</strong> ${doctorTime.format("HH:mm")}</p>
//               <p>Click the link below to join the meeting:</p>
//               <a href="${meetingLink}">${meetingLink}</a>
//               <p>Thank you!</p>
//           `,
//       });

//       res.status(201).json({
//           success: true,
//           message: "Appointment booked and meeting link sent.",
//           meetingLink,
//           appointment: newAppointment,
//       });
//   } catch (error) {
//       console.error("Error creating meeting and booking appointment:", error);
//       res.status(500).json({
//           success: false,
//           message: "Failed to create appointment and send link",
//           error: error.message,
//       });
//   }
// };





// GET Appointments API
// const getAppointment = async (req, res) => {
//   try {
//     // Extract query parameters for filtering (optional)
//     const { room, patientId, doctorId, date, status } = req.query;

//     // Build the query object dynamically based on provided parameters
//     let query = {};

//     if (room) {
//       query.room = room; // Fetch by room (not _id)
//     }
//     if (patientId) {
//       query.patient = patientId; // Fetch by patient ID
//     }
//     if (doctorId) {
//       query.doctor = doctorId; // Fetch by doctor ID
//     }
//     if (date) {
//       query.date = date; // Fetch by date (exact match)
//     }
//     if (status) {
//       query.status = status; // Fetch by status (pending, confirmed, cancelled)
//     }

//     // Log the query for debugging
//     console.log("Querying appointments with:", query);

//     // Fetch appointments from the database with populated patient and doctor fields
//     const appointments = await appointmentModel
//       .find(query)
//       .populate("patient", "name email")
//       .populate("doctor", "name specialization")
//       .exec();

//     // If no appointments are found, return a 404 response
//     if (!appointments || appointments.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No appointments found for the given criteria",
//       });
//     }

//     // Return the appointments
//     return res.status(200).json({
//       success: true,
//       message: "Appointments retrieved successfully",
//       data: appointments,
//     });
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching appointments",
//       error: error.message,
//     });
//   }
// };


const getAppointment = async (req, res) => {
  try {
    // Extract query parameters for filtering (optional)
    const { room, patientId, doctorId, date, status } = req.query;

    // Build the query object dynamically based on provided parameters
    let query = {};

    if (room) {
      query.room = room; // Fetch by room
    }
    if (patientId) {
      query.patient = patientId; // Fetch by patient ID
    }
    if (doctorId) {
      query.doctor = doctorId; // Fetch by doctor ID
    }
    if (date) {
      query.date = date; // Fetch by date (exact match)
    }
    if (status) {
      query.status = status; // Fetch by status (pending, confirmed, cancelled)
    }

    // Log the query for debugging
    console.log("Querying appointments with:", query);

    // Fetch appointments from the database with populated patient and doctor fields
    const appointments = await appointmentModel
      .find(query)
      .populate({
        path: "patient",
        select: "first_name last_name email mobile gender age", // Select relevant patient fields
      })
      .populate({
        path: "doctor",
        select: "firstName lastName email mobile specialization", // Select relevant doctor fields
        populate: {
          path: "specialization", // Deep populate specialization if it's a reference
          select: "name", // Assuming Departments model has a 'name' field
        },
      })
      .exec();

    // If no appointments are found, return a 404 response
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for the given criteria",
      });
    }

    // Return the appointments
    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
      error: error.message,
    });
  }
};


const getPatientAppointment = async (req, res) => {
  try {
    // Extract patientId from query parameters (required)
    const { patientId } = req.query;

    // Validate patientId
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    // Build the query object with patientId
    const query = { patient: patientId };

    // Log the query for debugging
    console.log("Querying patient appointments with:", query);

    // Fetch appointments from the database with populated patient and doctor fields
    const appointments = await appointmentModel
      .find(query)
      .populate({
        path: "patient",
        select: "first_name last_name email mobile gender age", // Select relevant patient fields
      })
      .populate({
        path: "doctor",
        select: "firstName lastName email mobile specialization", // Select relevant doctor fields
        populate: {
          path: "specialization", // Deep populate specialization if it's a reference
          select: "name", // Assuming Departments model has a 'name' field
        },
      })
      .exec();

    // If no appointments are found, return a 404 response
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this patient",
      });
    }

    // Return the appointments
    return res.status(200).json({
      success: true,
      message: "Patient appointments retrieved successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching patient appointments",
      error: error.message,
    });
  }
};


module.exports = {
  addPatient,
  deletePatient,
  updatePatient,
  getAllPatient,
  getSinglePatient,
  getAllPatientFilterByDoctor,deletePatientByDoctor,editPatientByDoctor,
  getSinglePatientByDoctor, getAllDoctorsByPatient, getBookedAppointments, bookAppointment, createMeeting, getAppointment, getPatientAppointment
};

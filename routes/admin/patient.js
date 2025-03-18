const { Router } = require("express");
const {
  addPatient,
  deletePatient,
  updatePatient,
  getAllPatient,
  getSinglePatient,
  getAllDoctorsByPatient,
  getBookedAppointments,
  bookAppointment,
  createMeeting,
  checkSlot,
  getAppointment,
} = require("../../controllers/admin/patientController");
const loginVerify = require("../../middleware/loginVerify");
const { getSingleDoctor } = require("../../controllers/admin/doctor");

const patientRoute = Router();

patientRoute.post("/add-patient", loginVerify, addPatient);

patientRoute.delete("/delete-patient/:id", loginVerify, deletePatient);

patientRoute.put("/update-patient/:id", loginVerify, updatePatient);

patientRoute.get("/get-patient", loginVerify, getAllPatient);

patientRoute.get("/get-single-patient/:id", loginVerify, getSinglePatient);

patientRoute.get("/get-doctor-by-patient", getAllDoctorsByPatient);

patientRoute.get("/get-doctor-by-patient/:doctorId",loginVerify,getSingleDoctor)

patientRoute.get("/get-booked-slots/:doctorId/:date",getBookedAppointments)

patientRoute.post("/book-appointment",loginVerify,bookAppointment)


patientRoute.post("/create-meeting",loginVerify,createMeeting)

patientRoute.get("/get-appointment",getAppointment)


patientRoute.get("/get-patient-appointment",getAppointment)





module.exports = { patientRoute };

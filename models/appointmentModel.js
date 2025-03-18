const { Schema, model } = require("mongoose");

const AppointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "patient", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "doctor", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:mm
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  meetingLink: { type: String, required: true },
  room: { type: String }, // Added to store the room part of the meetingLink
});

const appointmentModel = model("appointment", AppointmentSchema);

module.exports = { appointmentModel };


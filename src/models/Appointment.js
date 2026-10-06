import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    treatment: {
      type: String,
      trim: true,
      default: 'General Consultation'
    },
    preferredDate: {
      type: String,
      default: ''
    },
    preferredTime: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'completed', 'cancelled'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;

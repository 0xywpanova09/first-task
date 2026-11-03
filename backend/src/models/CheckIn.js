const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: {
        values: ['1', '2', '3', '4', '5', 'Good', 'Okay', 'Bad'],
        message: 'Mood must be 1-5 or Good / Okay / Bad',
      },
    },
    workedOn: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Worked on cannot exceed 500 characters'],
    },
    blockers: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Blockers cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckIn', checkInSchema);

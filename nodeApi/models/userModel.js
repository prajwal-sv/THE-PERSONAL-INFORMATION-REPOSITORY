import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add the user name']
  },
  email: {
    type: String,
    required: [true, 'Please add the user email address'],
    unique: [true, 'Email address already taken']
  },
  password: {
    type: String,
    required: [true, 'Please add the password']
  },
  resetPasswordOtp: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
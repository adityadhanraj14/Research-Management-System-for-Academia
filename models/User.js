const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { 
    type: String, 
    enum: ['CSE', 'ISE', 'AIML', 'EEE', 'ECE', 'Mechanical', 'Civil'], 
    required: true 
  },
  designation: { 
    type: String, 
    enum: ['Principal', 'Associate Professor', 'Professor', 'Assistant Professor'], 
    required: true 
  },
  profilePic: { type: String, default: 'default-profile.png' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Token', tokenSchema);
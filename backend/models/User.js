// models/User.js
const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will be hashed
  email: { type: String, required: true, unique: true },
  defaultPincode: { type: String },
  rentedPincodes: [{ type: String }],
  rentedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  ownedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: false }, // admin must approve
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });



// Method to compare password (plain string match)
UserSchema.methods.comparePassword = function (candidate) {
  return Promise.resolve(candidate === this.password);
};

module.exports = mongoose.model('User', UserSchema);

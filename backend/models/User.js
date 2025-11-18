// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

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

// Hash password before save
UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) { next(err); }
});

// Method to compare password
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);

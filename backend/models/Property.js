// models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ['flat', 'bungalow', 'pin code'], required: true },
  pincode: { type: String }, // helpful index/search
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // owner reference
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // current tenant
  rentPerMonth: { type: Number, required: true },
  deposit: { type: Number, required: true },
  photo: { type: String }, // base64 or image URL
  description: { type: String },
  bhk: { type: String }, // 1BHK, 2BHK, etc
  amenities: [{ type: String }], // WiFi, Parking, etc
  isApproved: { type: Boolean, default: false }, // admin approval
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);

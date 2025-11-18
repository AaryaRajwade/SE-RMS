// routes/property.js
const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// REGISTER PROPERTY (owner creates property listing)
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { name, address, type, pincode, rentPerMonth, deposit, photo, description, bhk, amenities } = req.body;

    if (!name || !address || !type || !rentPerMonth || !deposit) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newProperty = new Property({
      name,
      address,
      type,
      pincode,
      owner: req.user.userId,
      rentPerMonth,
      deposit,
      photo,
      description,
      bhk,
      amenities: amenities || [],
      isApproved: false
    });

    await newProperty.save();

    res.json({
      message: "Property registered successfully. Waiting for admin approval.",
      propertyId: newProperty._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PENDING PROPERTIES (for admin approval)
router.get("/pending", authMiddleware, isAdmin, async (req, res) => {
  try {
    const pendingProperties = await Property.find({ isApproved: false })
      .populate('owner', 'name username email')
      .sort({ createdAt: -1 });
    
    res.json(pendingProperties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET APPROVED PROPERTIES (public listing)
router.get("/approved", async (req, res) => {
  try {
    const approvedProperties = await Property.find({ isApproved: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(approvedProperties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// SEARCH PROPERTIES WITH FILTERS
router.post("/search", async (req, res) => {
  try {
    const { pincode, amenities, maxRent, minBhk } = req.body;
    
    let query = { isApproved: true };

    // Filter by pincode range (pincode - 2 to pincode + 2)
    if (pincode && pincode.trim()) {
      const pincodeNum = parseInt(pincode);
      if (!isNaN(pincodeNum)) {
        query.pincode = {
          $gte: (pincodeNum - 2).toString(),
          $lte: (pincodeNum + 2).toString()
        };
      }
    }

    // Filter by amenities (all selected amenities must be present)
    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // Filter by max rent
    if (maxRent && maxRent > 0) {
      query.rentPerMonth = { $lte: maxRent };
    }

    // Filter by minimum BHK
    if (minBhk) {
      query.bhk = minBhk;
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY PROPERTIES (user's own properties)
router.get("/my-properties", authMiddleware, async (req, res) => {
  try {
    const myProperties = await Property.find({ owner: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.json(myProperties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PROPERTY DETAILS
router.get("/:propertyId", async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId)
      .populate('owner', 'name email')
      .populate('renter', 'name email');
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// APPROVE PROPERTY (admin)
router.post("/approve/:propertyId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.isApproved = true;
    await property.save();

    res.json({ message: "Property approved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// REJECT PROPERTY (admin) - delete unapproved property
router.delete("/reject/:propertyId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property rejected and deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROPERTY (owner only)
router.put("/:propertyId", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is owner
    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only property owner can update" });
    }

    // Only allow update if not approved
    if (property.isApproved) {
      return res.status(403).json({ message: "Cannot update approved property" });
    }

    const { name, address, type, pincode, rentPerMonth, deposit, photo, description, bhk, amenities } = req.body;

    if (name) property.name = name;
    if (address) property.address = address;
    if (type) property.type = type;
    if (pincode) property.pincode = pincode;
    if (rentPerMonth) property.rentPerMonth = rentPerMonth;
    if (deposit) property.deposit = deposit;
    if (photo) property.photo = photo;
    if (description) property.description = description;
    if (bhk) property.bhk = bhk;
    if (amenities) property.amenities = amenities;

    await property.save();

    res.json({ message: "Property updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

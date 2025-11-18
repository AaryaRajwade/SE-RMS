import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Property.css';

const PropertyRegister = ({ onPropertyRegistered }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'flat',
    pincode: '',
    bhk: '1BHK',
    rentPerMonth: '',
    deposit: '',
    description: '',
    amenities: [],
    photo: null
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const amenitiesList = ['WiFi', 'Parking', 'AC', 'Kitchen', 'Balcony', 'Lift', 'Security', 'Garden'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Property name is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.rentPerMonth || formData.rentPerMonth <= 0) {
      setError('Valid rent is required');
      return false;
    }
    if (!formData.deposit || formData.deposit <= 0) {
      setError('Valid deposit is required');
      return false;
    }
    if (!formData.photo) {
      setError('Property photo is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/property/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to register property');
        return;
      }

      setSuccess(data.message);
      setFormData({
        name: '',
        address: '',
        type: 'flat',
        pincode: '',
        bhk: '1BHK',
        rentPerMonth: '',
        deposit: '',
        description: '',
        amenities: [],
        photo: null
      });
      setPreview(null);
      
      setTimeout(() => {
        onPropertyRegistered();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-register-container">
      <div className="property-form-card">
        <h2>Register Property</h2>
        <p className="form-subtitle">List your property for rent (pending admin approval)</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="property-form">
          {/* Photo Upload */}
          <div className="form-group">
            <label>Property Photo *</label>
            <div className="photo-upload">
              {preview ? (
                <div className="photo-preview">
                  <img src={preview} alt="Property preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFormData(prev => ({ ...prev, photo: null }));
                    }}
                    className="btn-remove-photo"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <span className="upload-icon">📷 Click to upload photo</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Property Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cozy 2BHK Apartment"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="flat">Flat</option>
                <option value="bungalow">Bungalow</option>
                <option value="pin code">Pin Code</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>BHK *</label>
              <select
                name="bhk"
                value={formData.bhk}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g., 411001"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rent Per Month (₹) *</label>
              <input
                type="number"
                name="rentPerMonth"
                value={formData.rentPerMonth}
                onChange={handleChange}
                placeholder="e.g., 15000"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Security Deposit (₹) *</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="e.g., 30000"
                disabled={loading}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label>Amenities</label>
            <div className="amenities-grid">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    disabled={loading}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PropertyRegister;

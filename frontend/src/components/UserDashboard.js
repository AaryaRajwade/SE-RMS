import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropertyRegister from './PropertyRegister';
import PropertyListings from './PropertyListings';
import '../styles/Property.css';

const UserDashboard = ({ onLogout }) => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('browse');
  const [refresh, setRefresh] = useState(0);

  const handlePropertyRegistered = () => {
    setActiveTab('my-properties');
    setRefresh(refresh + 1);
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Property Rental Management System</h1>
        <button onClick={onLogout} className="btn btn-logout">
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Properties
        </button>
        <button
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register Property
        </button>
        <button
          className={`tab ${activeTab === 'my-properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-properties')}
        >
          My Properties
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'browse' && <PropertyListings />}
        {activeTab === 'register' && <PropertyRegister onPropertyRegistered={handlePropertyRegistered} />}
        {activeTab === 'my-properties' && <MyProperties key={refresh} token={token} />}
      </div>
    </div>
  );
};

// My Properties Component
const MyProperties = ({ token }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/property/my-properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError('Failed to load your properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-properties-container">
      <h2>My Properties</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading">Loading your properties...</p>}

      {!loading && properties.length === 0 && (
        <div className="no-data">
          You haven't registered any properties yet.
          <p>Register your first property to get started!</p>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property._id} className="property-card">
              {property.photo && (
                <div className="property-image">
                  <img src={property.photo} alt={property.name} />
                  <div className="property-badge">{property.bhk}</div>
                  <div className={`approval-badge ${property.isApproved ? 'approved' : 'pending'}`}>
                    {property.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </div>
                </div>
              )}

              <div className="property-content">
                <h3>{property.name}</h3>
                <p className="property-type">{property.type}</p>

                <div className="property-meta">
                  <span className="rent">
                    <strong>₹{property.rentPerMonth.toLocaleString()}</strong>
                    <small>/month</small>
                  </span>
                  {property.pincode && <span className="pincode">📍 {property.pincode}</span>}
                </div>

                <p className="address">{property.address}</p>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="amenities">
                    {property.amenities.slice(0, 3).map(amenity => (
                      <span key={amenity} className="amenity-tag">{amenity}</span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="amenity-tag">+{property.amenities.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="property-info">
                  <p><strong>Deposit:</strong> ₹{property.deposit.toLocaleString()}</p>
                  <p><strong>Status:</strong> {property.isApproved ? '✓ Public' : '⏳ Awaiting Admin Approval'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

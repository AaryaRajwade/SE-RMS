import React, { useState, useEffect } from 'react';
import '../styles/Property.css';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Filter states
  const [searchPincode, setSearchPincode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [maxRent, setMaxRent] = useState('');
  const [minBhk, setMinBhk] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const amenitiesList = ['WiFi', 'Parking', 'AC', 'Kitchen', 'Balcony', 'Lift', 'Security', 'Garden'];
  const bhkOptions = ['1BHK', '2BHK', '3BHK', '4BHK'];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/property/approved');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const searchPayload = {
        pincode: searchPincode || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        maxRent: maxRent ? parseInt(maxRent) : undefined,
        minBhk: minBhk || undefined
      };

      const response = await fetch('http://localhost:5000/property/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload)
      });

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError('Failed to search properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchPincode('');
    setSelectedAmenities([]);
    setMaxRent('');
    setMinBhk('');
    fetchProperties();
    setShowFilters(false);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(selectedProperty && selectedProperty._id === property._id ? null : property);
  };

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1>Available Properties</h1>
        <p>Browse and find your perfect home</p>
        <div className="header-actions">
          <button onClick={fetchProperties} className="btn btn-refresh">
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-filter"
          >
            🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <form onSubmit={handleSearch} className="filter-form">
            {/* Pincode Search */}
            <div className="filter-group">
              <label>Search by Pincode</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={searchPincode}
                  onChange={(e) => setSearchPincode(e.target.value)}
                  placeholder="Enter pincode (will search ±2)"
                  className="filter-input"
                />
              </div>
              <small>Searches properties in pincode ±2 range</small>
            </div>

            {/* Max Rent */}
            <div className="filter-group">
              <label>Max Rent (₹/month)</label>
              <input
                type="number"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                placeholder="e.g., 20000"
                className="filter-input"
              />
            </div>

            {/* Min BHK */}
            <div className="filter-group">
              <label>BHK Type</label>
              <select
                value={minBhk}
                onChange={(e) => setMinBhk(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {bhkOptions.map(bhk => (
                  <option key={bhk} value={bhk}>{bhk}</option>
                ))}
              </select>
            </div>

            {/* Amenities */}
            <div className="filter-group full-width">
              <label>Amenities</label>
              <div className="amenities-filter-grid">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="amenity-filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="filter-buttons">
              <button type="submit" className="btn btn-primary-filter">
                🔍 Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-secondary-filter"
              >
                ✕ Clear Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="loading">Loading properties...</p>}

      {!loading && properties.length === 0 && (
        <div className="no-data">
          {searchPincode || selectedAmenities.length > 0 || maxRent || minBhk
            ? 'No properties match your search criteria. Try adjusting your filters.'
            : 'No properties available at the moment.'}
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="search-results">
          <p className="results-count">Found {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}</p>
          <div className="properties-grid">
            {properties.map(property => (
              <div key={property._id} className="property-card">
                {property.photo && (
                  <div className="property-image">
                    <img src={property.photo} alt={property.name} />
                    <div className="property-badge">{property.bhk}</div>
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

                  <button
                    onClick={() => handlePropertyClick(property)}
                    className="btn btn-view"
                  >
                    {selectedProperty && selectedProperty._id === property._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {selectedProperty && selectedProperty._id === property._id && (
                  <div className="property-details">
                    <div className="detail-item">
                      <strong>Owner:</strong> {property.owner?.name}
                    </div>
                    <div className="detail-item">
                      <strong>Owner Email:</strong> {property.owner?.email}
                    </div>
                    <div className="detail-item">
                      <strong>Security Deposit:</strong> ₹{property.deposit.toLocaleString()}
                    </div>
                    <div className="detail-item">
                      <strong>Property Type:</strong> {property.type}
                    </div>
                    {property.description && (
                      <div className="detail-item">
                        <strong>Description:</strong>
                        <p>{property.description}</p>
                      </div>
                    )}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="detail-item">
                        <strong>Amenities:</strong>
                        <div className="amenities-full">
                          {property.amenities.map(amenity => (
                            <span key={amenity} className="amenity-tag">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListings;

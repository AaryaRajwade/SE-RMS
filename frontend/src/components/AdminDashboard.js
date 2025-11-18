import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const { token } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending-users');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [banUsername, setBanUsername] = useState('');
  const [unbanUsername, setUnbanUsername] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const pendingUsersRes = await fetch('http://localhost:5000/admin/pending-users', { headers });
      const pendingUsersData = await pendingUsersRes.json();
      setPendingUsers(pendingUsersData);

      const allUsersRes = await fetch('http://localhost:5000/admin/all-users', { headers });
      const allUsersData = await allUsersRes.json();
      setAllUsers(allUsersData);

      const pendingPropsRes = await fetch('http://localhost:5000/property/pending', { headers });
      const pendingPropsData = await pendingPropsRes.json();
      setPendingProperties(pendingPropsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/approve/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error approving user');
      console.error(err);
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      const response = await fetch(`http://localhost:5000/property/approve/${propertyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        const updatedProps = pendingProperties.filter(p => p._id !== propertyId);
        setPendingProperties(updatedProps);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error approving property');
      console.error(err);
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      const response = await fetch(`http://localhost:5000/property/reject/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        const updatedProps = pendingProperties.filter(p => p._id !== propertyId);
        setPendingProperties(updatedProps);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error rejecting property');
      console.error(err);
    }
  };

  const handleBan = async () => {
    if (!banUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/ban', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: banUsername })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setBanUsername('');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error banning user');
      console.error(err);
    }
  };

  const handleUnban = async () => {
    if (!unbanUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/unban', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: unbanUsername })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUnbanUsername('');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error unbanning user');
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} className="btn btn-logout">
          Logout
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'pending-users' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-users')}
        >
          Pending Users ({pendingUsers.length})
        </button>
        <button
          className={`tab ${activeTab === 'pending-properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-properties')}
        >
          Pending Properties ({pendingProperties.length})
        </button>
        <button
          className={`tab ${activeTab === 'manage-users' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-users')}
        >
          Manage Users
        </button>
        <button
          className={`tab ${activeTab === 'ban' ? 'active' : ''}`}
          onClick={() => setActiveTab('ban')}
        >
          Ban/Unban Users
        </button>
      </div>

      <div className="admin-content">
        {loading && <p className="loading">Loading...</p>}

        {activeTab === 'pending-users' && !loading && (
          <div className="tab-content">
            <h2>Pending User Approvals</h2>
            {pendingUsers.length === 0 ? (
              <p className="no-data">No pending users</p>
            ) : (
              <div className="users-grid">
                {pendingUsers.map(user => (
                  <div key={user._id} className="user-card">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Pincode:</strong> {user.defaultPincode || 'N/A'}</p>
                      <p><strong>Status:</strong> <span className="status pending">Pending</span></p>
                    </div>
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="btn btn-approve"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending-properties' && !loading && (
          <div className="tab-content">
            <h2>Pending Property Approvals</h2>
            {pendingProperties.length === 0 ? (
              <p className="no-data">No pending properties</p>
            ) : (
              <div className="properties-grid">
                {pendingProperties.map(property => (
                  <div key={property._id} className="property-approval-card">
                    {property.photo && (
                      <div className="property-image">
                        <img src={property.photo} alt={property.name} />
                      </div>
                    )}
                    <div className="property-info">
                      <h3>{property.name}</h3>
                      <p><strong>Owner:</strong> {property.owner?.name}</p>
                      <p><strong>Email:</strong> {property.owner?.email}</p>
                      <p><strong>Address:</strong> {property.address}</p>
                      <p><strong>Type:</strong> {property.type}</p>
                      <p><strong>BHK:</strong> {property.bhk}</p>
                      <p><strong>Rent:</strong> ₹{property.rentPerMonth.toLocaleString()}/month</p>
                      <p><strong>Deposit:</strong> ₹{property.deposit.toLocaleString()}</p>
                      {property.description && (
                        <p><strong>Description:</strong> {property.description}</p>
                      )}
                      {property.amenities && property.amenities.length > 0 && (
                        <div>
                          <strong>Amenities:</strong>
                          <div className="amenities">
                            {property.amenities.map(amenity => (
                              <span key={amenity} className="amenity-tag">{amenity}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="approval-buttons">
                      <button
                        onClick={() => handleApproveProperty(property._id)}
                        className="btn btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectProperty(property._id)}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage-users' && !loading && (
          <div className="tab-content">
            <h2>All Users</h2>
            {allUsers.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Approved</th>
                      <th>Banned</th>
                      <th>Pincode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status ${user.isApproved ? 'approved' : 'pending'}`}>
                            {user.isApproved ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${user.isBanned ? 'banned' : 'active'}`}>
                            {user.isBanned ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>{user.defaultPincode || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ban' && !loading && (
          <div className="tab-content">
            <div className="ban-section">
              <h2>Ban User</h2>
              <div className="ban-form">
                <input
                  type="text"
                  value={banUsername}
                  onChange={(e) => setBanUsername(e.target.value)}
                  placeholder="Enter username to ban"
                  className="input-field"
                />
                <button onClick={handleBan} className="btn btn-danger">
                  Ban User
                </button>
              </div>
            </div>

            <div className="ban-section">
              <h2>Unban User</h2>
              <div className="ban-form">
                <input
                  type="text"
                  value={unbanUsername}
                  onChange={(e) => setUnbanUsername(e.target.value)}
                  placeholder="Enter username to unban"
                  className="input-field"
                />
                <button onClick={handleUnban} className="btn btn-success">
                  Unban User
                </button>
              </div>
            </div>

            <div className="banned-users-list">
              <h3>Currently Banned Users</h3>
              {allUsers.filter(u => u.isBanned).length === 0 ? (
                <p className="no-data">No banned users</p>
              ) : (
                <ul className="list">
                  {allUsers.filter(u => u.isBanned).map(user => (
                    <li key={user._id} className="banned-item">
                      {user.name} ({user.username})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

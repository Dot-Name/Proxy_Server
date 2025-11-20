import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:4000/api';

function App() {
  const [peers, setPeers] = useState([]);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: 54345,
    psk: ''
  });

  // Fetch peers from backend
  const fetchPeers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/peers`);
      setPeers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching peers:', error);
      setError('Failed to fetch peers: ' + (error.response?.data?.error || error.message));
    }
  };

  // Fetch system status
  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus({ publicIP: 'Error', vpnStatus: 'Unknown', vpnIP: 'N/A' });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPeers(), fetchStatus()]);
      setLoading(false);
    };
    
    loadData();

    // Set up polling for status updates
    const statusInterval = setInterval(() => {
      fetchStatus();
    }, 10000); // Update every 10 seconds

    // Cleanup function - this MUST return a function
    return () => {
      clearInterval(statusInterval);
    };
  }, []); // Empty dependency array

  // Add new peer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await axios.post(`${API_BASE_URL}/peers`, formData);
      setFormData({ name: '', ip: '', port: 54345, psk: '' });
      await fetchPeers();
    } catch (error) {
      setError('Failed to add peer: ' + (error.response?.data?.error || error.message));
    }
  };

  // Toggle VPN peer
  const togglePeer = async (peerId, action) => {
    try {
      setError('');
      await axios.post(`${API_BASE_URL}/peers/${peerId}/${action}`);
      await fetchPeers();
    } catch (error) {
      setError(`Failed to ${action} peer: ` + (error.response?.data?.error || error.message));
    }
  };

  // Delete peer
  const deletePeer = async (peerId) => {
    if (!window.confirm('Are you sure you want to delete this peer?')) {
      return;
    }
    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/peers/id/${peerId}`);
      await fetchPeers();
    } catch (error) {
      setError('Failed to delete peer: ' + (error.response?.data?.error || error.message));
    }
  };

  // Generate random PSK
  const generatePSK = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let psk = '';
    for (let i = 0; i < 32; i++) {
      psk += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, psk });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h1 className="app-title">
          <span className="shield-icon">🛡️</span>
          Proxy Server Management Dashboard
        </h1>
        <p className="loading-text">Initializing secure connection...</p>
      </div>
    );
  }

  return (
    

      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">
            <span className="shield-icon">🛡️</span>
            Proxy Server Management Dashboard
          </h1>
          <div className="header-subtitle">Secure Network Management</div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button 
              className="error-close"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Status Card */}
        <div className="status-card card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📊</span>
              System Status
            </h2>
            <div className="status-indicator">
              <div className={`status-dot ${status.vpnStatus === 'Active' ? 'active' : 'inactive'}`}></div>
              <span className="status-text">{status.vpnStatus || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="status-grid">
            <div className="status-item">
              <div className="status-label">Public IP</div>
              <div className="status-value">{status.publicIP || 'Loading...'}</div>
            </div>
            <div className="status-item">
              <div className="status-label">Proxy Server IP</div>
              <div className="status-value">{status.vpnIP || 'N/A'}</div>
            </div>
            <div className="status-item">
              <div className="status-label">Connected Peers</div>
              <div className="status-value">{peers.filter(p => p.isActive).length}</div>
            </div>
            <div className="status-item">
              <div className="status-label">Last Updated</div>
              <div className="status-value">
                {status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Add Peer Form */}
        <div className="form-card card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">➕</span>
              Add New Peer
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="peer-form">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Peer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter peer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Server IP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="192.168.1.1"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Port</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="54345"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 54345 })}
                  min="1"
                  max="65535"
                  required
                />
              </div>
              <div className="input-group psk-group">
                <label className="input-label">Pre-Shared Key</label>
                <div className="psk-input-container">
                  <input
                    type="text"
                    className="form-input psk-input"
                    placeholder="Enter or generate PSK"
                    value={formData.psk}
                    onChange={(e) => setFormData({ ...formData, psk: e.target.value })}
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="generate-btn"
                    onClick={generatePSK}
                    title="Generate random PSK"
                  >
                    <span className="generate-icon">🎲</span>
                  </button>
                </div>
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              <span className="btn-icon">✅</span>
              Add Peer
            </button>
          </form>
        </div>

        {/* Peer List */}
        <div className="peers-card card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">👥</span>
              Proxy Server Peers
            </h2>
            <div className="peer-count-badge">
              {peers.length} {peers.length === 1 ? 'peer' : 'peers'}
            </div>
          </div>
          
          {peers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No peers configured</h3>
              <p>Add your first Proxy Server peer using the form above to get started.</p>
            </div>
          ) : (
            <div className="peers-grid">
              {peers.map(peer => (
                <div
                  key={peer._id}
                  className={`peer-card ${peer.isActive ? 'active' : 'inactive'}`}
                >
                  <div className="peer-header">
                    <h3 className="peer-name">{peer.name}</h3>
                    <span className={`peer-status ${peer.isActive ? 'active' : 'inactive'}`}>
                      <span className="status-dot"></span>
                      {peer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="peer-details">
                    <div className="detail-item">
                      <span className="detail-label">IP Address</span>
                      <span className="detail-value">{peer.ip}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Port</span>
                      <span className="detail-value">{peer.port}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Connections</span>
                      <span className="detail-value">{peer.totalConnections || 0}</span>
                    </div>
                    {peer.lastConnected && (
                      <div className="detail-item">
                        <span className="detail-label">Last Connected</span>
                        <span className="detail-value">
                          {new Date(peer.lastConnected).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="peer-actions">
                    <button
                      className={`action-btn ${peer.isActive ? 'stop-btn' : 'start-btn'}`}
                      onClick={() => togglePeer(peer._id, peer.isActive ? 'stop' : 'start')}
                    >
                      <span className="btn-icon">
                        {peer.isActive ? '⏹️' : '▶️'}
                      </span>
                      {peer.isActive ? 'Stop' : 'Start'}
                    </button>
                    
                    <button
                      className={`action-btn delete-btn ${peer.isActive ? 'disabled' : ''}`}
                      onClick={() => deletePeer(peer._id)}
                      disabled={peer.isActive}
                      title={peer.isActive ? 'Stop peer before deleting' : 'Delete peer'}
                    >
                      <span className="btn-icon">🗑️</span>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './hr.css';

export default function ManagerLeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState({});
  const [message, setMessage] = useState('');

  const fetchRequests = () => {
    axios.get('/leave/all')
      .then(res => setRequests([...res.data].sort((a, b) => Number(b.id || b._id) - Number(a.id || a._id))))
      .catch(() => setMessage('Could not load leave requests. Please try again.'));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    const comment = comments[id] || "";
    try {
      await axios.put(`/leave/${id}`, { status, comment });
      setMessage(`Leave request ${status.toLowerCase()}.`);
      await fetchRequests();
    } catch {
      setMessage('Could not update this request. Please try again.');
    }
  };

  const handleCommentChange = (id, value) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="dashboard">
      <h2 style={{ padding: '25px' }}>Approve Leave Requests</h2>

      {message && <p role="status">{message}</p>}
      {requests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        requests.map(r => (
          <div className="task-box" key={r._id || r.id}>
            <p>
              <b>{r.employeeId}</b> requested <b>{r.type}</b> leave - {r.reason}
            </p>

            <p>Status: <b>{r.status}</b></p>

            <input
              placeholder="Manager comment"
              aria-label={`Comment for leave request from ${r.employeeId}`}
              value={comments[r.id ?? r._id] ?? r.comment ?? ""}
              onChange={e => handleCommentChange(r.id ?? r._id, e.target.value)}
            />

            <button
              className="action-btn1"
              onClick={() => updateStatus(r._id || r.id, "Approved")}
            >
              Approve
            </button>

            <button
              className="action-btn"
              onClick={() => updateStatus(r._id || r.id, "Rejected")}
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './hr.css';

// export default function ManagerTrackProgress() {
//   const [tasks, setTasks] = useState([]);
//   const [reviews, setReviews] = useState({});
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     axios.get('/tasks/assignedTasks')
//       .then(res => setTasks(res.data))
//       .catch(err => console.error('Error fetching tasks:', err));

//     axios.get('/ratings')
//       .then(res => {
//         const reviewMap = {};
//         res.data.forEach(r => {
//           reviewMap[r.taskId] = r.rating.toString();
//         });
//         setReviews(reviewMap);
//       })
//       .catch(err => console.error('Error fetching ratings:', err));
//   }, []);

//   const handleReviewChange = (taskId, review) => {
//     setReviews(prev => ({ ...prev, [taskId]: review }));
//   };

//   const submitReview = (task) => {
//     const rating = reviews[task.id];
//     if (!rating) return;

//     axios.get(`/ratings?employeeId=${task.employeeId}&taskId=${task.id}`)
//       .then(res => {
//         if (res.data.length > 0) {
//           const existing = res.data[0];
//           axios.put(`/ratings/${existing.id}`, {
//             ...existing,
//             rating: Number(rating)
//           }).then(() => {
//             setMessage(`Rating updated for ${task.employeeId} - ${task.title}`);
//           });
//         } else {
//           axios.post('/ratings', {
//             employeeId: task.employeeId,
//             taskId: task.id,
//             title: task.title,
//             rating: Number(rating)
//           }).then(() => {
//             setMessage(`Rating submitted for ${task.employeeId} - ${task.title}`);
//           });
//         }
//       })
//       .catch(() => {
//         setMessage('Error submitting or updating rating.');
//       });
//   };

//   return (
//     <div className="dashboard">
//       <h2 style={{ padding: '25px' }}>Track & Review Employee Tasks</h2>
//       {tasks.map((task, i) => (
//         <div key={i} className="task-box">
//           <h3>Employee: {task.employeeId}</h3>
//           <p><b>Task:</b> {task.title}</p>
//           <p><b>Progress:</b> {task.progress || 0}%</p>
//           <p><b>Status:</b> {task.status || 'Not Started'}</p>
//           <p><b>Notes:</b> {task.notes || '—'}</p>
//           <input
//             type="number"
//             min="1"
//             max="5"
//             value={reviews[task.id] || ''}
//             onChange={(e) => handleReviewChange(task.id, e.target.value)}
//             placeholder="Rate 1-5"
//           />
//           <div className='review-btn'>
//           <button className="action-btn" onClick={() => submitReview(task)}>Submit Review</button>
//           </div>
//         </div>
//       ))}
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// export default function ManagerPerformanceReview() {
//   const [ratings, setRatings] = useState([]);
//   const [grouped, setGrouped] = useState([]);

//   useEffect(() => {
//     axios.get('/ratings')
//       .then(res => {
//         setRatings(res.data);
//         const empMap = {};

//         res.data.forEach(r => {
//           if (!empMap[r.employeeId]) empMap[r.employeeId] = [];
//           empMap[r.employeeId].push(r);
//         });

//         const summary = Object.keys(empMap).map(empId => {
//           const taskRatings = empMap[empId];
//           const avg = taskRatings.reduce((acc, curr) => acc + Number(curr.rating), 0) / taskRatings.length;
//           return { employeeId: empId, averageRating: avg.toFixed(2), details: taskRatings };
//         });

//         setGrouped(summary);
//       });
//   }, []);

//   return (
//     <div className="manager-review">
//       <h2>Employee Performance Review</h2>
//       {grouped.map(emp => (
//         <div key={emp.employeeId} className="review-card">
//           <h3>Employee: {emp.employeeId}</h3>
//           <p><b>Average Rating:</b> {emp.averageRating}</p>
//           <ul>
//             {emp.details.map((r, i) => (
//               <li key={i}>{r.title}: {r.rating} ★</li>
//             ))}
//           </ul>
//         </div>
//       ))}

//       <h3>Performance Chart</h3>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={grouped} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="employeeId" />
//           <YAxis domain={[0,6]}/>
//           <Tooltip />
//           <Bar dataKey="averageRating" fill="#ff6468" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

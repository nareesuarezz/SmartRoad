// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import './NotificationTest.css'

// const SOCKET_SERVER_URL = process.env.REACT_APP_URL;
// const UserNotification = () => {
//   const [showNotificationModal, setshowNotificationModal] = useState(false);
//   const [currentNotification, setCurrentNotification] = useState('');

//   useEffect(() => {
//     const socket = io(SOCKET_SERVER_URL);

//     socket.on('globalNotification', (data) => {
//       console.log(data)
//       setCurrentNotification(data.message);
//       setshowNotificationModal(true);
//       playNotificationSound();

//       const hideModalTimeout = setTimeout(() => {
//         setshowNotificationModal(false);
//       }, 5000);

//       return () => clearTimeout(hideModalTimeout);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const playNotificationSound = () => {
//     const notificationSound = '/sounds/lego.mp3';
//     const audio = new Audio(notificationSound);
//     audio.volume = 0.4;
//     audio.play();
//   };
  





//   return (
//     <div>
//       {showNotificationModal && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <p>{currentNotification}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserNotification;

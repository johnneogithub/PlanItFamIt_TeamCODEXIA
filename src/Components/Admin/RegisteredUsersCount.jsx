import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Circle from '../Assets/circle.png';

const RegisteredUsersCount = () => {
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      const firestore = getFirestore();
      
      try {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        setRegisteredUsersCount(usersSnapshot.size);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user count:", error);
        setError("Failed to load user count");
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="col-md-4 stretch-card grid-margin unique-card">
      <div className="card" style={{
        background: 'linear-gradient(75deg,  #7F55B1, #F49BAB)',
        borderRadius: '15px',
        // boxShadow: '0 4px 20px #F49BAB',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 25px #F49BAB'
        }
      }}>
        <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
          <img src={Circle} className="card-img-absolute" alt="circle-image" style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            opacity: 0.2,
            transform: 'rotate(180deg)'
          }} />
          <h4 className="font-weight-normal mb-3" style={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            Registered Users
            <i className="bi bi-postcard-heart-fill" style={{ fontSize: '1.5rem' }}></i>
          </h4>
          {loading ? (
            <div style={{ color: 'white' }}>Loading...</div>
          ) : error ? (
            <div style={{ color: 'white' }}>{error}</div>
          ) : (
            <h2 className="mb-5" style={{ color: 'white', fontSize: '2.5rem' }}>{registeredUsersCount}</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsersCount; 
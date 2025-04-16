import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../Config/firebase"; 
import './RegisterUsersStyle.css';
// import Sidebar from '../Global/Sidebar'
import Sidebar from '../Global/Sidebar'
import { FaTrash } from 'react-icons/fa';
import UserProfilePopup from './UserProfilePopup';

const RegisterUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerms, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(null);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      const usersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Fetched user doc:", data); 

        return {
          id: doc.id,
          name: `${data.firstName || ''} ${data.middleInitial || ''} ${data.lastName || ''}`.trim(),
          location: data.location || '',
          phone: data.phone || '',
          email: data.email || '',
          age: data.age || '',
          gender: data.gender || ''
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        
        setUsers(users.filter(user => user.id !== userId));
        
        console.log(`User with ID ${userId} deleted successfully`);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.phone}`
      .toLowerCase()
      .includes(searchTerms.toLowerCase())
  );
  const handleClosePopup = () => {
    setShowPopup(false); 
  }
  return (
    <div className="USR-container">
      <Sidebar  isAdmin={true} />

      <div className="USR-header">
        <h2>Registered Users {users.length}</h2>
        <p>View all registered users in the system</p>
      </div>

      <div className="USR-search">
        <input
        type="text"
        placeholder="Search Name or Email" 
        value={searchTerms}       
        onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="USR-no-data">Loading users...</div>
      ) : (
        <table className="USR-table"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="USR-no-data">
                  No registered users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}      onClick={() => setShowPopup(user)} >
                  {showPopup && (
                    
                    <UserProfilePopup
                      user={showPopup}
                      onClose={handleClosePopup}
                    />
                  ) }
                  <td>{user.name}</td>
                  <td>{user.location}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>{user.gender}</td>
                  <td>
                    <button 
                      className="USR-delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {showPopup &&(
        <UserProfilePopup
          user={showPopup}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default RegisterUsers;

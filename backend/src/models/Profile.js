import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://your-backend.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Status:</strong> <span style={{color: 'green'}}>Active</span></p>
    </div>
  );
};

export default Profile;
import { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nationalId: '', fullName: '', dateOfBirth: '', password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', formData);
      alert(`Registered successfully. Your DID: ${res.data.did}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input type="text" name="nationalId" placeholder="National ID" onChange={handleChange} required />
      <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
      <input type="date" name="dateOfBirth" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit" className="bg-emerald-500 text-white p-2 rounded">Register</button>
    </form>
  );
};

export default Register;

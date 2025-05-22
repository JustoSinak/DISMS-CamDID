import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ nationalId: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      alert(`Login successful. Welcome ${res.data.fullName}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 p-4">
      <input type="text" name="nationalId" placeholder="National ID" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit" className="bg-emerald-500 text-white p-2 rounded">Login</button>
    </form>
  );
};

export default Login;

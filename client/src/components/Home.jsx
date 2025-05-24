import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-emerald-100 text-slate-700 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6 text-emerald-500">Welcome to CamDID</h1>
      <p className="mb-4 text-center max-w-xl">
        A self-sovereign identity system for Cameroon's citizens, ensuring secure and decentralized identity management.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg shadow-md"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;

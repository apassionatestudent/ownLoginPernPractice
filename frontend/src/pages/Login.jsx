import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  // get login credentials 
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // to enable going to certain routes 

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents def behavior of page when it's refreshing 
    try {
      const res = await axios.post("/api/auth/login", form);
      setUser(res.data.user); // after the response, set user to be the data of this res 
      navigate("/"); // if user => logs in, then go to home page 
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl mb-6 font-bold text-center text-gray-800">
          Login
        </h2>
        {/* if there is err  */}
        {error && <p className="text-red-500 mb-4">{error}</p>} 
        <input
          type="email"
          placeholder="email"
          className="border p-2 w-full mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          /**
           * ...form => object spreading 
           * keeps all the fields of the 'form' as they are, then change the value of this field (email) as it's an empty string
           */
        />
        <input
          type="password"
          placeholder="password"
          className="border p-2 w-full mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 w-full">Login</button>
      </form>
    </div>
  );
};

export default Login;
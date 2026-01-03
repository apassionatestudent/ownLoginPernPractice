import { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router, // router component to handle single-page app routing 
  Routes, // container for * route components
  Route, // define => individual routes 
  Navigate, // redirect => another route 
} from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./components/NotFound";

// send cookies with every req => identify a user 
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null); // states for our users, null by def 
  const [error, setError] = useState(""); // state for the errs, empty string by def 
  const [loading, setLoading] = useState(true); // state for loading stuff 

  /**
   * We have to understand if we have a user who's logged in. 
   * or
   * We don't have a user whos logged in. 
   * 
   * We need to be able to control that. We need to req to our backend. Util useEffect hook 
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get logged in user from backend 
        const res = await axios.get("/api/auth/me");
        setUser(res.data); // sets User to the data of the responae 
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser(); // call functiona
  }, []); // dependency array empty => means if we have one, it'll RUN ONLY ONCE when the comp mounts 

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {/* user state is passed here */}
      <Navbar user={user} setUser={setUser} />
      <Routes>
        {/* def route */}
        <Route path="/" element={<Home user={user} error={error} />} /> 
        
        <Route
          path="/login"
          // if user is logged in => home page, otherwise allow visit login page
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
        />

        <Route
          path="/register"
          // if user is logged in => home page, otherwise allow visit register page
          element={user ? <Navigate to="/" /> : <Register setUser={setUser} />}
        />

        {/* * => anything else not defined as a route, not found  */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
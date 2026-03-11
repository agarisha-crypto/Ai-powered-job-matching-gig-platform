import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fullName, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("passwordHash", passwordHash);
      formData.append("phoneNumber", phoneNumber);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      console.log("Sending registration data");

      const res = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Register success:", res.data);

      if (res.data?.data) {
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.status === 409) {
        setError("User with this email or username already exists.");
      } else if (err.response?.status === 400) {
        setError("Please fill all required fields.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (!err.response) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Register</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="register-form" onSubmit={handleRegister}>
          <input
            className="register-input"
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="register-input"
            type="text"
            placeholder="Username"
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="register-input"
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="register-input"
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="register-input"
            type="text"
            placeholder="Phone Number"
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <input
            className="register-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />

          <button className="register-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="register-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
}

export default Register;

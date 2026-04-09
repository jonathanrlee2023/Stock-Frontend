import React, { useState } from "react";
import { COLORS } from "../constants/Colors";

const Register: React.FC<{ onBackToLogin: () => void }> = ({
  onBackToLogin,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert("Registration successful! Please log in.");
        onBackToLogin();
      } else {
        const error = await response.text();
        alert(`Registration failed: ${error}`);
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 login-container">
      <div
        className="card p-4 login-card"
        style={{
          width: "380px",
          border: `1px solid ${COLORS.borderColor}`,
          boxShadow: `0 4px 8px ${COLORS.loginShadowColor}`,
        }}
      >
        <h3
          className="card-title text-center mb-4"
          style={{ letterSpacing: "0.1em", color: COLORS.mainFontColor }}
        >
          Initialize Account
        </h3>

        <form onSubmit={handleRegister}>
          {/* Identity Field */}
          <div className="mb-3">
            <label
              className="form-label small text-uppercase fw-bold"
              style={{ color: COLORS.secondaryTextColor }}
            >
              Set Username
            </label>
            <input
              type="text"
              className="search-bar"
              placeholder="NEW_IDENTITY"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>
          <div className="mb-3">
            <label
              className="form-label small text-uppercase fw-bold"
              style={{ color: COLORS.secondaryTextColor }}
            >
              SET PASSWORD
            </label>
            <input
              type="password"
              className="search-bar"
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label
              className="form-label small text-uppercase fw-bold"
              style={{ color: COLORS.secondaryTextColor }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              className="search-bar"
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          {/* High-Contrast Action Button */}
          <button
            type="submit"
            className="btn-sleek btn-sleek-green w-100 mb-3"
          >
            CREATE ACCESS
          </button>

          {/* Subtle Navigation Button */}
          <button
            type="button"
            className="btn-sleek btn-sleek-dark w-100"
            style={{ fontSize: "11px", height: "35px" }}
            onClick={onBackToLogin}
          >
            RETURN TO TERMINAL
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

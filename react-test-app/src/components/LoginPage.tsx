import React, { useState } from "react";

interface LoginProps {
  onLogin: (userId: number) => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user_id);
      } else {
        const errorText = await response.text();
        alert(`Login failed: ${errorText}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Could not connect to the backend.");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 login-container">
      <div
        className="card p-4 login-card"
        style={{
          width: "380px",
          border: "1px solid #333",
          boxShadow: "0 4px 8px rgba(255, 255, 255, 0.5)",
        }}
      >
        <h3
          className="card-title text-center mb-4"
          style={{ letterSpacing: "0.15em", color: "#ffffff" }}
        >
          Quantae Divitiae
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="mb-4">
            <label
              className="form-label small text-uppercase fw-bold"
              style={{ color: "#7e7cf3" }}
            >
              Username
            </label>
            <input
              type="text"
              className="search-bar"
              placeholder="ENTER USERNAME"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              style={{ borderRadius: "4px" }}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              className="form-label small text-uppercase fw-bold"
              style={{ color: "#7e7cf3" }}
            >
              Password
            </label>
            <input
              type="password"
              className="search-bar"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              style={{ borderRadius: "4px" }}
              required
            />
          </div>

          {/* High-Contrast Primary Action */}
          <button type="submit" className="btn-sleek w-100 mb-3">
            SIGN IN
          </button>

          {/* Low-Contrast Secondary Action */}
          <div className="text-center">
            <button
              type="button"
              className="btn-sleek btn-sleek-dark w-100"
              style={{
                fontSize: "11px",
                height: "35px",
                letterSpacing: "0.05em",
              }}
              onClick={onGoToRegister}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

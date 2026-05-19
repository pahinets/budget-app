import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-content">
          {/* Logo */}
          <div className="login-header">
            <div className="login-logo">
              <Wallet style={{color: 'white', width: 40, height: 40}} />
            </div>
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Manage your budget with precision.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" style={{width: 20, height: 20}} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" style={{width: 20, height: 20}} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="form-link">Forgot password?</a>
            </div>

            <button
              disabled={loading}
              className="submit-btn"
            >
              {loading ? <Loader2 className="spin-icon" style={{width: 20, height: 20}} /> : "Sign In"}
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?{" "}
            <a href="#" className="form-link">Create Account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

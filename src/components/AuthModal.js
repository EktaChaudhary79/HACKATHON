import "./AuthModal.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AuthModal({ onClose }) {
  const { signup, login } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const isValidGmail = (email) => email.endsWith("@gmail.com");

  const handleSubmit = () => {
    try {
      if (isSignup) {
        if (
          !form.name ||
          !form.email ||
          !form.mobile ||
          !form.password
        ) {
          setError("All fields are required");
          return;
        }

        if (!isValidGmail(form.email)) {
          setError("Email must end with @gmail.com");
          return;
        }

        if (form.mobile.length !== 10) {
          setError("Mobile number must be 10 digits");
          return;
        }

        signup(form);
      } else {
        if (!form.email || !form.password) {
          setError("Email and password are required");
          return;
        }

        if (!isValidGmail(form.email)) {
          setError("Email must end with @gmail.com");
          return;
        }

        login(form.email, form.password);
      }

      setError("");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <h2>{isSignup ? "Sign Up" : "Sign In"}</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {isSignup && (
          <>
            <input
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Mobile Number *"
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </>
        )}

        <input
          placeholder="Email (@gmail.com) *"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password *"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button onClick={handleSubmit}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p
          className="auth-toggle"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
        >
          {isSignup
            ? "Already have an account? Sign In"
            : "New here? Sign Up"}
        </p>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AuthModal;

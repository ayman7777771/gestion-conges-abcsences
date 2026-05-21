import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../App.css";
import "./Login.css";
import logo from "../../assets/images/CHU_logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isFormInvalid = useMemo(() => {
    return !isEmailValid || password.length < 6;
  }, [isEmailValid, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await login(email, password);
      if (userData) {
        toast.success("Connexion réussie !");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "Erreur de connexion au serveur";
      setError(serverMessage);
      toast.error(serverMessage, {
        duration: 7000,
        className: "custom-error-toast",
        iconTheme: {
          primary: "#fdf2f2",
          secondary: "#dc3545",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusIcon = () => {
    if (error && email) return <XCircle size={18} className="text-danger" />;
    if (!email) return <Mail size={18} />;
    return isEmailValid ? (
      <CheckCircle2 size={18} className="text-success" />
    ) : (
      <AlertCircle size={18} className="text-warning" />
    );
  };

  return (
    <div className="login-container">
      <div className="login-card shadow-lg">
        <div className="text-center">
          <img src={logo} alt="logo" className="logo" />
          <h4 className="system-title">Système de Gestion des Congés</h4>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="input-group-custom">
              <span className="input-icon">{renderStatusIcon()}</span>
              <input
                type="email"
                className={`form-control-custom ${
                  error
                    ? "is-invalid"
                    : email
                      ? isEmailValid
                        ? "is-valid"
                        : "is-warning"
                      : ""
                }`}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>
          </div>

          <div className="input-group-custom mb-2">
            <span className="input-icon">
              <Lock size={18} />
            </span>
            <input
              type="password"
              className="form-control-custom"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-end mb-3">
            <a href="#" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="rem"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label label-remember" htmlFor="rem">
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading || isFormInvalid}
          >
            {loading ? (
              <Loader2 className="spinner-icon" size={20} />
            ) : (
              "SE CONNECTER"
            )}
          </button>
        </form>
      </div>
      <div className="login-footer">
        <p>Pour toute assistance, veuillez contacter le département RH</p>
        <p className="copyright">© 2026 CHU HASSAN II - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Login;

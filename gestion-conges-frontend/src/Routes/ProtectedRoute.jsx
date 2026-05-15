import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();

    if (loading) return null;

    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
import { createContext, useEffect, useState } from "react";
import api from "../api/axios.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", {
            email,
            password,
        });

        const accessToken = res.data.access_token;

        setToken(accessToken);
        localStorage.setItem("ACCESS_TOKEN", accessToken);

        await fetchUser();
    };

    const fetchUser = async () => {
        try {
            const res = await api.get("/me");
            setUser(res.data);
        } catch {
            logout();
        }
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
        setToken(null);
        localStorage.removeItem("ACCESS_TOKEN");
    };

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
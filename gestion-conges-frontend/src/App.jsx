import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./Pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/Layouts/MainLayout";
import NewLeaveRequest from "./Pages/NewLeaveRequest";
import LeaveTypeManagement from "./Pages/Admin/Leavetypemanagement";
import { Toaster } from "react-hot-toast";
import UserManagement from "./Pages/Admin/Usermanagement";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {" "}
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-request" element={<NewLeaveRequest />} />
            <Route path="/users" element={<UserManagement/>} />
            <Route path="/leave-types" element={<LeaveTypeManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

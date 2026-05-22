import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./Pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/Layouts/MainLayout";
import UserManagement from "./Pages/Admin/Usermanagement";
import NewLeaveRequest from "./Pages/NewLeaveRequest";
import LeaveTypeManagement from "./Pages/Admin/Leavetypemanagement";
import Export from "./Pages/Admin/Export";
import TeamRequests from "./Pages/Manager/Teamrequests";
import MyRequests from "./Pages/Myrequests";
import Calendar from "./Pages/Manager/Calendar";

import { Toaster } from "react-hot-toast";

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
            <Route path="/users" element={<UserManagement />} />
            <Route path="/leave-types" element={<LeaveTypeManagement />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/team-requests" element={<TeamRequests />} />
            <Route path="/export" element={<Export />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import "./UserManagement.css";

const UserModal = ({
  show,
  onClose,
  onSuccess,
  editingId,
  editingUser,
  departments,
  managers,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department_id: "",
    manager_id: "",
  });

  useEffect(() => {
    if (show) {
      if (editingUser) {
        setForm({
          name: editingUser.name || "",
          email: editingUser.email || "",
          password: "",
          role: editingUser.role || "employee",
          department_id: editingUser.department_id || "",
          manager_id: editingUser.manager_id || "",
        });
      } else {
        resetForm();
      }
    }
  }, [show, editingUser]);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "employee",
      department_id: "",
      manager_id: "",
    });
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.email || !form.role || !form.department_id) {
        toast.error("Remplissez tous les champs");
        return;
      }

      if (!editingId && !form.password) {
        toast.error("Mot de passe requis");
        return;
      }

      const data = { ...form };
      if (editingId && !form.password) delete data.password;

      const res = editingId
        ? await api.put(`/users/${editingId}`, data)
        : await api.post("/users", data);

      toast.success(res.data.message);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  if (!show) return null;

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-header">
          <h2>{editingId ? "Modifier" : "Nouvel utilisateur"}</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="um-form">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom"
          />

          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={form.department_id}
            onChange={(e) =>
              setForm({ ...form, department_id: e.target.value })
            }
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={form.manager_id}
            onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
          >
            <option value="">Manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="um-modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>{editingId ? "Update" : "Create"}</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
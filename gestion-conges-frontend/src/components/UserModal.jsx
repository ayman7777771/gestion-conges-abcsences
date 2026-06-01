import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import "../Pages/Admin/UserManagement.css";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  department_id: "",
  manager_id: "",
};

export default function UserModal({
  show,
  onClose,
  onSuccess,
  editingId,
  editingUser,
  departments = [],
  managers = [],
}) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = Boolean(editingId);

  useEffect(() => {
    if (!show) return;
    setForm(
      editingUser
        ? {
            ...emptyForm,
            name: editingUser.name || "",
            email: editingUser.email || "",
            role: editingUser.role || "employee",
            department_id: editingUser.department_id || "",
            manager_id: editingUser.manager_id || "",
          }
        : emptyForm,
    );
  }, [show, editingUser]);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.email || !form.role || !form.department_id) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }

    if (!isEditing && !form.password) {
      toast.error("Mot de passe requis");
      return;
    }

    try {
      const payload = { ...form };
      if (isEditing && !payload.password) delete payload.password;
      if (!payload.manager_id) payload.manager_id = null;

      const res = isEditing ? await api.put(`/users/${editingId}`, payload) : await api.post("/users", payload);
      toast.success(res.data.message || (isEditing ? "Utilisateur mis à jour." : "Utilisateur créé."));
      onSuccess();
      onClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      errors ? Object.values(errors).flat().forEach((msg) => toast.error(msg)) : toast.error(err.response?.data?.message || "Erreur");
    }
  };

  if (!show) return null;

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(event) => event.stopPropagation()}>
        <div className="um-modal-header">
          <h2>{isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
          <button className="um-modal-close" onClick={onClose} type="button">×</button>
        </div>

        <div className="um-form">
          {[
            ["name", "Nom", "text"],
            ["email", "Email", "email"],
            ["password", isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe", "password"],
          ].map(([field, label, type]) => (
            <label className="um-form-group" key={field}>
              <span>{label}</span>
              <input className="form-control" type={type} value={form[field]} onChange={update(field)} />
            </label>
          ))}

          <label className="um-form-group">
            <span>Rôle</span>
            <select className="form-select" value={form.role} onChange={update("role")}>
              <option value="employee">Employé</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="um-form-group">
            <span>Département</span>
            <select className="form-select" value={form.department_id} onChange={update("department_id")}>
              <option value="">Choisir un département</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label className="um-form-group">
            <span>Manager</span>
            <select className="form-select" value={form.manager_id || ""} onChange={update("manager_id")}>
              <option value="">Aucun manager</option>
              {managers
                .filter((manager) => manager.id !== editingId)
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
            </select>
          </label>
        </div>

        <div className="um-modal-footer">
          <button className="btn btn-light" onClick={onClose} type="button">Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} type="button">
            {isEditing ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

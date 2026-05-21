import "./UserManagement.css";
const UserModal = ({
  show,
  onClose,
  form,
  setForm,
  onSave,
  editingId,
  departments,
  managers
}) => {
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
            onChange={(e) =>
              setForm({ ...form, manager_id: e.target.value })
            }
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
          <button onClick={onSave}>
            {editingId ? "Update" : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserModal;
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown, Users } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import api from "../../api/axios";
import UserModal from "./UserModal";
import "./Usermanagement.css";
import Select from "react-select";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [balances, setBalances] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department_id: "",
    manager_id: "",
  });
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    department_id: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        ...(filters.name && { name: filters.name }),
        ...(filters.role && { role: filters.role }),
        ...(filters.department_id && {
          department_id: filters.department_id,
        }),
      });

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
      const depts = [
        ...new Map(
          res.data.data.map((u) => [u.department?.id, u.department]),
        ).values(),
      ].filter(Boolean);
      const mngrs = res.data.data.filter((u) => u.role === "manager");
      setDepartments(depts);
      setManagers(mngrs);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur au chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/balances`);
      console.log(res.data);
      setBalances((prev) => ({ ...prev, [userId]: res.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur chargement soldes");
    }
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
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department_id: user.department_id,
      manager_id: user.manager_id || "",
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/users/${id}`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const toggleExpand = (userId) => {
    if (expandedId === userId) {
      setExpandedId(null);
    } else {
      setExpandedId(userId);
      if (!balances[userId]) fetchBalances(userId);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "employee",
      department_id: "",
      manager_id: "",
    });
    setEditingId(null);
    setShowModal(false);
  };
  const roleOptions = [
    { value: "", label: "Tous les rôles" },
    { value: "employee", label: "Employee" },
    { value: "manager", label: "Manager" },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="um-container">
        <div style={{ marginBottom: "20px" }}>
          <Skeleton height={40} width={300} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={60} style={{ marginBottom: "10px" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="um-container">
      <div className="um-header">
        <h1>
          <Users size={33} color="blue" />
        </h1>
        <button
          className="um-btn um-btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="um-table-wrapper">
        {users.length === 0 ? (
          <div className="um-empty">Aucun utilisateur</div>
        ) : (
          <div>
            <div className="um-filters">
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={filters.name}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    name: e.target.value,
                  })
                }
              />

              <Select
                placeholder="Filtrer par rôle"
                options={roleOptions}
                value={roleOptions.find((r) => r.value === filters.role)}
                onChange={(selected) =>
                  setFilters({
                    ...filters,
                    role: selected.value,
                  })
                }
              />
              <Select
                placeholder="Filtrer par département"
                options={[
                  { value: "", label: "Tous les départements" },
                  ...departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  })),
                ]}
                value={[
                  { value: "", label: "Tous les départements" },
                  ...departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  })),
                ].find((d) => d.value === filters.department_id)}
                onChange={(selected) =>
                  setFilters({
                    ...filters,
                    department_id: selected.value,
                  })
                }
              />
            </div>
            <table className="um-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Département</th>
                  <th>Manager</th>
                  <th style={{ width: "50px" }}>Soldes</th>
                  <th style={{ width: "80px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user) => user.role !== "admin")
                  .map((user) => (
                    <React.Fragment key={user.id}>
                      <tr
                        className={
                          expandedId === user.id ? "um-row-expanded" : ""
                        }
                      >
                        <td className="flex">
                          <div className="employee-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="employee-name">{user?.name}</span>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`um-badge um-badge-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.department?.name || "-"}</td>
                        <td>
                          {managers.find((m) => m.id === user.manager_id)
                            ?.name || "-"}
                        </td>
                        <td>
                          <button
                            className="um-expand-btn"
                            onClick={() => toggleExpand(user.id)}
                          >
                            <ChevronDown
                              size={18}
                              style={{
                                transform:
                                  expandedId === user.id
                                    ? "rotate(180deg)"
                                    : "",
                                transition: "transform 0.2s",
                              }}
                            />
                          </button>
                        </td>
                        <td>
                          <div className="um-actions">
                            <button
                              className="um-btn um-btn-edit"
                              onClick={() => handleEdit(user)}
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="um-btn um-btn-delete"
                              onClick={() =>
                                window.confirm(`Supprimer ${user.name} ?`) &&
                                handleDelete(user.id)
                              }
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === user.id && (
                        <tr className="um-expand-row">
                          <td colSpan="7">
                            <div className="um-balances">
                              {balances[user.id] ? (
                                balances[user.id].length === 0 ? (
                                  <p>Aucun solde</p>
                                ) : (
                                  <table className="um-balance-table">
                                    <thead>
                                      <tr>
                                        <th>Type</th>
                                        <th>Quota</th>
                                        <th>Utilisé</th>
                                        <th>Restant</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {balances[user.id].map((b) => (
                                        <tr key={b.id}>
                                          <td>{b.leave_type?.name}</td>
                                          <td>{b.quota}</td>
                                          <td>{b.used}</td>
                                          <td className="um-balance-remaining">
                                            {b.remaining}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )
                              ) : (
                                <Skeleton height={40} count={3} />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pagination.last_page > 1 && (
        <div className="um-pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </button>
          <span>
            Page {page} / {pagination.last_page}
          </span>
          <button
            disabled={page === pagination.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      )}
      <UserModal
        show={showModal}
        onClose={resetForm}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        editingId={editingId}
        departments={departments}
        managers={managers}
      />
    </div>
  );
};

export default UserManagement;

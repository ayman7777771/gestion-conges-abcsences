import React, { useState, useEffect } from 'react';
import { Plus,FileStack, Edit2, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from 'react-hot-toast';
import './Leavetypemanagement.css';

const LeaveTypeManagement = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    default_quota: '',
    is_paid: true,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave-types');
      setTypes(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || form.default_quota === '') {
        toast.error('Remplissez tous les champs');
        return;
      }

      if (editingId) {
        const res = await api.put(`/leave-types/${editingId}`, form);
        toast.success(res.data.message || 'Type mis à jour');
      } else {
        const res = await api.post('/leave-types', form);
        toast.success(res.data.message || 'Type créé');
      }

      resetForm();
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (type) => {
    setForm({
      name: type.name,
      default_quota: type.default_quota,
      is_paid: type.is_paid,
    });
    setEditingId(type.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;

    try {
      const res = await api.delete(`/leave-types/${id}`);
      toast.success(res.data.message || 'Type supprimé');
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setForm({ name: '', default_quota: '', is_paid: true });
    setEditingId(null);
    setShowModal(false);
  };

 if (loading && types.length === 0) {
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
    <div className="lt-container">

      <div className="lt-header">
        <h1><FileStack size={33} /></h1>
        <button
          className="lt-btn lt-btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nouveau type
        </button>
      </div>

      <div className="lt-table-wrapper">
        {types.length === 0 ? (
          <div className="lt-empty">Aucun type de congé</div>
        ) : (
          <table className="lt-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Quota défaut</th>
                <th>Rémunéré</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {types.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>{type.default_quota} jours</td>
                  <td>
                    <span className={`lt-badge ${type.is_paid ? 'lt-paid' : 'lt-unpaid'}`}>
                      {type.is_paid ? 'Oui' : 'Non'}
                    </span>
                  </td>

                  <td>
                    <div className="lt-actions">
                      <button onClick={() => handleEdit(type)}>
                        <Edit2 size={16} color="blue" />
                      </button>
                      <button onClick={() => handleDelete(type.id)}>
                        <Trash2 size={16} color="red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {showModal && (
        <div className="lt-modal-overlay" onClick={resetForm}>
          <div className="lt-modal" onClick={(e) => e.stopPropagation()}>

            <div className="lt-modal-header">
              <h2>{editingId ? 'Modifier' : 'Créer'}</h2>
              <button onClick={resetForm}><X size={20} /></button>
            </div>

            <div className="lt-form">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom"
              />

              <input
                type="number"
                value={form.default_quota}
                onChange={(e) =>
                  setForm({ ...form, default_quota: e.target.value })
                }
                placeholder="Quota"
              />

              <label>
                <input
                  type="checkbox"
                  checked={form.is_paid}
                  onChange={(e) =>
                    setForm({ ...form, is_paid: e.target.checked })
                  }
                />
                Rémunéré
              </label>
            </div>

            <div className="lt-modal-footer">
              <button onClick={resetForm}>Annuler</button>
              <button onClick={handleSave}>
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypeManagement;
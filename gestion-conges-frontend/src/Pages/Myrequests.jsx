import React, { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import LeaveRequestTable from "../components/LeaveRequestTable";
import "./myrequests.css";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/my/leave-requests?${params}`);

      setRequests(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?"))
      return;

    try {
      await api.patch(`/leave-requests/${id}/cancel`);
      toast.success("Demande annulée");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  return (
    <div className="mr-container">
      <div className="mr-header">
        <div>
          <h1>Mes demandes de congé</h1>
          <p>Consultez et gérez vos demandes de congé</p>
        </div>
        <Calendar className="mr-header-icon" size={48} />
      </div>

      <div className="mr-filters">
        <div className="mr-filter-group">
          <Filter size={18} />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      <div className="mr-table-section">
        {loading ? (
          <div>
            <Skeleton height={40} count={5} />
          </div>
        ) : (
          <LeaveRequestTable
            data={requests}
            role="employee"
            loading={false}
            onCancel={handleCancel}
            pagination={pagination}
          />
        )}
      </div>

      {/* PAGINATION */}
      {pagination.last_page > 1 && (
        <div className="mr-pagination">
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
    </div>
  );
};
export default MyRequests;

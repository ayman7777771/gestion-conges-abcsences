import React, { useState, useEffect } from "react";
import { Users, Filter } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import LeaveRequestTable from "../../components/LeaveRequestTable";
import "./Teamrequests.css";

const TeamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [page, status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      if (status) params.append("status", status);

      const res = await api.get(`/team/leave-requests?${params}`);

      setRequests(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
    } catch (err) {
      toast.error("Erreur au chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, comment) => {
    try {
      console.log("BEFORE REQUEST");
      await api.patch(`/leave-requests/${id}/approve`, {
        review_comment: comment?.trim() || null,
      });
      console.log("SUCCESS:", res.data);

      toast.success("Approuvée");
      fetchRequests();
    } catch (err) {
      console.log("CATCH HIT");
      console.log("FULL ERROR:", err);

      console.log("RESPONSE:", err.response);

      toast.error("Erreur");
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error("Erreur");
      }
    }
  };

  const handleReject = async (id, comment) => {
    try {
      await api.patch(`/leave-requests/${id}/reject`, {
        review_comment: comment?.trim(),
      });

      toast.success("Refusée");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="tr-container">
      <div className="tr-header">
        <div>
          <h1>Demandes de congé de l'équipe</h1>
          <p>Examinez et validez les demandes de congé de votre équipe</p>
        </div>
        <Users className="tr-header-icon" size={48} />
      </div>

      <div className="tr-filters">
        <div className="tr-filter-group">
          <Filter size={18} />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
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

      <div className="tr-table-section">
        <LeaveRequestTable
          data={requests}
          role="manager"
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          pagination={pagination}
        />
      </div>

      {pagination.last_page > 1 && (
        <div className="tr-pagination">
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

export default TeamRequests;

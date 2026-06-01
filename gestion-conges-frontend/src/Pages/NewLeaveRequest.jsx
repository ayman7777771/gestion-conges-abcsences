import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../api/axios";
import "./NewLeaveRequest.css";
import {
  Calendar,
  CalendarDays,
  Clock,
  AlertCircle,
  Send,
  CalendarRange,
} from "lucide-react";
import toast from "react-hot-toast";

const NewLeaveRequest = ({ onSuccess }) => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [typesRes, balancesRes] = await Promise.all([
        api.get("/leave-types"),
        api.get("/my/balances"),
      ]);

      setLeaveTypes(typesRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des données",
        {
          duration: 7000,
          className: "custom-error-toast",
          iconTheme: {
            primary: "#fdf2f2",
            secondary: "#dc3545",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const days = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;

    let working = 0;
    let current = new Date(form.start_date);
    const end = new Date(form.end_date);

    while (current <= end) {
      const day = current.getDay();

      if (day !== 0 && day !== 6) {
        working++;
      }

      current.setDate(current.getDate() + 1);
    }

    const total =
      Math.floor((end - new Date(form.start_date)) / (1000 * 60 * 60 * 24)) + 1;

    return { total, working };
  }, [form.start_date, form.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      toast.error("Veuillez remplir tous les champs obligatoires.", {
        duration: 7000,
        className: "custom-error-toast",

        iconTheme: {
          primary: "#fdf2f2",
          secondary: "#dc3545",
        },
      });
      return;
    }

    try {
      setSubmitting(true);

      const res= await api.post("/leave-requests", {
        leave_type_id: parseInt(form.leave_type_id),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || null,
      });

      toast.success(res.data.message || "Demande de congé créée avec succès !");
      setForm({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      await fetchInitialData();
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors).flat();
        messages.forEach((msg) =>
          toast.error(msg, {
            duration: 7000,
            className: "custom-error-toast",
            iconTheme: {
              primary: "#fdf2f2",
              secondary: "#dc3545",
            },
          }),
        );
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          duration: 7000,
          className: "custom-error-toast",
          iconTheme: {
            primary: "#fdf2f2",
            secondary: "#dc3545",
          },
        });
      } else {
        toast.error("Erreur lors de la création de la demande", {
          duration: 7000,
          className: "custom-error-toast",
          iconTheme: {
            primary: "#fdf2f2",
            secondary: "#dc3545",
          },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  const selectedBalance = balances.find(
    (b) => b.leave_type_id === parseInt(form.leave_type_id),
  );
  const today = new Date().toISOString().split("T")[0];

return (
  <div className="leave-container">

    {loading ? (
      <div className="lv-form">
        <Skeleton height={20} width="40%" style={{ marginBottom: "20px" }} />
        <Skeleton height={100} style={{ marginBottom: "20px" }} />

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Skeleton height={80} width="50%" />
          <Skeleton height={80} width="50%" />
        </div>

        <Skeleton height={50} style={{ marginBottom: "15px" }} />

        <div style={{ display: "flex", gap: "10px" }}>
          <Skeleton height={50} width="50%" />
          <Skeleton height={50} width="50%" />
        </div>
      </div>
    ) : (
      <>
        <div className="lv-header">
          <div>
            <p>Remplissez le formulaire ci-dessous pour créer une demande</p>
          </div>
          <Calendar className="header-icon" size={48} />
        </div>

        <div className="lv-balance-card">
          <div className="balance-top">
            <h3>
              {selectedBalance
                ? selectedBalance.leave_type?.name
                : "Type de congé non sélectionné"}
            </h3>
            <Clock size={20} />
          </div>

          <div className="balance-content">
            <div className="balance-item">
              <span className="label">Solde disponible</span>
              <span className="value">
                {selectedBalance?.remaining ?? 0}{" "}
                {selectedBalance?.remaining === 1 ? "jour" : "jours"}
              </span>
            </div>
          </div>
        </div>

        <div className="lv-summary">
          <div className="summary-box">
            <CalendarDays size={18} className="summary-icon" />
            <div>
              <p className="summary-label">Total</p>
              <p className="summary-value">
                {days?.total ?? 0} {days?.total === 1 ? "jour" : "jours"}
              </p>
            </div>
          </div>

          <div className="summary-box">
            <CalendarRange size={18} className="summary-icon" />
            <div>
              <p className="summary-label">Jours ouvrables</p>
              <p
                className={`summary-value ${
                  days?.working > selectedBalance?.remaining ? "error" : "success"
                }`}
              >
                {days?.working ?? 0} {days?.working === 1 ? "jour" : "jours"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lv-form">

          <div className="lv-form-group">
            <label>
              Type de congé <span className="required">*</span>
            </label>

            <Select
              options={leaveTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              value={
                leaveTypes
                  .map((type) => ({ value: type.id, label: type.name }))
                  .find((o) => o.value === Number(form.leave_type_id)) || null
              }
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  leave_type_id: selected?.value || "",
                }))
              }
              placeholder="Sélectionnez un type de congé..."
              isDisabled={submitting}
              className={errors.leave_type_id ? "error" : ""}
            />
          </div>

          <div className="lv-form-row">
            <div className="lv-form-group">
              <label>Du *</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                disabled={submitting}
                className={errors.start_date || errors.balance ? "error" : ""}
                min={today}
              />
            </div>

            <div className="lv-form-group">
              <label>Au *</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                disabled={submitting}
                className={errors.end_date || errors.balance ? "error" : ""}
                min={form.start_date || today}
              />
            </div>
          </div>

          <div className="lv-form-group">
            <label>Motif (optionnel)</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows="3"
              disabled={submitting}
            />
          </div>

          <button type="submit" className="lv-btn-submit" disabled={submitting}>
            <Send size={18} />
            {submitting ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>

        <div className="lv-info-box">
          <div className="info-header">
            <AlertCircle size={20} />
            <h4>Remarque importante</h4>
          </div>

          <ul className="info-list">
            <li>Impossible de créer une demande si le solde est insuffisant</li>
            <li>Impossible de créer une demande qui chevauche un congé existant</li>
          </ul>
        </div>
      </>
    )}
  </div>
);
};

export default NewLeaveRequest;

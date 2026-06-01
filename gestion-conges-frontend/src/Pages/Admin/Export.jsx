import React, { useState } from 'react';
import { Download, FileText, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import './Export.css';
 
const Export = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      if (!fromDate || !toDate) {
        setError('Veuillez sélectionner une période');
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        setError('La date de début doit être antérieure à la date de fin');
        return;
      }

      setLoading(true);
      const response = await api.get('/admin/export', {
        params: { from: fromDate, to: toDate },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `conges_${fromDate}_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Export réussi!');
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'export');
      toast.error('Erreur lors de l\'export');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="exp-container">
      <div className="exp-header">
        <div>
          <p>Téléchargez les demandes de congé approuvées en CSV</p>
        </div>
        <FileText className="exp-header-icon" size={48} />
      </div>

      {error && (
        <div className="exp-alert exp-alert-error">
          {error}
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      <div className="exp-card">
        <div className="exp-filters">
          <div className="exp-form-group">
            <label>Date de début</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || today}
              disabled={loading}
            />
          </div>

          <div className="exp-form-group">
            <label>Date de fin</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              max={today}
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || !fromDate || !toDate}
          className="exp-btn-export"
        >
          <Download size={20} />
          {loading ? 'Téléchargement...' : 'Télécharger CSV'}
        </button>
      </div>

      <div className="exp-notes">
        <h3>Format du fichier</h3>
        <div className="exp-columns">
          <div className="exp-col">
            <p className="exp-col-title">Colonnes exportées:</p>
            <ul>
              <li>Employé</li>
              <li>Département</li>
              <li>Type de congé</li>
              <li>Date début</li>
              <li>Date fin</li>
              <li>Jours</li>
              <li>Statut</li>
            </ul>
          </div>
          <div className="exp-col">
            <p className="exp-col-title">Spécifications:</p>
            <ul>
              <li>Format: CSV</li>
              <li>Séparateur: virgule</li>
              <li>En-têtes: inclus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
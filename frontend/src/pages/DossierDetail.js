import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dossierAPI, rapportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiDownload, FiFileText, FiEdit2, FiSave, FiX, FiTable } from 'react-icons/fi';

const DossierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ diagnostic: '', traitement: '' });

  useEffect(() => { loadDossier(); }, [id]);

  const loadDossier = async () => {
    try {
      const { data } = await dossierAPI.getById(id);
      setDossier(data);
      setForm({ diagnostic: data.diagnostic || '', traitement: data.traitement || '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await dossierAPI.update(id, form);
      toast.success('Dossier modifié avec succès');
      setEditing(false);
      loadDossier();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleGenerateReport = async () => {
    try {
      await rapportAPI.generate({ dossierId: parseInt(id) });
      toast.success('Rapport PDF généré avec succès');
      loadDossier();
    } catch (error) {
      toast.error('Erreur de génération du rapport');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await dossierAPI.exportCSV(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dossier_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export CSV téléchargé');
    } catch (error) {
      toast.error('Erreur d\'export CSV');
    }
  };

  const handleDownload = async (rapportId) => {
    try {
      const response = await rapportAPI.download(rapportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${rapportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erreur de téléchargement');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!dossier) return <div className="empty-state"><p>Dossier non trouvé</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/dossiers')} style={{ marginRight: 12 }}>
            <FiArrowLeft />
          </button>
          Dossier #{dossier.idDossier}
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {user?.role === 'medecin' && (
            <>
              {!editing && (
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  <FiEdit2 /> Modifier
                </button>
              )}
              <button className="btn btn-outline" onClick={handleExportCSV}>
                <FiTable /> Exporter CSV
              </button>
              <button className="btn btn-success" onClick={handleGenerateReport}>
                <FiFileText /> Générer PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Informations du patient</h3></div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Patient</label>
            <p>{dossier.patient?.nom} {dossier.patient?.prenom}</p>
          </div>
          <div className="detail-item">
            <label>Date de création</label>
            <p>{dossier.dateCreation}</p>
          </div>
          <div className="detail-item">
            <label>Médecin</label>
            <p>{dossier.medecinDossier ? `Dr. ${dossier.medecinDossier.nom} ${dossier.medecinDossier.prenom}` : '-'}</p>
          </div>
          {dossier.medecinDossier?.specialite && (
            <div className="detail-item">
              <label>Spécialité</label>
              <p>{dossier.medecinDossier.specialite}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Diagnostic & Traitement</h3>
          {editing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={handleUpdate}><FiSave /> Sauvegarder</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}><FiX /> Annuler</button>
            </div>
          )}
        </div>
        {editing ? (
          <div>
            <div className="form-group">
              <label>Diagnostic</label>
              <textarea className="form-control" value={form.diagnostic} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} rows={4} />
            </div>
            <div className="form-group">
              <label>Traitement</label>
              <textarea className="form-control" value={form.traitement} onChange={(e) => setForm({ ...form, traitement: e.target.value })} rows={4} />
            </div>
          </div>
        ) : (
          <div className="detail-grid">
            <div className="detail-item">
              <label>Diagnostic</label>
              <p style={{ whiteSpace: 'pre-wrap' }}>{dossier.diagnostic || 'Non spécifié'}</p>
            </div>
            <div className="detail-item">
              <label>Traitement</label>
              <p style={{ whiteSpace: 'pre-wrap' }}>{dossier.traitement || 'Non spécifié'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analyses */}
      <div className="card">
        <div className="card-header"><h3>Analyses de Laboratoire ({dossier.analyses?.length || 0})</h3></div>
        {dossier.analyses && dossier.analyses.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Technicien</th><th>Résultat</th><th>Interprétation</th></tr>
              </thead>
              <tbody>
                {dossier.analyses.map((a) => (
                  <tr key={a.idAnalyse}>
                    <td>{a.dateAnalyse}</td>
                    <td><strong>{a.typeAnalyse}</strong></td>
                    <td>{a.technicien ? `${a.technicien.nom} ${a.technicien.prenom}` : '-'}</td>
                    <td>{a.resultat ? <span style={{ fontWeight: 600 }}>{a.resultat.valeur} {a.resultat.unite}</span> : <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>En attente</span>}</td>
                    <td>{a.resultat?.interpretation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>Aucune analyse</p></div>
        )}
      </div>

      {/* Rapports PDF */}
      <div className="card">
        <div className="card-header"><h3>Rapports PDF ({dossier.rapports?.length || 0})</h3></div>
        {dossier.rapports && dossier.rapports.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Fichier</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {dossier.rapports.map((r) => (
                  <tr key={r.idRapport}>
                    <td>{new Date(r.dateGeneration).toLocaleString('fr-FR')}</td>
                    <td>{r.cheminFichier}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleDownload(r.idRapport)}>
                        <FiDownload /> Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>Aucun rapport généré</p></div>
        )}
      </div>
    </div>
  );
};

export default DossierDetail;

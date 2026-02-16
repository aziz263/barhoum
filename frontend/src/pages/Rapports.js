import React, { useState, useEffect } from 'react';
import { rapportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiDownload, FiTrash2, FiSearch } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const Rapports = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await rapportAPI.getAll();
      setRapports(data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
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

  const handleDelete = async (id) => {
    try {
      await rapportAPI.delete(id);
      toast.success('Rapport supprimé');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filtered = rapports.filter(r =>
    `${r.dossier?.patient?.nom || ''} ${r.dossier?.patient?.prenom || ''} ${r.cheminFichier}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Rapports PDF</h1>
      </div>

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Fichier</th><th>Médecin</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.idRapport}>
                  <td>{new Date(r.dateGeneration).toLocaleString('fr-FR')}</td>
                  <td>{r.dossier?.patient ? `${r.dossier.patient.nom} ${r.dossier.patient.prenom}` : '-'}</td>
                  <td>{r.cheminFichier}</td>
                  <td>{r.medecinRapport ? `Dr. ${r.medecinRapport.nom}` : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary" onClick={() => handleDownload(r.idRapport)}>
                        <FiDownload /> Télécharger
                      </button>
                      {['medecin', 'administrateur'].includes(user?.role) && (
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(r)}><FiTrash2 /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun rapport</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        show={!!confirmDelete}
        title="Supprimer le rapport"
        message="Voulez-vous vraiment supprimer ce rapport PDF ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete.idRapport)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Rapports;

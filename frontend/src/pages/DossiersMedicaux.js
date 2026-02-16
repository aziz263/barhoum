import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dossierAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { FiPlus, FiEye, FiTrash2, FiSearch, FiFileText } from 'react-icons/fi';

const DossiersMedicaux = () => {
  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ patientId: '', diagnostic: '', traitement: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dRes, pRes] = await Promise.all([dossierAPI.getAll(), patientAPI.getAll()]);
      setDossiers(dRes.data);
      setPatients(pRes.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dossierAPI.create(form);
      toast.success('Dossier créé');
      setShowModal(false);
      setForm({ patientId: '', diagnostic: '', traitement: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dossierAPI.delete(id);
      toast.success('Dossier supprimé');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const filtered = dossiers.filter(d =>
    `${d.patient?.nom || ''} ${d.patient?.prenom || ''} ${d.diagnostic || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dossiers Médicaux</h1>
        {user?.role === 'medecin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Nouveau Dossier
          </button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Diagnostic</th><th>Traitement</th><th>Médecin</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.idDossier}>
                  <td>{d.dateCreation}</td>
                  <td>{d.patient?.nom} {d.patient?.prenom}</td>
                  <td>{d.diagnostic ? d.diagnostic.substring(0, 50) + (d.diagnostic.length > 50 ? '...' : '') : '-'}</td>
                  <td>{d.traitement ? d.traitement.substring(0, 50) + (d.traitement.length > 50 ? '...' : '') : '-'}</td>
                  <td>{d.medecinDossier ? `Dr. ${d.medecinDossier.nom}` : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary btn-icon" onClick={() => navigate(`/dossiers/${d.idDossier}`)}><FiEye /></button>
                      {['medecin', 'administrateur'].includes(user?.role) && (
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(d)}><FiTrash2 /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun dossier</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau Dossier Médical</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                    <option value="">-- Sélectionner un patient --</option>
                    {patients.map((p) => <option key={p.idPatient} value={p.idPatient}>{p.nom} {p.prenom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Diagnostic</label>
                  <textarea className="form-control" value={form.diagnostic} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label>Traitement</label>
                  <textarea className="form-control" value={form.traitement} onChange={(e) => setForm({ ...form, traitement: e.target.value })} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!confirmDelete}
        title="Supprimer le dossier"
        message={`Êtes-vous sûr de vouloir supprimer le dossier de ${confirmDelete?.patient?.nom || ''} ${confirmDelete?.patient?.prenom || ''} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={() => handleDelete(confirmDelete.idDossier)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default DossiersMedicaux;

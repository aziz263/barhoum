import React, { useState, useEffect } from 'react';
import { signesVitauxAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const SignesVitaux = () => {
  const [signes, setSignes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ patientId: '', temperature: '', pressionArterielle: '', frequenceCardiaque: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([signesVitauxAPI.getAll(), patientAPI.getAll()]);
      setSignes(sRes.data);
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
      await signesVitauxAPI.create({
        ...form,
        temperature: parseFloat(form.temperature),
        frequenceCardiaque: parseInt(form.frequenceCardiaque),
      });
      toast.success('Mesure enregistrée');
      setShowModal(false);
      setForm({ patientId: '', temperature: '', pressionArterielle: '', frequenceCardiaque: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    try {
      await signesVitauxAPI.delete(id);
      toast.success('Mesure supprimée');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filtered = signes.filter(s =>
    `${s.patient?.nom || ''} ${s.patient?.prenom || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Signes Vitaux</h1>
        {user?.role === 'infirmier' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Nouvelle Mesure
          </button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input className="form-control" placeholder="Rechercher par patient..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Température</th><th>Pression Art.</th><th>Fréq. Card.</th><th>Infirmier</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.idSignes}>
                  <td>{new Date(s.dateMesure).toLocaleString('fr-FR')}</td>
                  <td>{s.patient?.nom} {s.patient?.prenom}</td>
                  <td>{s.temperature}°C</td>
                  <td>{s.pressionArterielle} mmHg</td>
                  <td>{s.frequenceCardiaque} bpm</td>
                  <td>{s.infirmierMesure ? `${s.infirmierMesure.nom} ${s.infirmierMesure.prenom}` : '-'}</td>
                  <td>
                    {['infirmier', 'administrateur'].includes(user?.role) && (
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(s)}><FiTrash2 /></button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucune mesure</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Mesure</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                    <option value="">-- Sélectionner --</option>
                    {patients.map((p) => <option key={p.idPatient} value={p.idPatient}>{p.nom} {p.prenom}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Température (°C) *</label>
                    <input type="number" step="0.1" className="form-control" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="37.0" required />
                  </div>
                  <div className="form-group">
                    <label>Fréquence Cardiaque (bpm) *</label>
                    <input type="number" className="form-control" value={form.frequenceCardiaque} onChange={(e) => setForm({ ...form, frequenceCardiaque: e.target.value })} placeholder="72" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Pression Artérielle *</label>
                  <input className="form-control" value={form.pressionArterielle} onChange={(e) => setForm({ ...form, pressionArterielle: e.target.value })} placeholder="120/80" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!confirmDelete}
        title="Supprimer la mesure"
        message={confirmDelete ? `Voulez-vous vraiment supprimer cette mesure de ${confirmDelete.patient?.nom || ''} ${confirmDelete.patient?.prenom || ''} ?` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete.idSignes)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default SignesVitaux;

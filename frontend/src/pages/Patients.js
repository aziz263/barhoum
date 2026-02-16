import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, utilisateurAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [infirmiers, setInfirmiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', telephone: '', adresse: '', medecinId: '', infirmierId: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, mRes, iRes] = await Promise.all([
        patientAPI.getAll(),
        utilisateurAPI.getAll({ role: 'medecin' }),
        utilisateurAPI.getAll({ role: 'infirmier' }),
      ]);
      setPatients(pRes.data);
      setMedecins(mRes.data);
      setInfirmiers(iRes.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await patientAPI.update(editing.idPatient, form);
        toast.success('Patient modifié');
      } else {
        await patientAPI.create(form);
        toast.success('Patient ajouté');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', telephone: '', adresse: '', medecinId: '', infirmierId: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (patient) => {
    setEditing(patient);
    setForm({
      nom: patient.nom, prenom: patient.prenom,
      dateNaissance: patient.dateNaissance, sexe: patient.sexe,
      telephone: patient.telephone || '', adresse: patient.adresse || '',
      medecinId: patient.medecinId || '', infirmierId: patient.infirmierId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await patientAPI.delete(id);
      toast.success('Patient supprimé');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = ['medecin', 'infirmier', 'administrateur'].includes(user?.role);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Patients</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', telephone: '', adresse: '', medecinId: '', infirmierId: '' }); setShowModal(true); }}>
            <FiPlus /> Nouveau Patient
          </button>
        )}
      </div>

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input
            className="form-control"
            placeholder="Rechercher un patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de naissance</th>
                <th>Sexe</th>
                <th>Téléphone</th>
                <th>Médecin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.idPatient}>
                  <td>{p.nom}</td>
                  <td>{p.prenom}</td>
                  <td>{p.dateNaissance}</td>
                  <td><span className={`badge badge-${p.sexe}`}>{p.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></td>
                  <td>{p.telephone || '-'}</td>
                  <td>{p.medecin ? `Dr. ${p.medecin.nom}` : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary btn-icon" onClick={() => navigate(`/patients/${p.idPatient}`)} title="Voir"><FiEye /></button>
                      {canEdit && <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleEdit(p)} title="Modifier"><FiEdit2 /></button>}
                      {['medecin', 'administrateur'].includes(user?.role) && <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(p)} title="Supprimer"><FiTrash2 /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun patient trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier Patient' : 'Nouveau Patient'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom *</label>
                    <input className="form-control" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input className="form-control" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date de naissance *</label>
                    <input type="date" className="form-control" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Sexe *</label>
                    <select className="form-control" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input className="form-control" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Adresse</label>
                    <input className="form-control" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Médecin</label>
                    <select className="form-control" value={form.medecinId} onChange={(e) => setForm({ ...form, medecinId: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      {medecins.map((m) => <option key={m.idUtilisateur} value={m.idUtilisateur}>Dr. {m.nom} {m.prenom}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Infirmier</label>
                    <select className="form-control" value={form.infirmierId} onChange={(e) => setForm({ ...form, infirmierId: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      {infirmiers.map((i) => <option key={i.idUtilisateur} value={i.idUtilisateur}>{i.nom} {i.prenom}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!confirmDelete}
        title="Supprimer le patient"
        message={confirmDelete ? `Voulez-vous vraiment supprimer le patient ${confirmDelete.nom} ${confirmDelete.prenom} ? Cette action est irréversible.` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete.idPatient)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Patients;

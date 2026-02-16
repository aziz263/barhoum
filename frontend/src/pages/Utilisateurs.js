import React, { useState, useEffect } from 'react';
import { utilisateurAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const Utilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'medecin',
    specialite: '', service: '', laboratoire: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await utilisateurAPI.getAll();
      setUsers(data);
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
        const updateData = { ...form };
        delete updateData.motDePasse;
        await utilisateurAPI.update(editing.idUtilisateur, updateData);
        toast.success('Utilisateur modifié');
      } else {
        await utilisateurAPI.create(form);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'medecin', specialite: '', service: '', laboratoire: '' });
  };

  const handleEdit = (user) => {
    setEditing(user);
    setForm({
      nom: user.nom, prenom: user.prenom, email: user.email,
      motDePasse: '', role: user.role,
      specialite: user.specialite || '', service: user.service || '', laboratoire: user.laboratoire || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await utilisateurAPI.delete(id);
      toast.success('Utilisateur supprimé');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filtered = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleLabel = (role) => {
    const labels = { medecin: 'Médecin', infirmier: 'Infirmier', administrateur: 'Administrateur', technicien: 'Technicien' };
    return labels[role] || role;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}>
          <FiPlus /> Nouvel Utilisateur
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Rôle</th><th>Détails</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.idUtilisateur}>
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{getRoleLabel(u.role)}</span></td>
                  <td>
                    {u.role === 'medecin' && u.specialite ? u.specialite : ''}
                    {u.role === 'infirmier' && u.service ? u.service : ''}
                    {u.role === 'technicien' && u.laboratoire ? u.laboratoire : ''}
                    {u.role === 'administrateur' ? '-' : ''}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleEdit(u)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(u)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun utilisateur</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h2>
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
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                {!editing && (
                  <div className="form-group">
                    <label>Mot de passe *</label>
                    <input type="password" className="form-control" value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} required />
                  </div>
                )}
                <div className="form-group">
                  <label>Rôle *</label>
                  <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="medecin">Médecin</option>
                    <option value="infirmier">Infirmier</option>
                    <option value="technicien">Technicien Laboratoire</option>
                    <option value="administrateur">Administrateur</option>
                  </select>
                </div>
                {form.role === 'medecin' && (
                  <div className="form-group">
                    <label>Spécialité</label>
                    <input className="form-control" value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} placeholder="Cardiologie, Neurologie..." />
                  </div>
                )}
                {form.role === 'infirmier' && (
                  <div className="form-group">
                    <label>Service</label>
                    <input className="form-control" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Urgences, Pédiatrie..." />
                  </div>
                )}
                {form.role === 'technicien' && (
                  <div className="form-group">
                    <label>Laboratoire</label>
                    <input className="form-control" value={form.laboratoire} onChange={(e) => setForm({ ...form, laboratoire: e.target.value })} placeholder="Biochimie, Hématologie..." />
                  </div>
                )}
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
        title="Supprimer l'utilisateur"
        message={confirmDelete ? `Voulez-vous vraiment supprimer l'utilisateur ${confirmDelete.nom} ${confirmDelete.prenom} (${confirmDelete.email}) ?` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete.idUtilisateur)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Utilisateurs;

import React, { useState, useEffect } from 'react';
import { analyseAPI, dossierAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const Analyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ dossierId: '', typeAnalyse: '' });
  const [resultForm, setResultForm] = useState({ valeur: '', unite: '', interpretation: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [aRes, dRes] = await Promise.all([analyseAPI.getAll(), dossierAPI.getAll()]);
      setAnalyses(aRes.data);
      setDossiers(dRes.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await analyseAPI.create(form);
      toast.success('Analyse créée');
      setShowModal(false);
      setForm({ dossierId: '', typeAnalyse: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      await analyseAPI.addResultat(selectedAnalyse.idAnalyse, resultForm);
      toast.success('Résultat enregistré');
      setShowResultModal(false);
      setResultForm({ valeur: '', unite: '', interpretation: '' });
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const openResultModal = (analyse) => {
    setSelectedAnalyse(analyse);
    if (analyse.resultat) {
      setResultForm({
        valeur: analyse.resultat.valeur,
        unite: analyse.resultat.unite,
        interpretation: analyse.resultat.interpretation || '',
      });
    } else {
      setResultForm({ valeur: '', unite: '', interpretation: '' });
    }
    setShowResultModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await analyseAPI.delete(id);
      toast.success('Analyse supprimée');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filtered = analyses.filter(a =>
    `${a.typeAnalyse} ${a.dossier?.patient?.nom || ''} ${a.dossier?.patient?.prenom || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Analyses de Laboratoire</h1>
        {user?.role === 'technicien' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Nouvelle Analyse
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
              <tr><th>Date</th><th>Type</th><th>Patient</th><th>Technicien</th><th>Résultat</th><th>Interprétation</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.idAnalyse}>
                  <td>{a.dateAnalyse}</td>
                  <td>{a.typeAnalyse}</td>
                  <td>{a.dossier?.patient ? `${a.dossier.patient.nom} ${a.dossier.patient.prenom}` : '-'}</td>
                  <td>{a.technicien ? `${a.technicien.nom} ${a.technicien.prenom}` : '-'}</td>
                  <td>{a.resultat ? `${a.resultat.valeur} ${a.resultat.unite}` : <span style={{ color: '#ef6c00' }}>En attente</span>}</td>
                  <td>{a.resultat?.interpretation || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      {user?.role === 'technicien' && (
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openResultModal(a)} title="Résultat"><FiEdit2 /></button>
                      )}
                      {['technicien', 'administrateur'].includes(user?.role) && (
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(a)}><FiTrash2 /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucune analyse</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Analysis Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Analyse</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Dossier Médical *</label>
                  <select className="form-control" value={form.dossierId} onChange={(e) => setForm({ ...form, dossierId: e.target.value })} required>
                    <option value="">-- Sélectionner --</option>
                    {dossiers.map((d) => (
                      <option key={d.idDossier} value={d.idDossier}>
                        Dossier #{d.idDossier} - {d.patient?.nom} {d.patient?.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type d'analyse *</label>
                  <select className="form-control" value={form.typeAnalyse} onChange={(e) => setForm({ ...form, typeAnalyse: e.target.value })} required>
                    <option value="">-- Sélectionner --</option>
                    <option value="Bilan sanguin">Bilan sanguin</option>
                    <option value="Bilan lipidique">Bilan lipidique</option>
                    <option value="Glycémie">Glycémie</option>
                    <option value="Hémogramme">Hémogramme</option>
                    <option value="Analyse urinaire">Analyse urinaire</option>
                    <option value="Bilan hépatique">Bilan hépatique</option>
                    <option value="Bilan rénal">Bilan rénal</option>
                    <option value="Bilan thyroïdien">Bilan thyroïdien</option>
                  </select>
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

      {/* Result Modal */}
      {showResultModal && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Résultat - {selectedAnalyse?.typeAnalyse}</h2>
              <button className="modal-close" onClick={() => setShowResultModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleResultSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Valeur *</label>
                    <input className="form-control" value={resultForm.valeur} onChange={(e) => setResultForm({ ...resultForm, valeur: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Unité *</label>
                    <input className="form-control" value={resultForm.unite} onChange={(e) => setResultForm({ ...resultForm, unite: e.target.value })} placeholder="g/L, mmol/L..." required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Interprétation</label>
                  <textarea className="form-control" value={resultForm.interpretation} onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        show={!!confirmDelete}
        title="Supprimer l'analyse"
        message={confirmDelete ? `Voulez-vous vraiment supprimer l'analyse "${confirmDelete.typeAnalyse}" ?` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete.idAnalyse)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Analyses;

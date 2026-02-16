import React, { useState, useEffect } from 'react';
import { documentAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUpload, FiDownload, FiTrash2, FiSearch, FiFile, FiLock, FiShield } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadData, setUploadData] = useState({
    fichier: null,
    categorie: 'autre',
    description: '',
    patientId: '',
  });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [docsRes, patientsRes] = await Promise.all([
        documentAPI.getAll(),
        patientAPI.getAll(),
      ]);
      setDocuments(docsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Erreur de chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.fichier) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', uploadData.fichier);
      formData.append('categorie', uploadData.categorie);
      formData.append('description', uploadData.description);
      if (uploadData.patientId) formData.append('patientId', uploadData.patientId);

      await documentAPI.upload(formData);
      toast.success('Document uploadé et chiffré avec succès');
      setShowUpload(false);
      setUploadData({ fichier: null, categorie: 'autre', description: '', patientId: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentAPI.download(doc.idDocument);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.nomFichier);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Document téléchargé (déchiffré)');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentAPI.delete(id);
      toast.success('Document supprimé');
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const categorieLabels = {
    rapport_medical: 'Rapport Médical',
    analyse: 'Analyse',
    ordonnance: 'Ordonnance',
    imagerie: 'Imagerie',
    certificat: 'Certificat',
    autre: 'Autre',
  };

  const filtered = documents.filter(d =>
    `${d.nomFichier} ${d.categorie} ${d.patient?.nom || ''} ${d.patient?.prenom || ''} ${d.description || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1><FiShield style={{ marginRight: 8 }} /> Documents Sécurisés</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          <FiUpload /> Upload sécurisé
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, padding: 16 }}>
          <div className="stat-number">{documents.length}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: 16 }}>
          <div className="stat-number">{documents.filter(d => d.estChiffre).length}</div>
          <div className="stat-label"><FiLock /> Chiffrés</div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: 16 }}>
          <div className="stat-number">{formatSize(documents.reduce((acc, d) => acc + (d.tailleFichier || 0), 0))}</div>
          <div className="stat-label">Taille totale</div>
        </div>
      </div>

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiUpload /> Upload de document sécurisé</h3>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                  <FiLock style={{ marginRight: 4 }} />
                  Le fichier sera automatiquement chiffré (AES-256) avant stockage.
                </p>

                <div className="form-group">
                  <label>Fichier *</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setUploadData({ ...uploadData, fichier: e.target.files[0] })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <small style={{ color: '#999' }}>Max 10 MB — PDF, images, Word, Excel, texte</small>
                </div>

                <div className="form-group">
                  <label>Catégorie</label>
                  <select className="form-control" value={uploadData.categorie} onChange={(e) => setUploadData({ ...uploadData, categorie: e.target.value })}>
                    {Object.entries(categorieLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Patient (optionnel)</label>
                  <select className="form-control" value={uploadData.patientId} onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}>
                    <option value="">-- Aucun patient --</option>
                    {patients.map(p => (
                      <option key={p.idPatient} value={p.idPatient}>{p.nom} {p.prenom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} placeholder="Description du document..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Chiffrement et upload...' : 'Uploader et chiffrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="search-bar">
          <FiSearch style={{ position: 'absolute', marginTop: 12, marginLeft: 12, color: '#999' }} />
          <input className="form-control" placeholder="Rechercher un document..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fichier</th>
                <th>Catégorie</th>
                <th>Patient</th>
                <th>Taille</th>
                <th>Chiffré</th>
                <th>Uploadé par</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.idDocument}>
                  <td><FiFile style={{ marginRight: 6, color: '#4f46e5' }} /> {doc.nomFichier}</td>
                  <td><span className="badge badge-info">{categorieLabels[doc.categorie] || doc.categorie}</span></td>
                  <td>{doc.patient ? `${doc.patient.nom} ${doc.patient.prenom}` : '-'}</td>
                  <td>{formatSize(doc.tailleFichier)}</td>
                  <td>{doc.estChiffre ? <span className="badge badge-success"><FiLock /> Oui</span> : <span className="badge badge-warning">Non</span>}</td>
                  <td>{doc.uploadeur ? `${doc.uploadeur.prenom} ${doc.uploadeur.nom}` : '-'}</td>
                  <td>{new Date(doc.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary" onClick={() => handleDownload(doc)} title="Télécharger (déchiffré)">
                        <FiDownload />
                      </button>
                      {['medecin', 'administrateur'].includes(user?.role) && (
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete(doc)} title="Supprimer">
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun document</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Supprimer le document"
          message={`Êtes-vous sûr de vouloir supprimer "${confirmDelete.nomFichier}" ? Cette action est irréversible.`}
          onConfirm={() => handleDelete(confirmDelete.idDocument)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Documents;

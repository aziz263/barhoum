import React, { useState, useEffect } from 'react';
import { logAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiActivity, FiUser, FiClock, FiFilter } from 'react-icons/fi';

const JournalActivites = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    action: '',
    ressource: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 30 };
      if (filters.action) params.action = filters.action;
      if (filters.ressource) params.ressource = filters.ressource;
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;

      const [logsRes, statsRes] = await Promise.all([
        logAPI.getAll(params),
        logAPI.getStats(),
      ]);
      setLogs(logsRes.data.logs);
      setPagination(logsRes.data.pagination);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erreur de chargement des journaux');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadData(1);
  };

  const handlePageChange = (newPage) => {
    loadData(newPage);
  };

  const actionColors = {
    CREATE: '#10b981',
    READ: '#3b82f6',
    UPDATE: '#f59e0b',
    DELETE: '#ef4444',
    LOGIN: '#8b5cf6',
    LOGOUT: '#6b7280',
    UPLOAD: '#06b6d4',
    DOWNLOAD: '#0ea5e9',
    EXPORT: '#14b8a6',
    GENERATE: '#ec4899',
  };

  const actionLabels = {
    CREATE: 'Création',
    READ: 'Lecture',
    UPDATE: 'Modification',
    DELETE: 'Suppression',
    LOGIN: 'Connexion',
    LOGOUT: 'Déconnexion',
    UPLOAD: 'Upload',
    DOWNLOAD: 'Téléchargement',
    EXPORT: 'Export',
    GENERATE: 'Génération',
  };

  if (loading && logs.length === 0) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1><FiActivity style={{ marginRight: 8 }} /> Journal d'activités</h1>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="stat-card" style={{ flex: 1, padding: 16 }}>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total logs</div>
          </div>
          <div className="stat-card" style={{ flex: 1, padding: 16 }}>
            <div className="stat-number">{stats.dernières24h}</div>
            <div className="stat-label"><FiClock /> Dernières 24h</div>
          </div>
          {stats.parAction?.slice(0, 3).map((a, i) => (
            <div key={i} className="stat-card" style={{ flex: 1, padding: 16 }}>
              <div className="stat-number">{a.count}</div>
              <div className="stat-label">{actionLabels[a.action] || a.action}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <h3 style={{ marginBottom: 12 }}><FiFilter /> Filtres</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <label>Action</label>
            <select className="form-control" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
              <option value="">Toutes</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <label>Ressource</label>
            <select className="form-control" value={filters.ressource} onChange={(e) => setFilters({ ...filters, ressource: e.target.value })}>
              <option value="">Toutes</option>
              <option value="Patient">Patient</option>
              <option value="Dossier">Dossier</option>
              <option value="Document">Document</option>
              <option value="Analyse">Analyse</option>
              <option value="Authentification">Authentification</option>
              <option value="Utilisateur">Utilisateur</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <label>Date début</label>
            <input type="date" className="form-control" value={filters.dateDebut} onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <label>Date fin</label>
            <input type="date" className="form-control" value={filters.dateFin} onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleFilter} style={{ height: 40 }}>
            <FiSearch /> Filtrer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Action</th>
                <th>Ressource</th>
                <th>Détails</th>
                <th>Utilisateur</th>
                <th>Adresse IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.idLog}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: actionColors[log.action] || '#6b7280',
                        color: 'white',
                      }}
                    >
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td>{log.ressource}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                    {log.details}
                  </td>
                  <td>
                    {log.utilisateur ? (
                      <span><FiUser style={{ marginRight: 4 }} />{log.utilisateur.prenom} {log.utilisateur.nom}</span>
                    ) : '-'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.adresseIP || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#999' }}>Aucun log trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 }}>
            <button
              className="btn btn-sm btn-secondary"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Précédent
            </button>
            <span style={{ color: '#666' }}>
              Page {pagination.page} / {pagination.totalPages} ({pagination.total} résultats)
            </span>
            <button
              className="btn btn-sm btn-secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalActivites;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { FiArrowLeft, FiCalendar, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const { data } = await patientAPI.getById(id);
      setPatient(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!patient) return <div className="empty-state"><p>Patient non trouvé</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/patients')} style={{ marginRight: 12 }}>
            <FiArrowLeft />
          </button>
          {patient.nom} {patient.prenom}
        </h1>
      </div>

      <div className="card">
        <div className="card-header"><h3><FiUser style={{ marginRight: 8 }} />Informations personnelles</h3></div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Nom complet</label>
            <p>{patient.nom} {patient.prenom}</p>
          </div>
          <div className="detail-item">
            <label>Date de naissance</label>
            <p><FiCalendar style={{ marginRight: 4 }} />{patient.dateNaissance}</p>
          </div>
          <div className="detail-item">
            <label>Sexe</label>
            <p><span className={`badge badge-${patient.sexe}`}>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></p>
          </div>
          <div className="detail-item">
            <label>Téléphone</label>
            <p><FiPhone style={{ marginRight: 4 }} />{patient.telephone || 'Non renseigné'}</p>
          </div>
          <div className="detail-item">
            <label>Adresse</label>
            <p><FiMapPin style={{ marginRight: 4 }} />{patient.adresse || 'Non renseignée'}</p>
          </div>
          <div className="detail-item">
            <label>Médecin traitant</label>
            <p>{patient.medecin ? `Dr. ${patient.medecin.nom} ${patient.medecin.prenom}` : 'Non assigné'}</p>
          </div>
        </div>
      </div>

      {/* Dossiers médicaux */}
      <div className="card">
        <div className="card-header">
          <h3>Dossiers Médicaux ({patient.dossiers?.length || 0})</h3>
        </div>
        {patient.dossiers && patient.dossiers.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Diagnostic</th><th>Traitement</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patient.dossiers.map((d) => (
                  <tr key={d.idDossier}>
                    <td>{d.dateCreation}</td>
                    <td>{d.diagnostic || '-'}</td>
                    <td>{d.traitement || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => navigate(`/dossiers/${d.idDossier}`)}>
                        Voir détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>Aucun dossier médical</p></div>
        )}
      </div>

      {/* Signes vitaux récents */}
      <div className="card">
        <div className="card-header">
          <h3>Signes Vitaux Récents</h3>
        </div>
        {patient.signesVitaux && patient.signesVitaux.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Température</th><th>Pression Artérielle</th><th>Fréq. Cardiaque</th></tr>
              </thead>
              <tbody>
                {patient.signesVitaux.map((s) => (
                  <tr key={s.idSignes}>
                    <td>{new Date(s.dateMesure).toLocaleString('fr-FR')}</td>
                    <td>{s.temperature}°C</td>
                    <td>{s.pressionArterielle} mmHg</td>
                    <td>{s.frequenceCardiaque} bpm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>Aucune mesure enregistrée</p></div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statistiqueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiFileText, FiActivity, FiClipboard, FiUserCheck, FiTool, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await statistiqueAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const sexData = {
    labels: ['Masculin', 'Féminin'],
    datasets: [{
      data: stats?.patientsBySex?.map(s => parseInt(s.dataValues?.count || s.count || 0)) || [0, 0],
      backgroundColor: ['#818cf8', '#f472b6'],
      borderWidth: 0,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { family: 'Inter', size: 13, weight: '500' },
        },
      },
    },
    cutout: '65%',
  };

  const patientsAtRisk = stats?.patientsAtRisk || [];

  return (
    <div>
      <div className="page-header">
        <h1>Tableau de bord</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiUsers /></div>
          <div className="stat-info">
            <h3>{stats?.totalPatients || 0}</h3>
            <p>Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiUserCheck /></div>
          <div className="stat-info">
            <h3>{stats?.totalMedecins || 0}</h3>
            <p>Médecins</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiActivity /></div>
          <div className="stat-info">
            <h3>{stats?.totalInfirmiers || 0}</h3>
            <p>Infirmiers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiTool /></div>
          <div className="stat-info">
            <h3>{stats?.totalTechniciens || 0}</h3>
            <p>Techniciens</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><FiFileText /></div>
          <div className="stat-info">
            <h3>{stats?.totalDossiers || 0}</h3>
            <p>Dossiers Médicaux</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FiClipboard /></div>
          <div className="stat-info">
            <h3>{stats?.totalAnalyses || 0}</h3>
            <p>Analyses Labo</p>
          </div>
        </div>
      </div>

      {/* At-Risk Patients Alert Section */}
      {patientsAtRisk.length > 0 && ['medecin', 'administrateur', 'infirmier'].includes(user?.role) && (
        <div className="risk-section">
          <div className="risk-section-header">
            <FiAlertTriangle style={{ color: 'var(--danger)', fontSize: 22 }} />
            <h3>Patients à Risque</h3>
            <span className="risk-badge risk-badge-count">{patientsAtRisk.length} alerte{patientsAtRisk.length > 1 ? 's' : ''}</span>
          </div>
          <div className="risk-cards">
            {patientsAtRisk.map((p) => (
              <div
                key={p.idPatient}
                className={`risk-card risk-${p.severity}`}
                onClick={() => navigate(`/patients/${p.idPatient}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="risk-card-header">
                  <div>
                    <div className="risk-card-patient">{p.nom} {p.prenom}</div>
                    <div className="risk-card-medecin">{p.medecin}</div>
                  </div>
                  <span className={`risk-severity ${p.severity}`}>
                    {p.severity === 'high' ? 'Critique' : p.severity === 'medium' ? 'Modéré' : 'Léger'}
                  </span>
                </div>
                <div className="risk-items">
                  {p.risks.map((r, i) => (
                    <div key={i} className="risk-item">
                      <span className="risk-item-type">
                        <FiAlertCircle style={{ marginRight: 6, verticalAlign: 'middle', color: r.severity === 'high' ? 'var(--danger)' : r.severity === 'medium' ? 'var(--warning)' : '#f59e0b' }} />
                        {r.type}
                      </span>
                      <span className="risk-item-value">{r.valeur}</span>
                    </div>
                  ))}
                </div>
                <div className="risk-card-date">
                  Dernière mesure : {new Date(p.dateMesure).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Répartition par sexe</h3>
          <div style={{ maxWidth: 280, margin: '0 auto' }}>
            <Doughnut data={sexData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Activité récente (30 jours)</h3>
          <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div className="activity-stat">
              <div className="activity-stat-value blue">{stats?.recentPatients || 0}</div>
              <div className="activity-stat-label">Nouveaux patients</div>
            </div>
            <div className="activity-stat">
              <div className="activity-stat-value green">{stats?.recentAnalyses || 0}</div>
              <div className="activity-stat-label">Nouvelles analyses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

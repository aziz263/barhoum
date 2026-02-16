import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import DossiersMedicaux from './pages/DossiersMedicaux';
import DossierDetail from './pages/DossierDetail';
import SignesVitaux from './pages/SignesVitaux';
import Analyses from './pages/Analyses';
import Rapports from './pages/Rapports';
import Utilisateurs from './pages/Utilisateurs';
import Documents from './pages/Documents';
import JournalActivites from './pages/JournalActivites';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="dossiers" element={<DossiersMedicaux />} />
        <Route path="dossiers/:id" element={<DossierDetail />} />
        <Route path="signes-vitaux" element={<SignesVitaux />} />
        <Route path="analyses" element={<Analyses />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="documents" element={<Documents />} />
        <Route path="journal" element={<JournalActivites />} />
        <Route path="utilisateurs" element={<Utilisateurs />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;

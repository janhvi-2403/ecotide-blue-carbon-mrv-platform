import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './pages/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { EvidenceUpload } from './pages/EvidenceUpload';
import { EvidenceDashboard } from './pages/EvidenceDashboard';
import { EvidenceMap } from './pages/EvidenceMap';
import { MRVReports } from './pages/MRVReports';
import { AdminDashboard } from './pages/AdminDashboard';
import { Marketplace } from './pages/Marketplace';

function App() {
  const { isAuthenticated, restoreSession, user } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {user?.role === 'UPLOADER' && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/edit/:id" element={<CreateProject />} />
              <Route path="/evidence" element={<EvidenceUpload />} />
              <Route path="/evidence/dashboard" element={<EvidenceDashboard />} />
              <Route path="/evidence/map" element={<EvidenceMap />} />
              <Route path="/mrv-reports" element={<MRVReports />} />
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
            </>
          )}
          {user?.role === 'BUYER' && (
            <Route path="/marketplace" element={<Marketplace />} />
          )}

          {/* Default redirect based on role */}
          <Route
            path="*"
            element={<Navigate to={
              user?.role === 'UPLOADER' ? '/dashboard' :
                user?.role === 'ADMIN' ? '/admin' : '/marketplace'
            } replace />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

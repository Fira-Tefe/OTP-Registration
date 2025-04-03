import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './components/LoginRegister/LoginRegister';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import { useEffect } from 'react';

const App: React.FC = () => {
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Handle Google auth callback
  useEffect(() => {
    const handleGoogleAuth = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const user = urlParams.get('user');

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);
        window.location.href = '/admin'; // Redirect to admin after successful auth
      }
    };

    handleGoogleAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route
          path="/admin"
          element={isAuthenticated() ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<LoginRegister />} />
        {/* Add this new route for Google auth callback */}
        <Route 
          path="/auth-success" 
          element={
            isAuthenticated() ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
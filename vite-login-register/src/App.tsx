import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './components/LoginRegister/LoginRegister';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

const App: React.FC = () => {
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route
          path="/admin"
          element={isAuthenticated() ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<LoginRegister />} />
      </Routes>
    </Router>
  );
};

export default App;
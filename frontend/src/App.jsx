import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AiAssistant from './pages/AiAssistant';
import Overview from './pages/Overview';
import Students from './pages/Students';
import Batches from './pages/Batches';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Branches from './pages/Branches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function RequireAuth({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user } = useApp();
  return user ? <Navigate to="/ai-assistant" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Navigate to="/ai-assistant" replace />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/students" element={<Students />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

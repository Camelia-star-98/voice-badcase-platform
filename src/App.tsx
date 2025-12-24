import { Routes, Route, Navigate } from 'react-router-dom';
import { BadcaseProvider } from './contexts/BadcaseContext';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import BadcaseListPage from './pages/BadcaseListPage';
import StatusFlowPage from './pages/StatusFlowPage';
import DataDashboardPage from './pages/DataDashboardPage';

function App() {
  return (
    <BadcaseProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="badcase-list" element={<BadcaseListPage />} />
          <Route path="status-flow" element={<StatusFlowPage />} />
          <Route path="data-dashboard" element={<DataDashboardPage />} />
        </Route>
      </Routes>
    </BadcaseProvider>
  );
}

export default App;

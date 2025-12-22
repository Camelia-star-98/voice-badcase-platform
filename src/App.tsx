import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import DataVisualizationPage from './pages/DataVisualizationPage';
import BadcaseListPage from './pages/BadcaseListPage';
import StatusFlowPage from './pages/StatusFlowPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="visualization" element={<DataVisualizationPage />} />
        <Route path="badcase-list" element={<BadcaseListPage />} />
        <Route path="status-flow" element={<StatusFlowPage />} />
      </Route>
    </Routes>
  );
}

export default App;

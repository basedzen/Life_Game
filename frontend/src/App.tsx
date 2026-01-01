import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WeeklyTracker } from './pages/WeeklyTracker';
import { Logger } from './pages/Logger';
import { BulkWeeklyInput } from './pages/BulkWeeklyInput';
import { LogHistory } from './pages/LogHistory';
import { ConfigDeck } from './pages/ConfigDeck';
import { YearlyDashboard } from './pages/YearlyDashboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<WeeklyTracker />} />
          <Route path="/log" element={<Logger />} />
          <Route path="/bulk" element={<BulkWeeklyInput />} />
          <Route path="/history" element={<LogHistory />} />
          <Route path="/config" element={<ConfigDeck />} />
          <Route path="/stats" element={<YearlyDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

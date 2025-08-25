import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ManageSites from './components/ManageSites';
import ManageRegions from './components/ManageRegions';

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manage-sites" element={<ManageSites />} />
          <Route path="/manage-regions" element={<ManageRegions />} />
        </Routes>
      </div>
    </Router>
  )
}
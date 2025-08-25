import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const goToManageSites = () => {
        navigate('/manage-sites');
    };

    const goToManageRegions = () => {
        navigate('/manage-regions');
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <button
                onClick={goToManageSites}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Go to Manage Sites
            </button>
            <button
                onClick={goToManageRegions}
                className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Go to Manage Regions
            </button>
        </div>
    );
}

export default Dashboard;
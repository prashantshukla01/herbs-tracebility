import React, { useState, useEffect } from 'react';
import { Search, BarChart3, MapPin, Filter, Download, RefreshCw, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService } from '../services/api';
import { formatDate, formatCoordinates, getConfidenceBadge, debounce } from '../utils/helpers';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CompanyDashboardView = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    herbName: '',
    state: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'map'
  const [error, setError] = useState(null);
  
  const itemsPerPage = 10;

  // Fetch data with current filters and pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: itemsPerPage,
        ...(searchTerm && { farmerName: searchTerm }),
        ...(filters.herbName && { herbName: filters.herbName }),
        ...(filters.state && { state: filters.state })
      };

      const response = await apiService.getCollectionEvents(params);
      setData(response.data);
      setPagination(response.pagination);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load harvest data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.getCollectionEventsStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((term) => {
    setCurrentPage(1);
    fetchData(1);
  }, 500);

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchData(newPage);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (filters.herbName || filters.state) {
      fetchData(1);
    }
  }, [filters]);

  // Get unique herbs and states for filter dropdowns
  const uniqueHerbs = [...new Set(data.map(item => item.herbName))].sort();
  const uniqueStates = [...new Set(data.map(item => item.geoVerification?.state).filter(Boolean))].sort();

  // Stats cards component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Harvests</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overview?.totalEvents || 0}
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-green-600">
              {stats?.overview?.eventsWithinIndia || 0}
            </p>
          </div>
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Outside India</p>
            <p className="text-2xl font-bold text-red-600">
              {stats?.overview?.eventsOutsideIndia || 0}
            </p>
          </div>
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Verification Rate</p>
            <p className="text-2xl font-bold text-primary-600">
              {stats?.overview?.verificationRate || 0}%
            </p>
          </div>
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Eye className="h-4 w-4 text-primary-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Data table component
  const DataTable = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farmer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Herb
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.batchId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.batchId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.farmerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.herbName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.geoVerification?.state || 'Unknown'}
                  <br />
                  <span className="text-xs text-gray-400">
                    {formatCoordinates(item.location?.latitude, item.location?.longitude)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    getConfidenceBadge(item.aiVerification?.confidence).color
                  }`}>
                    {item.aiVerification?.confidence}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, pagination.totalEvents)} of{' '}
              {pagination.totalEvents} results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Map view component
  const MapView = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Locations</h3>
      <div className="h-96">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          className="h-full w-full rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {data
            .filter(item => item.location?.latitude && item.location?.longitude)
            .map((item) => (
              <Marker
                key={item.batchId}
                position={[item.location.latitude, item.location.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold">{item.herbName}</h4>
                    <p className="text-sm">Farmer: {item.farmerName}</p>
                    <p className="text-sm">Quantity: {item.quantity} kg</p>
                    <p className="text-sm">Batch: {item.batchId}</p>
                    <p className="text-sm">
                      Confidence: {item.aiVerification?.confidence}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="btn-primary"
        >
          <RefreshCw className="inline h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and analyze herb harvest data</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              fetchData(currentPage);
              fetchStats();
            }}
            className="btn-secondary mr-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards />}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by farmer name..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 form-input"
            />
          </div>

          {/* Herb Filter */}
          <select
            value={filters.herbName}
            onChange={(e) => handleFilterChange('herbName', e.target.value)}
            className="form-input"
          >
            <option value="">All Herbs</option>
            {uniqueHerbs.map(herb => (
              <option key={herb} value={herb}>{herb}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="form-input"
          >
            <option value="">All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                viewMode === 'map'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="inline h-4 w-4 mr-1" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Data Display */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading harvest data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-500">No harvest data found matching your criteria.</p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable />
      ) : (
        <MapView />
      )}
    </div>
  );
};

export default CompanyDashboardView;

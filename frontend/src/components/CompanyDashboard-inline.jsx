import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, MapPin, Calendar, Search, Filter, Download, Eye, CheckCircle, AlertTriangle, Leaf, Building2, Users, Globe } from 'lucide-react';
import { apiService } from '../services/api';

const CompanyDashboard = () => {
  const [harvestData, setHarvestData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHerb, setSelectedHerb] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: 'white',
      padding: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center'
    },
    logoContainer: {
      width: '4rem',
      height: '4rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: 0
    },
    subtitle: {
      fontSize: '1rem',
      opacity: 0.9,
      margin: 0
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(34, 197, 94, 0.1)'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#166534',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#16a34a',
      marginBottom: '0.5rem'
    },
    statChange: {
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(34, 197, 94, 0.1)'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e5e7eb'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#166534',
      display: 'flex',
      alignItems: 'center'
    },
    filtersContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    },
    searchInput: {
      flex: 1,
      minWidth: '200px',
      padding: '0.75rem 1rem',
      border: '2px solid #bbf7d0',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      outline: 'none'
    },
    select: {
      padding: '0.75rem 1rem',
      border: '2px solid #bbf7d0',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      outline: 'none',
      backgroundColor: 'white',
      minWidth: '150px'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#16a34a',
      border: '2px solid #16a34a'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '2px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '1rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.15s ease'
    },
    tableCell: {
      padding: '1rem',
      fontSize: '0.875rem',
      color: '#374151'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textAlign: 'center'
    },
    successBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    warningBadge: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    batchId: {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#16a34a'
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem'
    },
    pageButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      color: '#374151',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    },
    activePageButton: {
      backgroundColor: '#16a34a',
      color: 'white',
      borderColor: '#16a34a'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    },
    loadingSpinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #16a34a',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    },
    exportButton: {
      backgroundColor: '#f8fafc',
      color: '#16a34a',
      border: '2px solid #16a34a'
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [currentPage, searchTerm, selectedHerb, selectedState]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch harvest data
      const harvestParams = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { farmerName: searchTerm }),
        ...(selectedHerb && { herbName: selectedHerb }),
        ...(selectedState && { state: selectedState })
      };
      
      const harvestResponse = await apiService.getHarvests(harvestParams);
      setHarvestData(harvestResponse.data);
      setTotalPages(Math.ceil(harvestResponse.pagination.total / harvestResponse.pagination.limit));
      
      // Fetch stats
      const statsResponse = await apiService.getStats();
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleHerbFilter = (e) => {
    setSelectedHerb(e.target.value);
    setCurrentPage(1);
  };

  const handleStateFilter = (e) => {
    setSelectedState(e.target.value);
    setCurrentPage(1);
  };

  const exportData = () => {
    // Simulate CSV export
    const csvData = harvestData.map(harvest => ({
      'Batch ID': harvest.batchId,
      'Farmer Name': harvest.farmerName,
      'Herb Name': harvest.herbName,
      'Quantity (kg)': harvest.quantity,
      'Location': `${harvest.geoVerification?.state || 'Unknown'}, ${harvest.geoVerification?.country || 'India'}`,
      'AI Confidence': `${harvest.aiVerification?.confidence || 0}%`,
      'Date': new Date(harvest.timestamp).toLocaleDateString()
    }));
    
    console.log('Exporting data:', csvData);
    alert('📊 Export functionality simulated! Check console for data.');
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 95) {
      return { ...styles.badge, ...styles.successBadge };
    } else if (confidence >= 90) {
      return { ...styles.badge, ...styles.warningBadge };
    } else {
      return { ...styles.badge, backgroundColor: '#fee2e2', color: '#dc2626' };
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <Building2 size={32} color="white" />
            </div>
            <div>
              <h1 style={styles.title}>🏢 Company Dashboard</h1>
              <p style={styles.subtitle}>Ayurvedic Herb Traceability Analytics</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', fontSize: '0.875rem', opacity: 0.9 }}>
              <p style={{ margin: 0 }}>📅 {new Date().toLocaleDateString()}</p>
              <p style={{ margin: 0 }}>🕒 {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.content}>
        {/* Stats Grid */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>Total Harvests</span>
                <Package size={24} color="#16a34a" />
              </div>
              <div style={styles.statValue}>{stats.totalHarvests || 0}</div>
              <div style={{ ...styles.statChange, color: '#16a34a' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                +12% this month
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>Total Quantity</span>
                <BarChart3 size={24} color="#16a34a" />
              </div>
              <div style={styles.statValue}>{stats.totalQuantity?.toFixed(1) || '0.0'} kg</div>
              <div style={{ ...styles.statChange, color: '#16a34a' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                +8% this month
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>Active Farmers</span>
                <Users size={24} color="#16a34a" />
              </div>
              <div style={styles.statValue}>{stats.uniqueFarmers || 0}</div>
              <div style={{ ...styles.statChange, color: '#16a34a' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                +5% this month
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>Avg AI Confidence</span>
                <CheckCircle size={24} color="#16a34a" />
              </div>
              <div style={styles.statValue}>{stats.avgConfidence?.toFixed(1) || '0.0'}%</div>
              <div style={{ ...styles.statChange, color: '#16a34a' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                +2% this month
              </div>
            </div>
          </div>
        )}

        {/* Harvest Data Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Leaf size={24} style={{ marginRight: '0.5rem' }} />
              🌿 Recent Harvests
            </h2>
            <button 
              onClick={exportData}
              style={{ ...styles.button, ...styles.exportButton }}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              📊 Export Data
            </button>
          </div>

          {/* Filters */}
          <div style={styles.filtersContainer}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="🔍 Search farmers..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ ...styles.searchInput, paddingLeft: '2.5rem' }}
              />
            </div>
            
            <select
              value={selectedHerb}
              onChange={handleHerbFilter}
              style={styles.select}
            >
              <option value="">🌿 All Herbs</option>
              <option value="Ashwagandha">Ashwagandha</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Brahmi">Brahmi</option>
              <option value="Neem">Neem</option>
              <option value="Tulsi">Tulsi</option>
            </select>

            <select
              value={selectedState}
              onChange={handleStateFilter}
              style={styles.select}
            >
              <option value="">🗺️ All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>

          {/* Table */}
          {harvestData.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Batch ID</th>
                      <th style={styles.tableHeaderCell}>Farmer</th>
                      <th style={styles.tableHeaderCell}>Herb</th>
                      <th style={styles.tableHeaderCell}>Quantity</th>
                      <th style={styles.tableHeaderCell}>Location</th>
                      <th style={styles.tableHeaderCell}>AI Confidence</th>
                      <th style={styles.tableHeaderCell}>Date</th>
                      <th style={styles.tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvestData.map((harvest, index) => (
                      <tr 
                        key={harvest._id} 
                        style={{
                          ...styles.tableRow,
                          backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                        }}
                      >
                        <td style={styles.tableCell}>
                          <span style={styles.batchId}>{harvest.batchId}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '2rem',
                              height: '2rem',
                              backgroundColor: '#dcfce7',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '0.75rem',
                              fontSize: '0.875rem'
                            }}>
                              👨‍🌾
                            </div>
                            {harvest.farmerName}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#f0fdf4',
                            color: '#166534',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            🌿 {harvest.herbName}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{ fontWeight: '600' }}>{harvest.quantity} kg</span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MapPin size={14} style={{ marginRight: '0.25rem', color: '#16a34a' }} />
                            {harvest.geoVerification?.state || 'Unknown'}, {harvest.geoVerification?.country || 'India'}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={getConfidenceBadge(harvest.aiVerification?.confidence || 0)}>
                            {harvest.aiVerification?.confidence || 0}%
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ fontSize: '0.875rem' }}>
                            <div>{new Date(harvest.timestamp).toLocaleDateString()}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              {new Date(harvest.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            style={{
                              ...styles.button,
                              ...styles.secondaryButton,
                              padding: '0.5rem',
                              fontSize: '0.875rem'
                            }}
                            onClick={() => alert(`Viewing details for batch ${harvest.batchId}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.pageButton,
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          ...styles.pageButton,
                          ...(currentPage === page ? styles.activePageButton : {})
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.pageButton,
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <Leaf size={48} color="#d1d5db" />
              <h3 style={{ color: '#9ca3af', marginTop: '1rem' }}>No harvest data found</h3>
              <p style={{ color: '#9ca3af' }}>Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;

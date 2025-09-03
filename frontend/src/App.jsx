import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Leaf, BarChart3, Search, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

// Import components
import FarmerView from './components/FarmerView-inline';
import CompanyDashboard from './components/CompanyDashboard-inline';
import { useState } from 'react';
import { Building2, User, Leaf } from 'lucide-react';
import CompanyDashboardView from './components/CompanyDashboardView';
import ConsumerPortalView from './components/ConsumerPortalView';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Farmer Portal', href: '/', icon: Leaf, color: 'emerald' },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, color: 'primary' },
    { name: 'Track Batch', href: '/track', icon: Search, color: 'forest' },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-50">
        {/* Background pattern */}
        <div className="fixed inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(34, 197, 94) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
        {/* Beautiful Navigation Header */}
        <nav className="glass backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Beautiful Logo */}
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <Leaf className="relative h-10 w-10 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-full p-2 shadow-lg" />
                </div>
                <div>
                  <span className="text-2xl font-bold gradient-text">AyurTrace</span>
                  <p className="text-xs text-green-600 font-medium">Herb Traceability</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 hover-lift ${
                            isActive
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                              : 'text-green-700 hover:bg-white/50 hover:text-green-800'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                        {({ isActive }) => isActive && (
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-3 rounded-2xl text-emerald-600 hover:text-emerald-800 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover-lift"
                >
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Beautiful Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden animate-slide-up">
              <div className="px-4 pt-2 pb-4 space-y-2 bg-white/80 backdrop-blur-sm border-t border-white/20">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-2xl text-base font-semibold flex items-center space-x-3 transition-all duration-300 hover-lift ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-primary-500 text-white shadow-emerald-glow'
                            : 'text-emerald-700 hover:bg-white/70 hover:text-emerald-800'
                        }`
                      }
                    >
                      <Icon className="h-6 w-6" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Beautiful Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<FarmerView />} />
              <Route path="/dashboard" element={<CompanyDashboardView />} />
              <Route path="/track" element={<ConsumerPortalView />} />
            </Routes>
          </div>
        </main>

        {/* Beautiful PWA Install Banner */}
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up">
          <div className="card-gradient p-4 shadow-emerald-glow">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Install AyurTrace</p>
                <p className="text-xs text-emerald-600">Get the best mobile experience!</p>
              </div>
              <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-primary-200/20 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-forest-200/20 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
        </div>
      </div>
    </Router>
  );
}

export default App;

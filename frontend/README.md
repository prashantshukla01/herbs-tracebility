# AyurTrace Frontend - React PWA

A Progressive Web App built with React, Vite, and Tailwind CSS for the Ayurvedic herb traceability system.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16.x or higher)
- npm or yarn package manager
- Backend API running on http://localhost:3000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if needed to match your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 PWA Features

- **Offline Support**: Service worker caches resources for offline access
- **Mobile-First Design**: Optimized for mobile devices
- **App-Like Experience**: Can be installed on mobile devices and desktop
- **Background Sync**: API requests cached when offline

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── FarmerView.jsx      # Farmer harvest submission form
│   ├── CompanyDashboardView.jsx  # Company dashboard with analytics
│   └── ConsumerPortalView.jsx    # Consumer batch tracking
├── services/            # API service layer
│   └── api.js             # Axios configuration and API calls
├── utils/               # Utility functions
│   └── helpers.js         # Helper functions for geolocation, formatting, etc.
├── App.jsx              # Main app component with routing
├── main.jsx             # App entry point
└── index.css            # Global styles with Tailwind
```

## 🎨 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PWA**: Vite PWA Plugin
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Maps**: React Leaflet

## 🌐 App Features

### 1. Farmer Portal (Mobile-First)
- Harvest data submission form
- Geolocation capture using browser API
- Image upload simulation
- Real-time form validation
- Success/error feedback with AI confidence scores

### 2. Company Dashboard
- Data table with pagination and filtering
- Search by farmer name
- Filter by herb type and state
- Interactive map view with harvest locations
- Key metrics and statistics

### 3. Consumer Portal
- Batch ID lookup
- Beautiful timeline visualization
- Interactive map showing harvest location
- Verification details and confidence scores
- Complete traceability journey

## 🔧 API Integration

The app communicates with the backend API with these endpoints:

- `POST /collection-events` - Submit harvest data
- `GET /collection-events` - Get all harvests (with pagination/filtering)
- `GET /collection-events/:batchId` - Get specific harvest by batch ID
- `GET /collection-events/stats` - Get harvest statistics

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

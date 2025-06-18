import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { AddTransaction } from './components/AddTransaction'
import { Reports } from './components/Reports'
import { Goals } from './components/Goals'
import { Settings } from './components/Settings'

function AppContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!user) {
    return <Auth />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'add':
        return <AddTransaction />
      case 'reports':
        return <Reports />
      case 'goals':
        return <Goals />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
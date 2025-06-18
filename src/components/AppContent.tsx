import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Auth } from './Auth'
import { Layout } from './Layout'
import { Dashboard } from './Dashboard'
import { AddTransaction } from './AddTransaction'
import { Reports } from './Reports'
import { Goals } from './Goals'
import { Settings } from './Settings'
import { LoadingSpinner } from './LoadingSpinner'

export function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return <LoadingSpinner />
  }

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
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}
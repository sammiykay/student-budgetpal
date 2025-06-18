import React from 'react'
import { Home, Plus, BarChart3, Target, Settings, Sparkles } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'add', label: 'Add', icon: Plus, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'reports', label: 'Reports', icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
  { id: 'goals', label: 'Goals', icon: Target, gradient: 'from-orange-500 to-red-500' },
  { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-gray-500 to-slate-600' },
]

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <main className="pb-24 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4">
          <div className="glass-card px-4 py-3">
            <div className="flex justify-around items-center max-w-md mx-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'transform scale-110'
                        : 'hover:scale-105'
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl opacity-20 blur-sm`}></div>
                    )}
                    <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                        : 'text-gray-600 hover:text-gray-800'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                      isActive ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r ${tab.gradient} rounded-full`}></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
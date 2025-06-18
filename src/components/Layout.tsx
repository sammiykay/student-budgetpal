import React from 'react'
import { Home, Plus, BarChart3, Target, Settings, Sparkles, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const baseTabs = [
  { id: 'dashboard', label: 'Home', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'add', label: 'Add', icon: Plus, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'reports', label: 'Reports', icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
  { id: 'goals', label: 'Goals', icon: Target, gradient: 'from-orange-500 to-red-500' },
  { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-gray-500 to-slate-600' },
]

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { user } = useAuth()
  const isAdmin = user?.email === 'okesamson1@gmail.com'

  // Add admin tab if user is admin
  const tabs = isAdmin 
    ? [...baseTabs.slice(0, -1), { id: 'admin', label: 'Admin', icon: Shield, gradient: 'from-red-500 to-rose-600' }, baseTabs[baseTabs.length - 1]]
    : baseTabs

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-emerald-400/5 to-teal-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Content Area */}
        <main className="flex-1 pb-20 sm:pb-24">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-4 sm:px-6">
            {children}
          </div>
        </main>

        {/* Compact Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            {/* Navigation Background */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 rounded-2xl sm:rounded-3xl blur-lg"></div>
              
              {/* Main nav container */}
              <div className="relative bg-white/95 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-xl p-1.5 sm:p-2">
                <div className="flex items-center justify-around">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-500 ease-out group ${
                          isActive ? 'transform scale-105 sm:scale-110' : 'hover:scale-105'
                        }`}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          zIndex: isActive ? 20 : 10
                        }}
                      >
                        {/* Active background */}
                        {isActive && (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl sm:rounded-2xl shadow-md animate-pulse`}></div>
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl sm:rounded-2xl opacity-20 blur-sm scale-125 sm:scale-150`}></div>
                          </>
                        )}
                        
                        {/* Hover background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        {/* Icon container */}
                        <div className={`relative z-10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-600 group-hover:text-gray-800'
                        }`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        
                        {/* Label */}
                        <span className={`relative z-10 text-xs font-semibold mt-0.5 sm:mt-1 transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                          {tab.label}
                        </span>
                        
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${tab.gradient} rounded-full animate-pulse`}></div>
                          </div>
                        )}
                        
                        {/* Ripple effect on tap */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-active:opacity-20 transition-opacity duration-150 rounded-xl sm:rounded-2xl`}></div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
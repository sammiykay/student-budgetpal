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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/5 to-teal-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Content Area */}
        <main className="flex-1 pb-28">
          <div className="max-w-lg mx-auto">
            {children}
          </div>
        </main>

        {/* Enhanced Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
          <div className="max-w-lg mx-auto">
            {/* Navigation Background */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              
              {/* Main nav container */}
              <div className="relative bg-white/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-2">
                <div className="flex items-center justify-around">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center p-3 rounded-2xl transition-all duration-500 ease-out group ${
                          isActive ? 'transform scale-110' : 'hover:scale-105'
                        }`}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          zIndex: isActive ? 20 : 10
                        }}
                      >
                        {/* Active background */}
                        {isActive && (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl shadow-lg animate-pulse`}></div>
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl opacity-20 blur-md scale-150`}></div>
                          </>
                        )}
                        
                        {/* Hover background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        {/* Icon container */}
                        <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-600 group-hover:text-gray-800'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        {/* Label */}
                        <span className={`relative z-10 text-xs font-semibold mt-1 transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                          {tab.label}
                        </span>
                        
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`w-2 h-2 bg-gradient-to-r ${tab.gradient} rounded-full animate-pulse`}></div>
                          </div>
                        )}
                        
                        {/* Ripple effect on tap */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-active:opacity-20 transition-opacity duration-150 rounded-2xl`}></div>
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
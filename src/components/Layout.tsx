import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Plus, BarChart3, Target, Settings, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'add', icon: Plus, label: 'Add' },
  { id: 'reports', icon: BarChart3, label: 'Reports' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center space-y-1 p-2 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                  />
                )}
                <Icon 
                  className={`h-5 w-5 ${
                    isActive 
                      ? 'text-teal-600' 
                      : 'text-gray-400'
                  }`} 
                />
                <span 
                  className={`text-xs ${
                    isActive 
                      ? 'text-teal-600 font-medium' 
                      : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
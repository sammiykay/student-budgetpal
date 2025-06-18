import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Info, Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react'

export function Settings() {
  const { user, signOut } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOut()
    }
  }

  const handleDeleteAccount = () => {
    alert('This feature will be implemented in a future update.')
    setShowDeleteModal(false)
  }

  return (
    <div className="pt-8 sm:pt-12 pb-6 sm:pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Profile</h2>
              <p className="text-gray-600 text-sm sm:text-base truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            About BudgetPal Student
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm sm:text-base">Version</span>
              <span className="font-medium text-sm sm:text-base">1.0.0</span>
            </div>
            
            <div className="py-2 border-b border-gray-100">
              <p className="text-gray-600 text-xs sm:text-sm">
                Your smart budgeting companion designed specifically for students.
              </p>
            </div>
            
            <div className="py-2">
              <p className="text-gray-600 text-xs sm:text-sm">
                Track expenses, set goals, and build better financial habits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Privacy & Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center py-2 border-b border-gray-100">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Data Encryption</p>
                <p className="text-xs sm:text-sm text-gray-600">Your data is encrypted and secure</p>
              </div>
            </div>
            
            <div className="flex items-center py-2 border-b border-gray-100">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Privacy Protection</p>
                <p className="text-xs sm:text-sm text-gray-600">We never share your personal information</p>
              </div>
            </div>
            
            <div className="flex items-center py-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Financial Data</p>
                <p className="text-xs sm:text-sm text-gray-600">All financial data stays private to you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={handleSignOut}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Sign Out
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full border border-red-500 text-red-600 hover:bg-red-50 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            </div>
            
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
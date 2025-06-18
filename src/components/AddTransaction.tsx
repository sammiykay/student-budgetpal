import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const expenseCategories = [
  { name: 'Food', emoji: '🍜' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Data', emoji: '📱' },
  { name: 'Books', emoji: '📚' },
  { name: 'Hangout', emoji: '🎉' },
  { name: 'Other', emoji: '💳' },
]

const incomeFrequencies = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function AddTransaction() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])

  // Income form state
  const [incomeTitle, setIncomeTitle] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeFrequency, setIncomeFrequency] = useState('monthly')

  const resetExpenseForm = () => {
    setExpenseAmount('')
    setExpenseCategory('')
    setExpenseDescription('')
    setExpenseDate(new Date().toISOString().split('T')[0])
  }

  const resetIncomeForm = () => {
    setIncomeTitle('')
    setIncomeAmount('')
    setIncomeFrequency('monthly')
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !expenseAmount || !expenseCategory) return

    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
        date: expenseDate
      })

    if (error) {
      setError('Failed to add expense')
    } else {
      setSuccess('Expense added successfully! 🎉')
      resetExpenseForm()
      setTimeout(() => setSuccess(''), 3000)
    }

    setLoading(false)
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !incomeTitle || !incomeAmount) return

    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('incomes')
      .insert({
        user_id: user.id,
        title: incomeTitle,
        amount: parseFloat(incomeAmount),
        frequency: incomeFrequency
      })

    if (error) {
      setError('Failed to add income')
    } else {
      setSuccess('Income added successfully! 💰')
      resetIncomeForm()
      setTimeout(() => setSuccess(''), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Transaction</h1>
        <p className="text-gray-600">Keep track of your money flow</p>
      </motion.div>

      {/* Tab Selector */}
      <div className="bg-gray-100 p-1 rounded-xl">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('expense')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'expense'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'income'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Add Income
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{success}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Forms */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        {activeTab === 'expense' ? (
          <form onSubmit={handleExpenseSubmit} className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {expenseCategories.map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setExpenseCategory(category.name)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      expenseCategory === category.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl block mb-1">{category.emoji}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="What did you spend on?"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !expenseAmount || !expenseCategory}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Expense...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleIncomeSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Source
              </label>
              <input
                type="text"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Part-time job, Allowance, Scholarship"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {incomeFrequencies.map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setIncomeFrequency(freq.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      incomeFrequency === freq.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{freq.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !incomeTitle || !incomeAmount}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Income...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
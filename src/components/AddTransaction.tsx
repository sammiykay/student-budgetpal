import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DollarSign, Calendar, FileText } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
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
    if (!user || !expenseAmount || !expenseCategory) {
      setError('Please fill in all required fields')
      return
    }

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
    }

    setLoading(false)
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !incomeTitle || !incomeAmount) {
      setError('Please fill in all required fields')
      return
    }

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
    }

    setLoading(false)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Transaction</h1>
        <p className="text-gray-600">Keep track of your money flow</p>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'expense'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          Add Expense
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'income'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          Add Income
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Forms */}
      <div className="card">
        {activeTab === 'expense' ? (
          <form onSubmit={handleExpenseSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="input pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {expenseCategories.map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setExpenseCategory(category.name)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      expenseCategory === category.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.emoji}</div>
                    <div className={`text-sm font-medium ${
                      expenseCategory === category.name ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {category.name}
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
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="input pl-10 h-20 resize-none"
                  placeholder="What did you spend on?"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !expenseAmount || !expenseCategory}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Expense...' : 'Add Expense'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleIncomeSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Source *
              </label>
              <input
                type="text"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                className="input"
                placeholder="e.g., Part-time job, Allowance, Scholarship"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="input pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {incomeFrequencies.map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setIncomeFrequency(freq.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      incomeFrequency === freq.value
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{freq.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !incomeTitle || !incomeAmount}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Income...' : 'Add Income'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
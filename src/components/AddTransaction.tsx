import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DollarSign, Calendar, FileText, Plus, Check, Sparkles } from 'lucide-react'

const expenseCategories = [
  { name: 'Food', emoji: '🍜', gradient: 'from-orange-400 to-red-500' },
  { name: 'Transport', emoji: '🚗', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Data', emoji: '📱', gradient: 'from-purple-400 to-pink-500' },
  { name: 'Books', emoji: '📚', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Hangout', emoji: '🎉', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Other', emoji: '💳', gradient: 'from-gray-400 to-slate-500' },
]

const incomeFrequencies = [
  { value: 'one-time', label: 'One-time', icon: '⚡' },
  { value: 'weekly', label: 'Weekly', icon: '📅' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
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
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pt-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg float-animation">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Add Transaction
        </h1>
        <p className="text-gray-600">Keep track of your money flow</p>
      </div>

      {/* Tab Selector */}
      <div className="glass-card p-2 mb-8">
        <div className="flex rounded-xl overflow-hidden">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'expense'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'income'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Add Income
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="card-modern bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl mr-3">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="card-modern bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-red-400 to-rose-500 rounded-xl mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Forms */}
      <div className="card-modern">
        {activeTab === 'expense' ? (
          <form onSubmit={handleExpenseSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amount (₦) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="input-modern pl-12"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {expenseCategories.map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setExpenseCategory(category.name)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      expenseCategory === category.name
                        ? 'border-transparent shadow-lg scale-105'
                        : 'border-gray-200/50 hover:border-gray-300/50 bg-white/80'
                    }`}
                  >
                    {expenseCategory === category.name && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-xl opacity-90`}></div>
                    )}
                    <div className="relative z-10">
                      <div className="text-2xl mb-2">{category.emoji}</div>
                      <div className={`text-sm font-semibold ${
                        expenseCategory === category.name ? 'text-white' : 'text-gray-700'
                      }`}>
                        {category.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="input-modern pl-12 h-24 resize-none"
                  placeholder="What did you spend on?"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="input-modern pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !expenseAmount || !expenseCategory}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Expense...
                </div>
              ) : (
                'Add Expense'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleIncomeSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Income Source *
              </label>
              <input
                type="text"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                className="input-modern"
                placeholder="e.g., Part-time job, Allowance, Scholarship"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amount (₦) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="input-modern pl-12"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Frequency *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {incomeFrequencies.map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setIncomeFrequency(freq.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      incomeFrequency === freq.value
                        ? 'border-transparent bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                        : 'border-gray-200/50 hover:border-gray-300/50 text-gray-700 bg-white/80'
                    }`}
                  >
                    <div className="text-xl mb-1">{freq.icon}</div>
                    <div className="text-sm font-semibold">{freq.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !incomeTitle || !incomeAmount}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Income...
                </div>
              ) : (
                'Add Income'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
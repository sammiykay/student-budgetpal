import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DollarSign, Calendar, FileText, Plus, Check, Sparkles, Zap } from 'lucide-react'

const expenseCategories = [
  { name: 'Food', emoji: '🍜', gradient: 'from-orange-400 to-red-500' },
  { name: 'Transport', emoji: '🚗', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Data', emoji: '📱', gradient: 'from-purple-400 to-pink-500' },
  { name: 'Books', emoji: '📚', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Hangout', emoji: '🎉', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Other', emoji: '💳', gradient: 'from-gray-400 to-slate-500' },
]

const incomeFrequencies = [
  { value: 'one-time', label: 'One-time', icon: '⚡', gradient: 'from-yellow-400 to-orange-500' },
  { value: 'weekly', label: 'Weekly', icon: '📅', gradient: 'from-blue-400 to-cyan-500' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️', gradient: 'from-purple-400 to-pink-500' },
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
    <div className="px-6 pt-12 pb-8">
      {/* Enhanced Header */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl float-animation">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-600/20 to-cyan-600/20 rounded-3xl blur-xl scale-110 animate-pulse"></div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-3">
          Add Transaction
        </h1>
        <p className="text-gray-600 text-lg">Keep track of your money flow</p>
      </div>

      {/* Enhanced Tab Selector */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-3xl p-3 shadow-xl">
          <div className="flex rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden ${
                activeTab === 'expense'
                  ? 'text-white shadow-xl transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {activeTab === 'expense' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-600/20 rounded-2xl blur-xl scale-150"></div>
                </>
              )}
              <span className="relative z-10">💸 Add Expense</span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden ${
                activeTab === 'income'
                  ? 'text-white shadow-xl transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {activeTab === 'income' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl scale-150"></div>
                </>
              )}
              <span className="relative z-10">💰 Add Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Success/Error Messages */}
      {success && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl mr-4 shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-700 font-bold text-lg">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl mr-4 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-red-700 font-bold text-lg">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Form Container */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-3xl p-8 shadow-xl">
          {activeTab === 'expense' ? (
            <form onSubmit={handleExpenseSubmit} className="space-y-8">
              {/* Amount */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Amount (₦) *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/90 transition-all duration-300 placeholder-gray-400 text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {expenseCategories.map(category => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setExpenseCategory(category.name)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${
                        expenseCategory === category.name
                          ? 'border-transparent shadow-2xl scale-105'
                          : 'border-gray-200/50 hover:border-gray-300/50 bg-white/80 hover:shadow-lg'
                      }`}
                    >
                      {expenseCategory === category.name && (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-2xl`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-2xl opacity-20 blur-xl scale-110`}></div>
                        </>
                      )}
                      <div className="relative z-10">
                        <div className="text-3xl mb-3">{category.emoji}</div>
                        <div className={`text-sm font-bold ${
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
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Description (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-4 p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <textarea
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent focus:bg-white/90 transition-all duration-300 placeholder-gray-400 h-28 resize-none"
                    placeholder="What did you spend on?"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent focus:bg-white/90 transition-all duration-300 text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !expenseAmount || !expenseCategory}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-3xl text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Adding Expense...
                  </div>
                ) : (
                  '💸 Add Expense'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleIncomeSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Income Source *
                </label>
                <input
                  type="text"
                  value={incomeTitle}
                  onChange={(e) => setIncomeTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent focus:bg-white/90 transition-all duration-300 placeholder-gray-400 text-lg font-semibold"
                  placeholder="e.g., Part-time job, Allowance, Scholarship"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Amount (₦) *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent focus:bg-white/90 transition-all duration-300 placeholder-gray-400 text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Frequency *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {incomeFrequencies.map(freq => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setIncomeFrequency(freq.value)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${
                        incomeFrequency === freq.value
                          ? 'border-transparent shadow-2xl scale-105'
                          : 'border-gray-200/50 hover:border-gray-300/50 text-gray-700 bg-white/80 hover:shadow-lg'
                      }`}
                    >
                      {incomeFrequency === freq.value && (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-r ${freq.gradient} rounded-2xl`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-r ${freq.gradient} rounded-2xl opacity-20 blur-xl scale-110`}></div>
                        </>
                      )}
                      <div className="relative z-10">
                        <div className="text-2xl mb-2">{freq.icon}</div>
                        <div className={`text-sm font-bold ${
                          incomeFrequency === freq.value ? 'text-white' : 'text-gray-700'
                        }`}>
                          {freq.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !incomeTitle || !incomeAmount}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-3xl text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Adding Income...
                  </div>
                ) : (
                  '💰 Add Income'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
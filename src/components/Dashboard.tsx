import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Wallet, Lightbulb, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Sparkles } from 'lucide-react'

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  recentExpenses: any[]
}

const dailyTips = [
  "💡 Track every expense, no matter how small - they add up!",
  "🎯 Set a weekly spending limit and stick to it.",
  "📱 Use apps wisely - cancel subscriptions you don't use.",
  "🍜 Cook at home more often to save on food costs.",
  "📚 Buy used textbooks or borrow from the library.",
  "🚗 Use public transport or walk when possible.",
  "💰 Look for student discounts everywhere you shop.",
  "🎉 Set aside fun money so you don't feel deprived."
]

const categoryEmojis: { [key: string]: string } = {
  'Food': '🍜',
  'Transport': '🚗',
  'Data': '📱',
  'Books': '📚',
  'Hangout': '🎉',
  'Other': '💳'
}

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentExpenses: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dailyTip] = useState(() => {
    const today = new Date().getDate()
    return dailyTips[today % dailyTips.length]
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    
    // Get total income
    const { data: incomes } = await supabase
      .from('incomes')
      .select('amount, frequency')
      .eq('user_id', user.id)

    // Get total expenses for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category, description, date')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate monthly income
    let monthlyIncome = 0
    incomes?.forEach(income => {
      if (income.frequency === 'monthly') {
        monthlyIncome += income.amount
      } else if (income.frequency === 'weekly') {
        monthlyIncome += income.amount * 4.33
      } else {
        monthlyIncome += income.amount
      }
    })

    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
    
    setData({
      totalIncome: monthlyIncome,
      totalExpenses,
      balance: monthlyIncome - totalExpenses,
      recentExpenses: expenses || []
    })
    
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pt-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg float-animation">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mb-4">Here's your financial overview</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Daily Tip */}
      <div className="card-modern bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 mb-8">
        <div className="flex items-start">
          <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl mr-4">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 mb-1">Daily Tip</h3>
            <p className="text-amber-700 text-sm leading-relaxed">{dailyTip}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 mb-8">
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="stat-card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Monthly Income</p>
                  <p className="text-2xl font-bold text-white">₦{data.totalIncome.toLocaleString()}</p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-rose-500 to-pink-600">
          <div className="stat-card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-rose-100 text-sm font-medium">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-white">₦{data.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        <div className={`stat-card ${data.balance >= 0 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
          : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
          <div className="stat-card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Net Balance</p>
                  <p className="text-2xl font-bold text-white">₦{data.balance.toLocaleString()}</p>
                </div>
              </div>
              <Eye className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card-modern">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        
        {data.recentExpenses.length > 0 ? (
          <div className="space-y-4">
            {data.recentExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">
                      {categoryEmojis[expense.category] || '💳'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{expense.category}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-500">{expense.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600">-₦{expense.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500">Start tracking your spending to see insights here! 💰</p>
          </div>
        )}
      </div>
    </div>
  )
}
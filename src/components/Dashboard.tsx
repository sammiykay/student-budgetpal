import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Wallet, Lightbulb, RefreshCw } from 'lucide-react'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600">Here's your budget overview</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-2 p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Daily Tip */}
      <div className="card bg-yellow-50 border-yellow-200 mb-6">
        <div className="flex items-start">
          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-yellow-800 text-sm font-medium">{dailyTip}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 mb-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-700 font-medium">Monthly Income</p>
                <p className="text-2xl font-bold text-green-800">₦{data.totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingDown className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-red-700 font-medium">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-800">₦{data.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`card ${data.balance >= 0 ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className={`w-6 h-6 mr-3 ${data.balance >= 0 ? 'text-teal-600' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-medium ${data.balance >= 0 ? 'text-teal-700' : 'text-red-700'}`}>Balance</p>
                <p className={`text-2xl font-bold ${data.balance >= 0 ? 'text-teal-800' : 'text-red-800'}`}>
                  ₦{data.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Expenses</h2>
        {data.recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {data.recentExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {categoryEmojis[expense.category] || '💳'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-500">{expense.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-₦{expense.amount}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses recorded yet. Start tracking your spending! 💰</p>
          </div>
        )}
      </div>
    </div>
  )
}
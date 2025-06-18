import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Wallet, Lightbulb, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Sparkles, ChevronRight } from 'lucide-react'

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
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Enhanced Header */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl float-animation">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl scale-110 animate-pulse"></div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg mb-6">Here's your financial overview</p>
        
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-lg transition-all duration-300 group"
        >
          <RefreshCw className={`w-5 h-5 mr-2 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Enhanced Daily Tip */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-3xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl mr-4 shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 mb-2 text-lg">💡 Daily Tip</h3>
              <p className="text-amber-700 leading-relaxed">{dailyTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="space-y-6 mb-10">
        {/* Income Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                  <ArrowUpRight className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 font-medium mb-1">Monthly Income</p>
                  <p className="text-3xl font-bold text-white">₦{data.totalIncome.toLocaleString()}</p>
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-white/40" />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                  <ArrowDownRight className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-rose-100 font-medium mb-1">Monthly Expenses</p>
                  <p className="text-3xl font-bold text-white">₦{data.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              <TrendingDown className="w-10 h-10 text-white/40" />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 ${
            data.balance >= 0 
              ? 'bg-gradient-to-r from-blue-500/20 to-indigo-600/20' 
              : 'bg-gradient-to-r from-red-500/20 to-rose-600/20'
          }`}></div>
          <div className={`relative rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
            data.balance >= 0 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/80 font-medium mb-1">Net Balance</p>
                  <p className="text-3xl font-bold text-white">₦{data.balance.toLocaleString()}</p>
                </div>
              </div>
              <Eye className="w-10 h-10 text-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Expenses */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Expenses</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          {data.recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {data.recentExpenses.map((expense, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">
                        {categoryEmojis[expense.category] || '💳'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{expense.category}</p>
                      {expense.description && (
                        <p className="text-gray-500 text-sm mb-1">{expense.description}</p>
                      )}
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(expense.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600 text-xl">-₦{expense.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No expenses yet</h3>
              <p className="text-gray-500 text-lg">Start tracking your spending to see insights here! 💰</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
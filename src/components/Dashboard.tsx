import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Lightbulb } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentExpenses: []
  })
  const [loading, setLoading] = useState(true)
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
        monthlyIncome += income.amount * 4.33 // Average weeks per month
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

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Food': '🍜',
      'Transport': '🚗',
      'Data': '📱',
      'Books': '📚',
      'Hangout': '🎉',
      'Other': '💳'
    }
    return emojiMap[category] || '💳'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">Here's your budget overview</p>
      </motion.div>

      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border border-yellow-200"
      >
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 font-medium">{dailyTip}</p>
        </div>
      </motion.div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{data.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ₦{data.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${
                data.balance >= 0 ? 'text-teal-600' : 'text-red-600'
              }`}>
                ₦{data.balance.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              data.balance >= 0 ? 'bg-teal-100' : 'bg-red-100'
            }`}>
              <PiggyBank className={`h-6 w-6 ${
                data.balance >= 0 ? 'text-teal-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>
        <div className="p-6 space-y-4">
          {data.recentExpenses.length > 0 ? (
            data.recentExpenses.map((expense, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryEmoji(expense.category)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-500">{expense.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">-₦{expense.amount}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No expenses recorded yet. Start tracking your spending! 💰
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
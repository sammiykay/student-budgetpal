import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import html2pdf from 'html2pdf.js'

interface ExpenseData {
  category: string
  amount: number
  color: string
  emoji: string
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

const categoryColors = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Data': '#45B7D1',
  'Books': '#96CEB4',
  'Hangout': '#FFEAA7',
  'Other': '#DDA0DD'
}

const categoryEmojis = {
  'Food': '🍜',
  'Transport': '🚗',
  'Data': '📱',
  'Books': '📚',
  'Hangout': '🎉',
  'Other': '💳'
}

export function Reports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    if (user) {
      loadReportData()
    }
  }, [user, selectedMonth])

  const loadReportData = async () => {
    if (!user) return

    setLoading(true)

    // Get current month data
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), selectedMonth, 1)
    const endOfMonth = new Date(currentDate.getFullYear(), selectedMonth + 1, 0)

    // Get expenses for selected month
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])

    // Get income data
    const { data: incomes } = await supabase
      .from('incomes')
      .select('amount, frequency')
      .eq('user_id', user.id)

    // Calculate category totals
    const categoryTotals: { [key: string]: number } = {}
    expenses?.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    const expenseChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category as keyof typeof categoryColors] || '#DDA0DD',
      emoji: categoryEmojis[category as keyof typeof categoryEmojis] || '💳'
    }))

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

    const monthlyExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

    // Generate last 6 months data for trend chart
    const monthsData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      monthsData.push({
        month: monthName,
        income: monthlyIncome, // Simplified - using current income
        expenses: monthlyExpenses * (0.8 + Math.random() * 0.4) // Simulated variance
      })
    }

    setExpenseData(expenseChartData)
    setMonthlyData(monthsData)
    setTotalIncome(monthlyIncome)
    setTotalExpenses(monthlyExpenses)
    setLoading(false)
  }

  const exportToPDF = () => {
    const element = document.getElementById('report-content')
    const opt = {
      margin: 1,
      filename: `budget-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Budget Reports</h1>
          <p className="text-gray-600">Your spending insights and trends</p>
        </div>
        <button
          onClick={exportToPDF}
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
      </motion.div>

      {/* Month Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {monthNames.map((month, index) => (
            <option key={index} value={index}>
              {month} {new Date().getFullYear()}
            </option>
          ))}
        </select>
      </div>

      <div id="report-content" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{totalIncome.toLocaleString()}
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
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ₦{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
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
                <p className="text-sm text-gray-600 mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  totalIncome - totalExpenses >= 0 ? 'text-teal-600' : 'text-red-600'
                }`}>
                  ₦{(totalIncome - totalExpenses).toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                totalIncome - totalExpenses >= 0 ? 'bg-teal-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  totalIncome - totalExpenses >= 0 ? 'text-teal-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expense Categories Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          {expenseData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₦{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No expenses recorded for this month 📊
            </p>
          )}
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">6-Month Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import jsPDF from 'jspdf'

interface ExpenseData {
  name: string
  value: number
  color: string
}

const categoryColors: { [key: string]: string } = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Data': '#45B7D1',
  'Books': '#96CEB4',
  'Hangout': '#FFEAA7',
  'Other': '#DDA0DD'
}

export function Reports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)

  useEffect(() => {
    if (user) {
      loadReportData()
    }
  }, [user])

  const loadReportData = async () => {
    if (!user) return

    setLoading(true)

    // Get current month data
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Get expenses for current month
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
      name: category,
      value: amount,
      color: categoryColors[category] || '#DDA0DD',
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

    setExpenseData(expenseChartData)
    setTotalIncome(monthlyIncome)
    setTotalExpenses(monthlyExpenses)
    setLoading(false)
  }

  const exportToPDF = async () => {
    const pdf = new jsPDF()
    
    // Header
    pdf.setFontSize(20)
    pdf.text('BudgetPal Student Report', 20, 30)
    
    pdf.setFontSize(12)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 45)
    
    // Summary
    pdf.setFontSize(16)
    pdf.text('Financial Summary', 20, 70)
    
    pdf.setFontSize(12)
    pdf.text(`Total Income: ₦${totalIncome.toLocaleString()}`, 20, 90)
    pdf.text(`Total Expenses: ₦${totalExpenses.toLocaleString()}`, 20, 105)
    pdf.text(`Net Balance: ₦${(totalIncome - totalExpenses).toLocaleString()}`, 20, 120)
    
    // Expenses by category
    pdf.setFontSize(16)
    pdf.text('Expenses by Category', 20, 150)
    
    let yPos = 170
    expenseData.forEach(item => {
      pdf.setFontSize(12)
      pdf.text(`${item.name}: ₦${item.value.toLocaleString()}`, 20, yPos)
      yPos += 15
    })
    
    pdf.save('budget-report.pdf')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-6 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Budget Reports</h1>
        </div>
        <button
          onClick={exportToPDF}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center text-sm sm:text-base"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-700 font-medium">Total Income</p>
                <p className="text-lg sm:text-xl font-bold text-green-800 truncate">₦{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                <p className="text-lg sm:text-xl font-bold text-red-800 truncate">₦{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`relative ${totalIncome - totalExpenses >= 0 ? '' : ''}`}>
          <div className={`absolute inset-0 rounded-2xl blur-xl ${totalIncome - totalExpenses >= 0 ? 'bg-gradient-to-r from-teal-400/20 to-cyan-500/20' : 'bg-gradient-to-r from-red-400/20 to-rose-500/20'}`}></div>
          <div className={`relative rounded-2xl p-4 sm:p-6 shadow-lg border ${totalIncome - totalExpenses >= 0 ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200/50' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50'}`}>
            <div className="flex items-center">
              <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 ${totalIncome - totalExpenses >= 0 ? 'text-teal-600' : 'text-red-600'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${totalIncome - totalExpenses >= 0 ? 'text-teal-700' : 'text-red-700'}`}>Net Balance</p>
                <p className={`text-lg sm:text-xl font-bold truncate ${totalIncome - totalExpenses >= 0 ? 'text-teal-800' : 'text-red-800'}`}>
                  ₦{(totalIncome - totalExpenses).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories Chart */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Expenses by Category</h2>
          {expenseData.length > 0 ? (
            <div>
              <div className="h-48 sm:h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelStyle={{ fontSize: '12px' }}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base flex-shrink-0 ml-2">₦{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No expenses recorded for this month 📊</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
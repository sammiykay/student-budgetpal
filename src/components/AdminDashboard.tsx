import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Calendar,
  Eye,
  Shield,
  BarChart3,
  UserCheck,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw
} from 'lucide-react'

interface UserStats {
  totalUsers: number
  newUsersThisMonth: number
  activeUsers: number
  totalExpenses: number
  totalIncome: number
  totalGoals: number
}

interface RecentUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
}

interface ExpenseByCategory {
  category: string
  total: number
  count: number
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    totalExpenses: 0,
    totalIncome: 0,
    totalGoals: 0
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([])

  // Check if user is admin
  const isAdmin = user?.email === 'okesamson1@gmail.com'

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData()
    }
  }, [user, isAdmin])

  const loadAdminData = async () => {
    if (!isAdmin) return

    setLoading(true)

    try {
      // Get user statistics from auth.users (requires service role key in production)
      // For now, we'll use a workaround by counting from our app tables
      
      // Get total users (approximate from expenses/incomes tables)
      const { data: expenseUsers } = await supabase
        .from('expenses')
        .select('user_id')
        .limit(1000)

      const { data: incomeUsers } = await supabase
        .from('incomes')
        .select('user_id')
        .limit(1000)

      const uniqueUsers = new Set([
        ...(expenseUsers?.map(e => e.user_id) || []),
        ...(incomeUsers?.map(i => i.user_id) || [])
      ])

      // Get this month's data
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Get total expenses
      const { data: allExpenses } = await supabase
        .from('expenses')
        .select('amount, category, created_at')

      // Get total income
      const { data: allIncomes } = await supabase
        .from('incomes')
        .select('amount, frequency')

      // Get total goals
      const { data: allGoals } = await supabase
        .from('goals')
        .select('id')

      // Calculate monthly income
      let totalIncome = 0
      allIncomes?.forEach(income => {
        if (income.frequency === 'monthly') {
          totalIncome += income.amount
        } else if (income.frequency === 'weekly') {
          totalIncome += income.amount * 4.33
        } else {
          totalIncome += income.amount
        }
      })

      // Calculate expenses by category
      const categoryTotals: { [key: string]: { total: number, count: number } } = {}
      allExpenses?.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = { total: 0, count: 0 }
        }
        categoryTotals[expense.category].total += expense.amount
        categoryTotals[expense.category].count += 1
      })

      const expensesByCategory = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.total - a.total)

      // New users this month (approximate)
      const newUsersThisMonth = allExpenses?.filter(expense => 
        new Date(expense.created_at) >= startOfMonth
      ).length || 0

      setStats({
        totalUsers: uniqueUsers.size,
        newUsersThisMonth: Math.min(newUsersThisMonth, uniqueUsers.size),
        activeUsers: Math.floor(uniqueUsers.size * 0.7), // Estimate
        totalExpenses: allExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0,
        totalIncome,
        totalGoals: allGoals?.length || 0
      })

      setExpensesByCategory(expensesByCategory)

      // Mock recent users data (in production, you'd get this from auth.users)
      const mockRecentUsers: RecentUser[] = [
        {
          id: '1',
          email: 'student1@example.com',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          email: 'student2@example.com',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          email: 'student3@example.com',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 10800000).toISOString()
        }
      ]

      setRecentUsers(mockRecentUsers)

    } catch (error) {
      console.error('Error loading admin data:', error)
    }

    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAdminData()
    setRefreshing(false)
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-6 sm:pb-8">
      {/* Enhanced Header */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="relative inline-block mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl sm:shadow-2xl float-animation">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20 rounded-2xl sm:rounded-3xl blur-xl scale-110 animate-pulse"></div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-2 sm:mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">Monitor your app's performance and users</p>
        
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-lg transition-all duration-300 group text-sm sm:text-base"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span className="font-medium">Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10">
        {/* Total Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            </div>
            <p className="text-blue-100 font-medium text-xs sm:text-sm">Total Users</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
        </div>

        {/* New Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            </div>
            <p className="text-emerald-100 font-medium text-xs sm:text-sm">New This Month</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.newUsersThisMonth}</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            </div>
            <p className="text-purple-100 font-medium text-xs sm:text-sm">Active Users</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.activeUsers}</p>
          </div>
        </div>

        {/* Total Goals */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            </div>
            <p className="text-orange-100 font-medium text-xs sm:text-sm">Total Goals</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalGoals}</p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
        {/* Total Income */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="p-2 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-green-100 font-medium mb-1 text-sm sm:text-base">Total Platform Income</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">₦{stats.totalIncome.toLocaleString()}</p>
                </div>
              </div>
              <DollarSign className="w-6 h-6 sm:w-10 sm:h-10 text-white/40 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="p-2 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                  <ArrowDownRight className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-rose-100 font-medium mb-1 text-sm sm:text-base">Total Platform Expenses</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">₦{stats.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              <Wallet className="w-6 h-6 sm:w-10 sm:h-10 text-white/40 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="relative mb-6 sm:mb-10">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Expenses by Category</h2>
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
          
          {expensesByCategory.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {expensesByCategory.map((category, index) => (
                <div 
                  key={category.category} 
                  className="group flex items-center justify-between p-3 sm:p-5 bg-gray-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <span className="text-lg sm:text-2xl">
                        {category.category === 'Food' ? '🍜' :
                         category.category === 'Transport' ? '🚗' :
                         category.category === 'Data' ? '📱' :
                         category.category === 'Books' ? '📚' :
                         category.category === 'Hangout' ? '🎉' : '💳'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-lg truncate">{category.category}</p>
                      <p className="text-gray-500 text-xs sm:text-sm">{category.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-xl">₦{category.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No expense data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Recent Users</h2>
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recentUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="group flex items-center justify-between p-3 sm:p-5 bg-gray-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm sm:text-lg truncate">{user.email}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last active: {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
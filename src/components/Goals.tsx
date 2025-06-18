import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, CheckCircle, Trash2, Edit3, DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Goal {
  id: string
  goal_title: string
  target_amount: number
  current_amount: number
  completed: boolean
  created_at: string
}

const motivationalQuotes = [
  "💪 Small steps lead to big achievements!",
  "🌟 Every rupee saved brings you closer to your goal!",
  "🚀 You're building your financial future!",
  "💎 Discipline today, freedom tomorrow!",
  "🎯 Stay focused, you've got this!"
]

export function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  
  // Form state
  const [goalTitle, setGoalTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [addAmount, setAddAmount] = useState('')

  const [motivationalQuote] = useState(() => {
    const today = new Date().getDate()
    return motivationalQuotes[today % motivationalQuotes.length]
  })

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
    setLoading(false)
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !goalTitle || !targetAmount) return

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_title: goalTitle,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        completed: false
      })

    if (!error) {
      setGoalTitle('')
      setTargetAmount('')
      setShowAddForm(false)
      loadGoals()
    }
  }

  const handleAddToGoal = async (goalId: string) => {
    if (!addAmount) return

    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const newAmount = goal.current_amount + parseFloat(addAmount)
    const isCompleted = newAmount >= goal.target_amount

    const { error } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        completed: isCompleted
      })
      .eq('id', goalId)

    if (!error) {
      setAddAmount('')
      setEditingGoal(null)
      loadGoals()
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (!error) {
      loadGoals()
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
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
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h1>
        <p className="text-gray-600">Save smart, achieve your dreams</p>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border border-purple-200"
      >
        <div className="flex items-center justify-center">
          <p className="text-center text-purple-800 font-medium">{motivationalQuote}</p>
        </div>
      </motion.div>

      {/* Add Goal Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowAddForm(true)}
        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white p-4 rounded-xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Plus className="h-5 w-5" />
        <span>Set New Goal</span>
      </motion.button>

      {/* Add Goal Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., New Laptop, Emergency Fund"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (₦)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal, index) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount)
            const isEditing = editingGoal === goal.id

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                  goal.completed ? 'ring-2 ring-green-200 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      goal.completed ? 'bg-green-500' : 'bg-teal-100'
                    }`}>
                      {goal.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Target className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.goal_title}</h3>
                      <p className="text-sm text-gray-600">
                        ₦{goal.current_amount.toLocaleString()} of ₦{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!goal.completed && (
                      <button
                        onClick={() => setEditingGoal(isEditing ? null : goal.id)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{progress.toFixed(0)}% Complete</span>
                    <span>₦{(goal.target_amount - goal.current_amount).toLocaleString()} remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-3 rounded-full ${
                        goal.completed
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gradient-to-r from-teal-400 to-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Add Money Form */}
                {isEditing && !goal.completed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t pt-4"
                  >
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Amount to add"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToGoal(goal.id)}
                        disabled={!addAmount}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}

                {goal.completed && (
                  <div className="bg-green-100 p-3 rounded-lg text-center">
                    <p className="text-green-800 font-medium">
                      🎉 Congratulations! Goal achieved!
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set yet</h3>
            <p className="text-gray-600 mb-6">Start by setting your first financial goal!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200"
            >
              Set Your First Goal
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
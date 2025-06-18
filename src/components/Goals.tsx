import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Target, Plus, Trash2, CheckCircle } from 'lucide-react'

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
  "🌟 Every naira saved brings you closer to your goal!",
  "🚀 You're building your financial future!",
  "💎 Discipline today, freedom tomorrow!",
  "🎯 Stay focused, you've got this!"
]

export function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
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
    if (!user || !goalTitle || !targetAmount) {
      setError('Please fill in all fields')
      return
    }

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
      setShowAddModal(false)
      setSuccess('Goal created successfully! 🎯')
      loadGoals()
    } else {
      setError('Failed to create goal')
    }
  }

  const handleAddToGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAmount || !selectedGoal) return

    const newAmount = selectedGoal.current_amount + parseFloat(addAmount)
    const isCompleted = newAmount >= selectedGoal.target_amount

    const { error } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        completed: isCompleted
      })
      .eq('id', selectedGoal.id)

    if (!error) {
      setAddAmount('')
      setShowAddMoneyModal(false)
      setSelectedGoal(null)
      if (isCompleted) {
        setSuccess('Congratulations! 🎉 You\'ve reached your goal!')
      } else {
        setSuccess('Amount added to goal! 💰')
      }
      loadGoals()
    } else {
      setError('Failed to update goal')
    }
  }

  const handleDeleteGoal = async (goal: Goal) => {
    if (window.confirm(`Are you sure you want to delete "${goal.goal_title}"?`)) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id)

      if (!error) {
        loadGoals()
      } else {
        setError('Failed to delete goal')
      }
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h1>
        <p className="text-gray-600">Save smart, achieve your dreams</p>
      </div>

      {/* Motivational Quote */}
      <div className="card bg-purple-50 border-purple-200 mb-6">
        <p className="text-purple-800 text-sm font-medium text-center">{motivationalQuote}</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add Goal Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full btn-primary mb-6 flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Set New Goal
      </button>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount)

            return (
              <div
                key={goal.id}
                className={`card ${goal.completed ? 'bg-green-50 border-green-200' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {goal.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    ) : (
                      <Target className="w-6 h-6 text-primary-600 mr-3" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.goal_title}</h3>
                      <p className="text-sm text-gray-600">
                        ₦{goal.current_amount.toLocaleString()} of ₦{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!goal.completed && (
                      <button
                        onClick={() => {
                          setSelectedGoal(goal)
                          setShowAddMoneyModal(true)
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{progress.toFixed(0)}% Complete</span>
                    <span>₦{(goal.target_amount - goal.current_amount).toLocaleString()} remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {goal.completed && (
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <p className="text-green-800 font-medium">🎉 Congratulations! Goal achieved!</p>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No goals set yet</h3>
            <p className="text-gray-600 mb-6">Start by setting your first financial goal!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Set Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Set New Goal</h2>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., New Laptop, Emergency Fund"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₦)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add to Goal</h2>
            <p className="text-gray-600 mb-4">{selectedGoal.goal_title}</p>
            
            <form onSubmit={handleAddToGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add (₦)
                </label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Add Amount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
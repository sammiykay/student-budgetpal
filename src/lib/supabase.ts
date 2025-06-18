import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      incomes: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          frequency: 'monthly' | 'weekly' | 'one-time'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          frequency: 'monthly' | 'weekly' | 'one-time'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: number
          frequency?: 'monthly' | 'weekly' | 'one-time'
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string
          date?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_title: string
          target_amount: number
          current_amount: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_title: string
          target_amount: number
          current_amount?: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_title?: string
          target_amount?: number
          current_amount?: number
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}
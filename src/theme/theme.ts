import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#14B8A6',
    secondary: '#06B6D4',
    tertiary: '#8B5CF6',
    surface: '#FFFFFF',
    background: '#F0FDFA',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
};

export const gradients = {
  primary: ['#14B8A6', '#06B6D4'],
  secondary: ['#8B5CF6', '#EC4899'],
  success: ['#10B981', '#059669'],
  error: ['#EF4444', '#DC2626'],
  warning: ['#F59E0B', '#D97706'],
};
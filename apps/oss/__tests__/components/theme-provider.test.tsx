import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider defaultTheme="dark" attribute="class">
        <div>Test Content</div>
      </ThemeProvider>
    )
    
    // The component should render without errors when props are passed
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
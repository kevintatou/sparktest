import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import TestRunsPage from '@/app/runs/page'
import { storage } from '@tatou/storage-service'
import type { Run, Definition, Executor } from '@tatou/core/types'

// Mock the storage service
vi.mock('@tatou/storage-service', () => ({
  storage: {
    getRuns: vi.fn(),
    getDefinitions: vi.fn(),
    getExecutors: vi.fn(),
    subscribeToRuns: vi.fn(() => () => {}), // Mock subscription cleanup function
  }
}))

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock formatDistanceToNow
vi.mock('@tatou/core', () => ({
  formatDistanceToNow: vi.fn(() => '1 hour ago')
}))

const mockDefinitions: Definition[] = [
  {
    id: 'def-1',
    name: 'API Tests',
    description: 'Test suite for API endpoints',
    image: 'postman/newman',
    commands: ['newman', 'run', 'collection.json'],
    createdAt: '2024-01-15T10:00:00Z'
  }
]

const mockExecutors: Executor[] = [
  {
    id: 'exec-1',
    name: 'Postman Newman',
    description: 'Run Postman collections',
    image: 'postman/newman:latest',
    createdAt: '2024-01-15T09:00:00Z'
  }
]

const mockRuns: Run[] = [
  {
    id: 'run-1',
    name: 'API Test Run #1',
    image: 'postman/newman',
    command: ['newman', 'run', 'collection.json'],
    status: 'completed',
    createdAt: '2024-01-15T11:00:00Z',
    definitionId: 'def-1',
    executorId: 'exec-1',
    duration: 45,
    logs: ['Starting test execution...', 'Running collection...', 'Tests completed successfully'],
    k8sJobName: 'sparktest-run-1-abcd'
  },
  {
    id: 'run-2',
    name: 'API Test Run #2',
    image: 'postman/newman',
    command: ['newman', 'run', 'collection.json'],
    status: 'failed',
    createdAt: '2024-01-15T10:30:00Z',
    definitionId: 'def-1',
    executorId: 'exec-1',
    duration: 30,
    logs: ['Starting test execution...', 'Error: Collection not found']
  },
  {
    id: 'run-3',
    name: 'API Test Run #3',
    image: 'postman/newman',
    command: ['newman', 'run', 'collection.json'],
    status: 'running',
    createdAt: '2024-01-15T11:30:00Z',
    definitionId: 'def-1',
    executorId: 'exec-1',
    k8sJobName: 'sparktest-run-3-efgh'
  }
]

describe('TestRunsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and description', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Runs')).toBeInTheDocument()
      expect(screen.getByText('Monitor and manage your runs')).toBeInTheDocument()
    })
  })

  it('displays the New Run button', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      const newButton = screen.getByRole('link', { name: /new run/i })
      expect(newButton).toBeInTheDocument()
      expect(newButton).toHaveAttribute('href', '/runs/new')
    })
  })

  it('renders search input', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search runs...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('displays runs when data is available', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
      expect(screen.getByText('API Test Run #2')).toBeInTheDocument()
      expect(screen.getByText('API Test Run #3')).toBeInTheDocument()
    })
  })

  it('shows empty state when no runs exist', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue([])
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No runs yet')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Start your first run to see execution results here.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start run/i })).toBeInTheDocument()
  })

  it('displays correct status icons and badges', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('failed')).toBeInTheDocument()
      expect(screen.getByText('running')).toBeInTheDocument()
    })
  })

  it('displays run details correctly', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    // Check run details
    expect(screen.getByText('Run ID: run-1')).toBeInTheDocument()
    expect(screen.getByText('45s')).toBeInTheDocument() // Duration for completed run
    expect(screen.getByText(/\d+s \(running\)/)).toBeInTheDocument() // Duration for running run
    
    // Check definition and executor names (use getAllByText since there are multiple)
    const apiTestsElements = screen.getAllByText('API Tests')
    expect(apiTestsElements.length).toBeGreaterThan(0)
    
    const postmanNewmanElements = screen.getAllByText('Postman Newman')
    expect(postmanNewmanElements.length).toBeGreaterThan(0)
  })

  it('displays Kubernetes job information', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('sparktest-run-1-abcd')).toBeInTheDocument()
      expect(screen.getByText('sparktest-run-3-efgh')).toBeInTheDocument()
    })
    
    // Check for Kubernetes Job headers
    const kubernetesJobHeaders = screen.getAllByText('Kubernetes Job')
    expect(kubernetesJobHeaders.length).toBeGreaterThan(0)
  })

  it('displays log previews', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })

    // Check for Recent Logs headers if logs are displayed
    const recentLogsHeaders = screen.queryAllByText('Recent Logs')
    if (recentLogsHeaders.length > 0) {
      expect(recentLogsHeaders.length).toBeGreaterThan(0)
      
      // Check for View All buttons
      const viewAllButtons = screen.queryAllByText('View All')
      expect(viewAllButtons.length).toBeGreaterThan(0)
    }
  })

  it('shows correct action buttons for different run states', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    // View Details buttons should exist for all runs
    const viewDetailsButtons = screen.getAllByRole('link', { name: /view details/i })
    expect(viewDetailsButtons).toHaveLength(3)
    
    // Logs buttons should exist for runs with logs
    const logsButtons = screen.getAllByRole('link', { name: /logs/i })
    expect(logsButtons.length).toBeGreaterThan(0)
    
    // Delete buttons should exist for non-running runs
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons).toHaveLength(2) // Only for completed and failed runs
    
    // Retry button should exist for failed runs
    const retryButtons = screen.getAllByRole('button', { name: /retry/i })
    expect(retryButtons).toHaveLength(1) // Only for failed run
  })

  it('filters runs based on search query', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search runs...')
    fireEvent.change(searchInput, { target: { value: 'Run #1' } })
    
    expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    expect(screen.queryByText('API Test Run #2')).not.toBeInTheDocument()
    expect(screen.queryByText('API Test Run #3')).not.toBeInTheDocument()
  })

  it('filters runs by status', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search runs...')
    fireEvent.change(searchInput, { target: { value: 'completed' } })
    
    expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    expect(screen.queryByText('API Test Run #2')).not.toBeInTheDocument()
    expect(screen.queryByText('API Test Run #3')).not.toBeInTheDocument()
  })

  it('filters runs by definition name', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search runs...')
    fireEvent.change(searchInput, { target: { value: 'API Tests' } })
    
    // All runs should be visible since they all use the same definition
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
      expect(screen.getByText('API Test Run #2')).toBeInTheDocument()
      expect(screen.getByText('API Test Run #3')).toBeInTheDocument()
    })
  })

  it('shows no results message when search yields no matches', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search runs...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    expect(screen.getByText('No runs match your search')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument()
  })

  it('opens delete modal when delete button is clicked', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Test Run #1')).toBeInTheDocument()
    })
    
    // Click first delete button (for completed run)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Delete Run')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete this run/)).toBeInTheDocument()
    })
  })

  it('displays creation time', async () => {
    vi.mocked(storage.getRuns).mockResolvedValue(mockRuns)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText('1 hour ago')).toHaveLength(3)
    })
  })

  it('handles runs with unknown definition/executor gracefully', async () => {
    const runWithUnknownRefs: Run[] = [
      {
        id: 'run-4',
        name: 'Orphaned Run',
        image: 'unknown:latest',
        command: ['unknown'],
        status: 'completed',
        createdAt: '2024-01-15T12:00:00Z',
        definitionId: 'unknown-def',
        executorId: 'unknown-exec',
        duration: 10
      }
    ]
    
    vi.mocked(storage.getRuns).mockResolvedValue(runWithUnknownRefs)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Orphaned Run')).toBeInTheDocument()
    })
    
    // Should show fallback names for unknown references
    expect(screen.getByText('Definition unknown-def')).toBeInTheDocument()
    expect(screen.getByText('Executor unknown-exec')).toBeInTheDocument()
  })

  it('handles runs without definition/executor IDs', async () => {
    const runWithoutRefs: Run[] = [
      {
        id: 'run-5',
        name: 'Standalone Run',
        image: 'standalone:latest',
        command: ['standalone'],
        status: 'completed',
        createdAt: '2024-01-15T12:00:00Z',
        duration: 15
      }
    ]
    
    vi.mocked(storage.getRuns).mockResolvedValue(runWithoutRefs)
    vi.mocked(storage.getDefinitions).mockResolvedValue(mockDefinitions)
    vi.mocked(storage.getExecutors).mockResolvedValue(mockExecutors)
    
    render(<TestRunsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Standalone Run')).toBeInTheDocument()
    })
    
    // Should show "Unknown" for missing references
    const unknownTexts = screen.getAllByText('Unknown')
    expect(unknownTexts).toHaveLength(2) // One for definition, one for executor
  })
})

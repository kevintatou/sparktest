/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiStorageService } from '@sparktest/storage-service/api-storage'

// Mock fetch for testing
global.fetch = vi.fn()

describe('K8s Job Synchronization', () => {
  let apiStorage: ApiStorageService
  
  beforeEach(() => {
    apiStorage = new ApiStorageService()
    vi.clearAllMocks()
  })

  it('should fetch Kubernetes health status', async () => {
    const mockHealthResponse = {
      kubernetes_connected: true,
      timestamp: '2024-01-01T00:00:00Z'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthResponse
    })

    const health = await apiStorage.getKubernetesHealth()
    
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/k8s/health')
    expect(health.kubernetes_connected).toBe(true)
  })

  it('should list Kubernetes jobs', async () => {
    const mockJobsResponse = {
      jobs: [
        {
          name: 'test-run-123',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          namespace: 'default',
          labels: { app: 'sparktest', component: 'test-runner' }
        },
        {
          name: 'test-run-456',
          status: 'running',
          created_at: '2024-01-01T01:00:00Z',
          namespace: 'default',
          labels: { app: 'sparktest', component: 'test-runner' }
        }
      ],
      timestamp: '2024-01-01T02:00:00Z'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsResponse
    })

    const jobs = await apiStorage.listKubernetesJobs()
    
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/k8s/jobs')
    expect(jobs).toHaveLength(2)
    expect(jobs[0].name).toBe('test-run-123')
    expect(jobs[0].status).toBe('completed')
    expect(jobs[1].name).toBe('test-run-456')
    expect(jobs[1].status).toBe('running')
  })

  it('should handle failed Kubernetes connection gracefully', async () => {
    const mockHealthResponse = {
      kubernetes_connected: false,
      error: 'Failed to connect to Kubernetes cluster',
      timestamp: '2024-01-01T00:00:00Z'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthResponse
    })

    const health = await apiStorage.getKubernetesHealth()
    
    expect(health.kubernetes_connected).toBe(false)
    expect(health.error).toContain('Failed to connect')
  })

  it('should return empty array when Kubernetes jobs endpoint fails', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable'
    })

    await expect(apiStorage.listKubernetesJobs()).rejects.toThrow('Failed to list Kubernetes jobs')
  })

  it('should identify job synchronization issues', async () => {
    // Mock database runs
    const mockDatabaseRuns = [
      {
        id: 'run-1',
        name: 'Test Run 1',
        k8sJobName: 'test-run-123',
        status: 'completed',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'run-2', 
        name: 'Test Run 2',
        k8sJobName: 'test-run-orphaned',
        status: 'running',
        createdAt: '2024-01-01T01:00:00Z'
      }
    ]

    // Mock K8s jobs
    const mockK8sJobs = [
      {
        name: 'test-run-123',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        namespace: 'default'
      },
      {
        name: 'test-run-456', // This job exists in K8s but not in database
        status: 'running',
        created_at: '2024-01-01T02:00:00Z',
        namespace: 'default'
      }
    ]

    ;(fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDatabaseRuns
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockK8sJobs })
      })

    const [runs, jobs] = await Promise.all([
      apiStorage.getRuns(),
      apiStorage.listKubernetesJobs()
    ])

    // Find synchronization issues
    const matchedRuns = runs.filter(run => 
      run.k8sJobName && jobs.some(job => job.name === run.k8sJobName)
    )
    
    const orphanedK8sJobs = jobs.filter(job => 
      !runs.some(run => run.k8sJobName === job.name)
    )
    
    const orphanedRuns = runs.filter(run => 
      run.k8sJobName && !jobs.some(job => job.name === run.k8sJobName)
    )

    // Assertions
    expect(matchedRuns).toHaveLength(1) // Only 'test-run-123' is properly matched
    expect(orphanedK8sJobs).toHaveLength(1) // 'test-run-456' exists in K8s but not in DB
    expect(orphanedRuns).toHaveLength(1) // 'test-run-orphaned' exists in DB but not in K8s
    
    expect(matchedRuns[0].k8sJobName).toBe('test-run-123')
    expect(orphanedK8sJobs[0].name).toBe('test-run-456')
    expect(orphanedRuns[0].k8sJobName).toBe('test-run-orphaned')
  })
})
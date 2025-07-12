import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

describe('ConfirmationModal', () => {
  it('renders with correct title and description', () => {
    const mockOnConfirm = vi.fn()
    
    render(
      <ConfirmationModal
        title="Test Title"
        description="Test Description"
        onConfirm={mockOnConfirm}
      >
        <button>Trigger</button>
      </ConfirmationModal>
    )

    // Click the trigger button to open the modal
    const triggerButton = screen.getByText('Trigger')
    fireEvent.click(triggerButton)

    // Check if modal content is displayed
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn()
    
    render(
      <ConfirmationModal
        title="Test Title"
        description="Test Description"
        onConfirm={mockOnConfirm}
      >
        <button>Trigger</button>
      </ConfirmationModal>
    )

    // Click the trigger button to open the modal
    const triggerButton = screen.getByText('Trigger')
    fireEvent.click(triggerButton)

    // Click the confirm button
    const confirmButton = screen.getByText('Delete')
    fireEvent.click(confirmButton)

    // Check if onConfirm was called
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders with custom action label', () => {
    const mockOnConfirm = vi.fn()
    
    render(
      <ConfirmationModal
        title="Test Title"
        description="Test Description"
        actionLabel="Remove"
        onConfirm={mockOnConfirm}
      >
        <button>Trigger</button>
      </ConfirmationModal>
    )

    // Click the trigger button to open the modal
    const triggerButton = screen.getByText('Trigger')
    fireEvent.click(triggerButton)

    // Check if custom action label is displayed
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('disables trigger when disabled prop is true', () => {
    const mockOnConfirm = vi.fn()
    
    render(
      <ConfirmationModal
        title="Test Title"
        description="Test Description"
        onConfirm={mockOnConfirm}
        disabled={true}
      >
        <button>Trigger</button>
      </ConfirmationModal>
    )

    const triggerButton = screen.getByText('Trigger')
    expect(triggerButton).toBeDisabled()
  })
})
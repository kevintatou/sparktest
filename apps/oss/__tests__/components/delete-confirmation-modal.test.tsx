import { render, screen } from '@testing-library/react'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { vi } from 'vitest'

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    isDeleting: false,
    title: 'Delete Test Item',
    description: 'Are you sure you want to delete this item?',
    itemName: 'Test Item',
    itemType: 'Item'
  }

  it('renders the modal with correct content when open', () => {
    render(<DeleteConfirmationModal {...defaultProps} />)
    
    // Check if title is rendered
    expect(screen.getByRole('heading', { name: 'Delete Test Item' })).toBeInTheDocument()
    
    // Check if description is rendered
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
    
    // Check if item details are shown
    expect(screen.getByText('Item: Test Item')).toBeInTheDocument()
    
    // Check if warning is displayed
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    
    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />)
    
    // Modal should not be visible
    expect(screen.queryByRole('heading', { name: 'Delete Test Item' })).not.toBeInTheDocument()
  })

  it('shows loading state when deleting', () => {
    render(<DeleteConfirmationModal {...defaultProps} isDeleting={true} />)
    
    // Delete button should show loading text
    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument()
    
    // Buttons should be disabled
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled()
  })

  it('renders without item name', () => {
    const propsWithoutItemName = {
      ...defaultProps,
      itemName: undefined
    }
    
    render(<DeleteConfirmationModal {...propsWithoutItemName} />)
    
    // Should not show item details section
    expect(screen.queryByText('Item:')).not.toBeInTheDocument()
    
    // But should still show other content
    expect(screen.getByRole('heading', { name: 'Delete Test Item' })).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
  })
})
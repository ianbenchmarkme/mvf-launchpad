import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditableSection } from '@/components/editable-section';

const defaultProps = {
  title: 'Identity',
  canEdit: true,
  isEditing: false,
  onEditStart: vi.fn(),
  onCancel: vi.fn(),
  onSave: vi.fn(),
  isSaving: false,
  children: <input data-testid="edit-field" />,
  readContent: <p data-testid="read-content">Current value</p>,
};

describe('EditableSection', () => {
  it('renders the title', () => {
    render(<EditableSection {...defaultProps} />);
    expect(screen.getByText('Identity')).toBeInTheDocument();
  });

  it('shows read content by default', () => {
    render(<EditableSection {...defaultProps} />);
    expect(screen.getByTestId('read-content')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-field')).not.toBeInTheDocument();
  });

  it('shows Edit button when canEdit is true', () => {
    render(<EditableSection {...defaultProps} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('hides Edit button when canEdit is false', () => {
    render(<EditableSection {...defaultProps} canEdit={false} />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('calls onEditStart when Edit is clicked', () => {
    const onEditStart = vi.fn();
    render(<EditableSection {...defaultProps} onEditStart={onEditStart} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEditStart).toHaveBeenCalledOnce();
  });

  it('shows edit content when isEditing is true', () => {
    render(<EditableSection {...defaultProps} isEditing={true} />);
    expect(screen.getByTestId('edit-field')).toBeInTheDocument();
    expect(screen.queryByTestId('read-content')).not.toBeInTheDocument();
  });

  it('hides Edit button when isEditing is true', () => {
    render(<EditableSection {...defaultProps} isEditing={true} />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('shows Save and Cancel buttons in edit mode', () => {
    render(<EditableSection {...defaultProps} isEditing={true} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = vi.fn();
    render(<EditableSection {...defaultProps} isEditing={true} onSave={onSave} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<EditableSection {...defaultProps} isEditing={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows Saving... and disables buttons when isSaving is true', () => {
    render(<EditableSection {...defaultProps} isEditing={true} isSaving={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Saving...').closest('button')).toBeDisabled();
  });
});

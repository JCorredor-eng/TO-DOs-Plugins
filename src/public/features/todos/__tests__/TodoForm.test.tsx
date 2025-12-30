import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoForm } from '../ui/TodoForm';
import { Todo } from '../../../../common/todo/todo.types';
describe('TodoForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const defaultProps = {
    onSubmit: mockOnSubmit,
    onClose: mockOnClose,
    loading: false,
  };
  const mockTodo: Todo = {
    id: 'test-id',
    title: 'Test TODO',
    description: 'Test description',
    status: 'planned',
    tags: ['tag1', 'tag2'],
    assignee: 'user1',
    priority: 'high',
    severity: 'medium',
    dueDate: '2025-12-31T23:59:59.000Z',
    complianceFrameworks: ['PCI-DSS', 'ISO-27001'],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    completedAt: null,
  };
  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<TodoForm {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
      expect(screen.getByLabelText(/assignee/i)).toHaveValue('');
    });
    it('should show "Create TODO" button', () => {
      render(<TodoForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /create todo/i })).toBeInTheDocument();
    });
    it('should have default status as "planned"', () => {
      render(<TodoForm {...defaultProps} />);
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
      expect(statusSelect.value).toBe('planned');
    });
    it('should allow filling out all fields', async () => {
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const assigneeInput = screen.getByLabelText(/assignee/i);
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'Task description' } });
      fireEvent.change(assigneeInput, { target: { value: 'john.doe' } });
      expect(titleInput).toHaveValue('New Task');
      expect(descriptionInput).toHaveValue('Task description');
      expect(assigneeInput).toHaveValue('john.doe');
    });
    it('should call onSubmit with create data when form is valid', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'New Task',
          status: 'planned',
        });
      });
    });
    it('should include optional fields in submission when provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
      fireEvent.change(screen.getByLabelText(/assignee/i), { target: { value: 'john' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task',
            description: 'Description',
            assignee: 'john',
            status: 'planned',
          })
        );
      });
    });
  });
  describe('Edit Mode', () => {
    it('should render edit form with existing data', () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      expect(screen.getByText('Edit TODO')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue('Test TODO');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Test description');
      expect(screen.getByLabelText(/assignee/i)).toHaveValue('user1');
    });
    it('should show "Save Changes" button', () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
    it('should populate status field', () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
      expect(statusSelect.value).toBe('planned');
    });
    it('should update form when todo prop changes', () => {
      const { rerender } = render(<TodoForm {...defaultProps} todo={mockTodo} />);
      expect(screen.getByLabelText(/title/i)).toHaveValue('Test TODO');
      const updatedTodo: Todo = {
        ...mockTodo,
        title: 'Updated Title',
      };
      rerender(<TodoForm {...defaultProps} todo={updatedTodo} />);
      expect(screen.getByLabelText(/title/i)).toHaveValue('Updated Title');
    });
    it('should only submit changed fields', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: "" } });
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Updated Title',
        });
      });
    });
    it('should handle status change', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const statusSelect = screen.getByLabelText(/status/i);
      fireEvent.change(statusSelect, { target: { value: 'done' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          status: 'done',
        });
      });
    });
  });
  describe('Validation', () => {
    it('should show error when title is empty', async () => {
      render(<TodoForm {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should show error when title is only whitespace', async () => {
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: '   ' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should show error when title exceeds 256 characters', async () => {
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(257) } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Title must be 256 characters or less')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should show error when description exceeds 4000 characters', async () => {
      render(<TodoForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'a'.repeat(4001) } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Description must be 4000 characters or less')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should accept valid title at max length', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(256) } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
    it('should clear errors when input becomes valid', async () => {
      render(<TodoForm {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
      });
    });
  });
  describe('Tags', () => {
    it('should allow adding tags', async () => {
      render(<TodoForm {...defaultProps} />);
      const tagsLabel = screen.getByText('Tags');
      expect(tagsLabel).toBeInTheDocument();
    });
    it('should show existing tags in edit mode', () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });
    it('should show error when more than 20 tags', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const todoWithManyTags: Todo = {
        ...mockTodo,
        tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
      };
      render(<TodoForm {...defaultProps} todo={todoWithManyTags} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Changed' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Maximum 20 tags allowed')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
  describe('Status Selection', () => {
    it('should display all status options', () => {
      render(<TodoForm {...defaultProps} />);
      const statusSelect = screen.getByLabelText(/status/i);
      expect(statusSelect).toBeInTheDocument();
      expect(screen.getByText('Planned')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    it('should allow changing status', async () => {
      render(<TodoForm {...defaultProps} />);
      const statusSelect = screen.getByLabelText(/status/i);
      fireEvent.change(statusSelect, { target: { value: 'done' } });
      expect((statusSelect as HTMLSelectElement).value).toBe('done');
    });
  });
  describe('Form Interactions', () => {
    it('should call onClose when cancel is clicked', () => {
      render(<TodoForm {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
    it('should disable buttons when loading', () => {
      render(<TodoForm {...defaultProps} loading={true} />);
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
    it('should show loading state on submit button', () => {
      render(<TodoForm {...defaultProps} loading={true} />);
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      expect(submitButton).toBeDisabled();
    });
    it('should handle form submit via Enter key', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.keyDown(titleInput, { key: 'Enter', code: 'Enter', charCode: 13 });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
  describe('Flyout Behavior', () => {
    it('should render as a flyout', () => {
      render(<TodoForm {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    it('should have proper ARIA attributes', () => {
      render(<TodoForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('required');
    });
  });
  describe('Edge Cases', () => {
    it('should handle undefined todo gracefully', () => {
      render(<TodoForm {...defaultProps} todo={undefined} />);
      expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
    });
    it('should handle null todo gracefully', () => {
      render(<TodoForm {...defaultProps} todo={null} />);
      expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
    });
    it('should handle todo with missing optional fields', () => {
      const minimalTodo: Todo = {
        id: 'test',
        title: 'Test',
        status: 'planned',
        tags: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        completedAt: null,
      };
      render(<TodoForm {...defaultProps} todo={minimalTodo} />);
      expect(screen.getByLabelText(/title/i)).toHaveValue('Test');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
      expect(screen.getByLabelText(/assignee/i)).toHaveValue('');
    });
    it('should call onSubmit even when it might fail', async () => {
      const mockOnSubmitWithError = jest.fn().mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} onSubmit={mockOnSubmitWithError} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmitWithError).toHaveBeenCalled();
      });
      expect(mockOnSubmitWithError).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          status: 'planned',
        })
      );
    });
  });
  describe('Priority Field', () => {
    it('should render priority select with default value', async () => {
      render(<TodoForm {...defaultProps} />);
      const prioritySelect = (await screen.findByLabelText(/priority/i)) as HTMLSelectElement;
      expect(prioritySelect).toBeInTheDocument();
      expect(prioritySelect.value).toBe('medium');
    });
    it('should display all priority options', async () => {
      render(<TodoForm {...defaultProps} />);
      expect(await screen.findByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
    it('should populate priority in edit mode', async () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const prioritySelect = (await screen.findByLabelText(/priority/i)) as HTMLSelectElement;
      expect(prioritySelect.value).toBe('high');
    });
    it('should allow changing priority', async () => {
      render(<TodoForm {...defaultProps} />);
      const prioritySelect = await screen.findByLabelText(/priority/i);
      fireEvent.change(prioritySelect, { target: { value: 'critical' } });
      expect((prioritySelect as HTMLSelectElement).value).toBe('critical');
    });
    it('should submit priority in create mode when non-default', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      const priorityInput = await screen.findByLabelText(/priority/i);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(priorityInput, { target: { value: 'critical' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'critical',
          })
        );
      });
    });
    it('should submit priority change in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const priorityInput = await screen.findByLabelText(/priority/i);
      fireEvent.change(priorityInput, { target: { value: 'low' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          priority: 'low',
        });
      });
    });
  });
  describe('Severity Field', () => {
    it('should render severity select with default value', async () => {
      render(<TodoForm {...defaultProps} />);
      const severitySelect = (await screen.findByLabelText(/severity/i)) as HTMLSelectElement;
      expect(severitySelect).toBeInTheDocument();
      expect(severitySelect.value).toBe('low');
    });
    it('should display all severity options', async () => {
      render(<TodoForm {...defaultProps} />);
      expect(await screen.findByText('Info')).toBeInTheDocument();
      expect(screen.getByText(/^Low$/)).toBeInTheDocument();
      expect(screen.getByText(/^Medium$/)).toBeInTheDocument();
      expect(screen.getByText(/^High$/)).toBeInTheDocument();
      expect(screen.getAllByText('Critical')).toHaveLength(2); 
    });
    it('should populate severity in edit mode', async () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const severitySelect = (await screen.findByLabelText(/severity/i)) as HTMLSelectElement;
      expect(severitySelect.value).toBe('medium');
    });
    it('should allow changing severity', async () => {
      render(<TodoForm {...defaultProps} />);
      const severitySelect = await screen.findByLabelText(/severity/i);
      fireEvent.change(severitySelect, { target: { value: 'critical' } });
      expect((severitySelect as HTMLSelectElement).value).toBe('critical');
    });
    it('should submit severity in create mode when non-default', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      const severityInput = await screen.findByLabelText(/severity/i);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(severityInput, { target: { value: 'high' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 'high',
          })
        );
      });
    });
    it('should submit severity change in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const severityInput = await screen.findByLabelText(/severity/i);
      fireEvent.change(severityInput, { target: { value: 'info' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          severity: 'info',
        });
      });
    });
  });
  describe('Due Date Field', () => {
    it('should render due date input', async () => {
      render(<TodoForm {...defaultProps} />);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      expect(dueDateInput).toBeInTheDocument();
      expect(dueDateInput).toHaveAttribute('type', 'date');
    });
    it('should start with empty due date in create mode', async () => {
      render(<TodoForm {...defaultProps} />);
      const dueDateInput = (await screen.findByLabelText(/due date/i)) as HTMLInputElement;
      expect(dueDateInput.value).toBe('');
    });
    it('should populate due date in edit mode', async () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const dueDateInput = (await screen.findByLabelText(/due date/i)) as HTMLInputElement;
      expect(dueDateInput.value).toBe('2025-12-31');
    });
    it('should allow changing due date', async () => {
      render(<TodoForm {...defaultProps} />);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(dueDateInput, { target: { value: '2026-06-15' } });
      expect((dueDateInput as HTMLInputElement).value).toBe('2026-06-15');
    });
    it('should submit due date in create mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(dueDateInput, { target: { value: '2026-01-15' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: expect.stringMatching(/2026-01-15/),
          })
        );
      });
    });
    it('should submit due date change in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(dueDateInput, { target: { value: '2026-01-01' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: expect.stringMatching(/2026-01-01/),
          })
        );
      });
    });
    it('should show error for invalid date format', async () => {
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(titleInput, { target: { value: 'Test' } });
      fireEvent.change(dueDateInput, { target: { value: 'invalid' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Invalid date format')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should clear due date when cleared in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(dueDateInput, { target: { value: '' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: null,
          })
        );
      });
    });
  });
  describe('Compliance Frameworks Field', () => {
    it('should render compliance frameworks combobox', async () => {
      render(<TodoForm {...defaultProps} />);
      const label = await screen.findByText('Compliance Frameworks');
      expect(label).toBeInTheDocument();
    });
    it('should start with empty compliance frameworks in create mode', async () => {
      render(<TodoForm {...defaultProps} />);
      const input = await screen.findByPlaceholderText(/add compliance frameworks/i);
      expect(input).toBeInTheDocument();
    });
    it('should populate compliance frameworks in edit mode', async () => {
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      expect(await screen.findByText('PCI-DSS')).toBeInTheDocument();
      expect(screen.getByText('ISO-27001')).toBeInTheDocument();
    });
    it('should submit compliance frameworks in create mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
    it('should show error when exceeding max compliance frameworks', async () => {
      const todoWithManyFrameworks: Todo = {
        ...mockTodo,
        complianceFrameworks: Array.from({ length: 11 }, (_, i) => `FRAMEWORK-${i}`),
      };
      render(<TodoForm {...defaultProps} todo={todoWithManyFrameworks} />);
      const titleInput = await screen.findByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Changed' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText('Maximum 10 compliance frameworks allowed')
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    it('should show error when framework exceeds max length', async () => {
      const longFramework = 'a'.repeat(101);
      const todoWithLongFramework: Todo = {
        ...mockTodo,
        complianceFrameworks: [longFramework],
      };
      render(<TodoForm {...defaultProps} todo={todoWithLongFramework} />);
      const titleInput = await screen.findByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Changed' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/each compliance framework must be 100 characters or less/i)
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
  describe('Combined Analytics Fields', () => {
    it('should submit all analytics fields in create mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} />);
      const titleInput = await screen.findByLabelText(/title/i);
      const priorityInput = await screen.findByLabelText(/priority/i);
      const severityInput = await screen.findByLabelText(/severity/i);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(titleInput, { target: { value: 'Full Test' } });
      fireEvent.change(priorityInput, { target: { value: 'critical' } });
      fireEvent.change(severityInput, { target: { value: 'high' } });
      fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });
      const submitButton = screen.getByRole('button', { name: /create todo/i });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Full Test',
            priority: 'critical',
            severity: 'high',
            dueDate: expect.stringMatching(/2026-12-31/),
          })
        );
      });
    });
    it('should submit multiple analytics field changes in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<TodoForm {...defaultProps} todo={mockTodo} />);
      const priorityInput = await screen.findByLabelText(/priority/i);
      const severityInput = await screen.findByLabelText(/severity/i);
      const dueDateInput = await screen.findByLabelText(/due date/i);
      fireEvent.change(priorityInput, { target: { value: 'low' } });
      fireEvent.change(severityInput, { target: { value: 'info' } });
      fireEvent.change(dueDateInput, { target: { value: '2027-01-01' } });
      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'low',
            severity: 'info',
            dueDate: expect.stringMatching(/2027-01-01/),
          })
        );
      });
    });
    it('should handle todo with all analytics fields in edit mode', async () => {
      const fullTodo: Todo = {
        ...mockTodo,
        priority: 'critical',
        severity: 'critical',
        dueDate: '2026-01-01T00:00:00.000Z',
        complianceFrameworks: ['PCI-DSS', 'ISO-27001', 'HIPAA'],
      };
      render(<TodoForm {...defaultProps} todo={fullTodo} />);
      const priorityInput = (await screen.findByLabelText(/priority/i)) as HTMLSelectElement;
      const severityInput = (await screen.findByLabelText(/severity/i)) as HTMLSelectElement;
      const dueDateInput = (await screen.findByLabelText(/due date/i)) as HTMLInputElement;
      expect(priorityInput.value).toBe('critical');
      expect(severityInput.value).toBe('critical');
      expect(dueDateInput.value).toBe('2026-01-01');
      expect(await screen.findByText('PCI-DSS')).toBeInTheDocument();
      expect(screen.getByText('ISO-27001')).toBeInTheDocument();
      expect(screen.getByText('HIPAA')).toBeInTheDocument();
    });
  });
});

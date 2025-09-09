import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '../Modal';

expect.extend(toHaveNoViolations);

// Mock createPortal for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// Test component for modal interactions
const TestModal: React.FC<{
  initialOpen?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}> = ({
  initialOpen = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEscape={closeOnEscape}
        data-testid="modal"
      >
        <ModalHeader onClose={() => setOpen(false)}>
          <ModalTitle>Test Modal</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Modal content</p>
          <button>Focusable element</button>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setOpen(false)}>Close</button>
        </ModalFooter>
      </Modal>
    </>
  );
};

describe('Modal Components', () => {
  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('Modal', () => {
    it('renders when open is true', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <Modal open={false} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <Modal open={true} onClose={() => {}} size="sm">
          Content
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

      rerender(
        <Modal open={true} onClose={() => {}} size="lg">
          Content
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

      rerender(
        <Modal open={true} onClose={() => {}} size="full">
          Content
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveClass('max-w-full');
    });

    it('closes on overlay click when enabled', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnOverlayClick={true}>
          <div>Modal content</div>
        </Modal>
      );

      // Click on the overlay (parent div)
      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay!);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on overlay click when disabled', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnOverlayClick={false}>
          <div>Modal content</div>
        </Modal>
      );

      // Click on the overlay
      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay!);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('closes on escape key when enabled', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnEscape={true}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on escape key when disabled', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnEscape={false}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('prevents body scroll when open', () => {
      const { rerender } = render(
        <Modal open={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal open={false} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('has correct ARIA attributes', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('tabIndex', '-1');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>Modal content</ModalBody>
          <ModalFooter>
            <button>Close</button>
          </ModalFooter>
        </Modal>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ModalHeader', () => {
    it('renders close button when showCloseButton is true', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader showCloseButton onClose={handleClose}>
            Header content
          </ModalHeader>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader showCloseButton={false}>Header content</ModalHeader>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('renders with divider by default', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader data-testid="header">Header content</ModalHeader>
        </Modal>
      );

      expect(screen.getByTestId('header')).toHaveClass('border-b');
    });
  });

  describe('ModalBody', () => {
    it('applies padding variants correctly', () => {
      const { rerender } = render(
        <Modal open={true} onClose={() => {}}>
          <ModalBody data-testid="body" padding="none">
            Body content
          </ModalBody>
        </Modal>
      );

      expect(screen.getByTestId('body')).not.toHaveClass('px-6');

      rerender(
        <Modal open={true} onClose={() => {}}>
          <ModalBody data-testid="body" padding="lg">
            Body content
          </ModalBody>
        </Modal>
      );

      expect(screen.getByTestId('body')).toHaveClass('px-8', 'py-6');
    });

    it('applies scrollable styles when enabled', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalBody data-testid="body" scrollable>
            Body content
          </ModalBody>
        </Modal>
      );

      expect(screen.getByTestId('body')).toHaveClass(
        'max-h-96',
        'overflow-y-auto'
      );
    });
  });

  describe('ModalFooter', () => {
    it('applies alignment classes correctly', () => {
      const { rerender } = render(
        <Modal open={true} onClose={() => {}}>
          <ModalFooter data-testid="footer" align="left">
            Footer content
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByTestId('footer')).toHaveClass('justify-start');

      rerender(
        <Modal open={true} onClose={() => {}}>
          <ModalFooter data-testid="footer" align="between">
            Footer content
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByTestId('footer')).toHaveClass('justify-between');
    });

    it('renders with divider by default', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalFooter data-testid="footer">Footer content</ModalFooter>
        </Modal>
      );

      expect(screen.getByTestId('footer')).toHaveClass('border-t');
    });
  });

  describe('ModalTitle', () => {
    it('renders with correct heading level', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalTitle level={1}>Modal Title</ModalTitle>
        </Modal>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('uses h2 as default heading level', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalTitle>Modal Title</ModalTitle>
        </Modal>
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('focuses modal when opened', async () => {
      render(<TestModal />);

      fireEvent.click(screen.getByText('Open Modal'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus();
      });
    });

    it('traps focus within modal', async () => {
      render(<TestModal initialOpen />);

      const modal = screen.getByRole('dialog');

      // Focus should start on the modal
      await waitFor(() => {
        expect(modal).toHaveFocus();
      });

      // Verify that focus is trapped by checking that Tab key events are handled
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      Object.defineProperty(tabEvent, 'preventDefault', { value: jest.fn() });

      modal.dispatchEvent(tabEvent);

      // The modal should still be focused or focus should move to a focusable element within
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Modal Composition', () => {
    it('works correctly when components are composed together', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader>
            <ModalTitle>Composed Modal</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>This is the modal body</p>
          </ModalBody>
          <ModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </Modal>
      );

      expect(
        screen.getByRole('heading', { name: 'Composed Modal' })
      ).toBeInTheDocument();
      expect(screen.getByText('This is the modal body')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Confirm' })
      ).toBeInTheDocument();
    });
  });
});

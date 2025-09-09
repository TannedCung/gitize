import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from '../ScrollArea';

describe('ScrollArea', () => {
  it('renders children correctly', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Test content</div>
      </ScrollArea>
    );

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default scrollbar classes', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass(
      'overflow-auto',
      'scrollbar',
      'scroll-smooth',
      'scroll-touch'
    );
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(
      <ScrollArea variant="brand" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    let scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-brand');

    rerender(
      <ScrollArea variant="thin" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-thin');

    rerender(
      <ScrollArea variant="thick" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-thick');

    rerender(
      <ScrollArea variant="none" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scrollbar-none');
    expect(scrollArea).not.toHaveClass('scrollbar');
  });

  it('applies smooth scrolling when enabled', () => {
    render(
      <ScrollArea smooth={true} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scroll-smooth');
  });

  it('does not apply smooth scrolling when disabled', () => {
    render(
      <ScrollArea smooth={false} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).not.toHaveClass('scroll-smooth');
  });

  it('applies touch optimization when enabled', () => {
    render(
      <ScrollArea touchOptimized={true} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('scroll-touch');
  });

  it('does not apply touch optimization when disabled', () => {
    render(
      <ScrollArea touchOptimized={false} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).not.toHaveClass('scroll-touch');
  });

  it('applies custom className', () => {
    render(
      <ScrollArea className="custom-class" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('custom-class');
  });

  it('applies maxHeight style correctly', () => {
    render(
      <ScrollArea maxHeight={300} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveStyle({ maxHeight: '300px' });
  });

  it('applies maxHeight as string correctly', () => {
    render(
      <ScrollArea maxHeight="50vh" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveStyle({ maxHeight: '50vh' });
  });

  it('applies maxWidth style correctly', () => {
    render(
      <ScrollArea maxWidth={500} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveStyle({ maxWidth: '500px' });
  });

  it('applies maxWidth as string correctly', () => {
    render(
      <ScrollArea maxWidth="80%" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveStyle({ maxWidth: '80%' });
  });

  it('merges custom styles with computed styles', () => {
    render(
      <ScrollArea
        maxHeight={200}
        style={{ backgroundColor: 'rgb(255, 0, 0)', padding: '10px' }}
        data-testid="scroll-area"
      >
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveStyle('max-height: 200px');
    expect(scrollArea).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(scrollArea).toHaveStyle('padding: 10px');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <ScrollArea ref={ref} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    expect(ref.current).toBe(screen.getByTestId('scroll-area'));
  });

  it('passes through additional props', () => {
    render(
      <ScrollArea
        data-testid="scroll-area"
        role="region"
        aria-label="Scrollable content"
      >
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveAttribute('role', 'region');
    expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
  });
});

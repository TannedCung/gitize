// Lazy-loaded components for better code splitting
import { lazy } from 'react';
import { withLazyWrapper } from './LazyWrapper';

// Non-critical components that can be lazy loaded
const LazyModalBase = lazy(() =>
  import('./Modal').then(module => ({ default: module.Modal }))
);

const LazyModalHeaderBase = lazy(() =>
  import('./Modal').then(module => ({ default: module.ModalHeader }))
);

const LazyModalBodyBase = lazy(() =>
  import('./Modal').then(module => ({ default: module.ModalBody }))
);

const LazyModalFooterBase = lazy(() =>
  import('./Modal').then(module => ({ default: module.ModalFooter }))
);

const LazyModalTitleBase = lazy(() =>
  import('./Modal').then(module => ({ default: module.ModalTitle }))
);

const LazyPopoverBase = lazy(() =>
  import('./Popover').then(module => ({ default: module.Popover }))
);

const LazyTooltipBase = lazy(() =>
  import('./Tooltip').then(module => ({ default: module.Tooltip }))
);

const LazyMenuBase = lazy(() =>
  import('./Menu').then(module => ({ default: module.Menu }))
);

const LazyGridBase = lazy(() =>
  import('./Grid').then(module => ({ default: module.Grid }))
);

const LazyListBase = lazy(() =>
  import('./List').then(module => ({ default: module.List }))
);

const LazyScrollAreaBase = lazy(() =>
  import('./ScrollArea').then(module => ({ default: module.ScrollArea }))
);

const LazyFilterPanelBase = lazy(() =>
  import('./FilterPanel').then(module => ({ default: module.FilterPanel }))
);

const LazyNewsletterSignupBase = lazy(() =>
  import('./NewsletterSignup').then(module => ({
    default: module.NewsletterSignup,
  }))
);

// Wrap lazy components with Suspense wrapper
export const LazyModal = withLazyWrapper(LazyModalBase);
export const LazyModalHeader = withLazyWrapper(LazyModalHeaderBase);
export const LazyModalBody = withLazyWrapper(LazyModalBodyBase);
export const LazyModalFooter = withLazyWrapper(LazyModalFooterBase);
export const LazyModalTitle = withLazyWrapper(LazyModalTitleBase);
export const LazyPopover = withLazyWrapper(LazyPopoverBase);
export const LazyTooltip = withLazyWrapper(LazyTooltipBase);
export const LazyMenu = withLazyWrapper(LazyMenuBase);
export const LazyGrid = withLazyWrapper(LazyGridBase);
export const LazyList = withLazyWrapper(LazyListBase);
export const LazyScrollArea = withLazyWrapper(LazyScrollAreaBase);
export const LazyFilterPanel = withLazyWrapper(LazyFilterPanelBase);
export const LazyNewsletterSignup = withLazyWrapper(LazyNewsletterSignupBase);

// Direct exports for immediate use (without wrapper)
export const Modal = LazyModalBase;
export const ModalHeader = LazyModalHeaderBase;
export const ModalBody = LazyModalBodyBase;
export const ModalFooter = LazyModalFooterBase;
export const ModalTitle = LazyModalTitleBase;
export const Popover = LazyPopoverBase;
export const Tooltip = LazyTooltipBase;
export const Menu = LazyMenuBase;
export const Grid = LazyGridBase;
export const List = LazyListBase;
export const ScrollArea = LazyScrollAreaBase;
export const FilterPanel = LazyFilterPanelBase;
export const NewsletterSignup = LazyNewsletterSignupBase;

// Export wrapper utilities
export { LazyWrapper, withLazyWrapper } from './LazyWrapper';

// Export types for lazy components
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalTitleProps,
} from './Modal';
export type { PopoverProps } from './Popover';
export type { TooltipProps } from './Tooltip';
export type { MenuProps } from './Menu';
export type { GridProps } from './Grid';
export type { ListProps } from './List';
export type { ScrollAreaProps } from './ScrollArea';
export type { FilterOptions } from './FilterPanel';

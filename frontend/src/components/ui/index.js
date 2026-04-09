/**
 * UI Component Library — Barrel Export
 *
 * Usage:
 *   import { Button, Input, Modal, Badge, Card, Skeleton, EmptyState } from '../components/ui';
 */

export { default as Button } from "./Button";
export { default as Input, Textarea } from "./Input";
export { default as Modal } from "./Modal";
export { default as Badge, DifficultyBadge } from "./Badge";
export { default as Card } from "./Card";
export { default as Skeleton, SkeletonCard } from "./Skeleton";
export { default as EmptyState } from "./EmptyState";

// Re-export existing Company UI components
export {
  PageHeader,
  HeaderButton,
  StatCard,
  MiniStat,
  SectionLabel,
  ModalShell,
  FilterPills,
  EmptyState as CompanyEmptyState,
  QuickAction,
  T,
  inputCls,
  labelCls,
  btnPrimary,
  btnSecondary,
  btnGhost,
} from "./CompanyUI";

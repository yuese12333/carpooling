import { StyleSheet } from 'react-native';

export const COLORS = Object.freeze({
  background: '#f9fafb',
  card: '#ffffff',
  primary: '#10B981',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  success: '#16a34a',
  danger: '#ef4444',
  warning: '#f59e0b',
});

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  filters: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  applyBtnDisabled: {
    opacity: 0.6,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  cardLine: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  badge: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  badgeItem: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  badgeItemText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
  },
  badgeItemSuccess: {
    borderColor: COLORS.success,
  },
  badgeItemDanger: {
    borderColor: COLORS.danger,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  actionBtnPrimary: {
    borderColor: COLORS.primary,
  },
  actionBtnDanger: {
    borderColor: COLORS.danger,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },
  actionBtnTextPrimary: {
    color: COLORS.primary,
  },
  actionBtnTextDanger: {
    color: COLORS.danger,
  },
});


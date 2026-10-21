import { StyleSheet } from 'react-native'
import { colors } from './theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: colors.ink,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.accent,
    fontWeight: '700',
  },
  buttonDanger: {
    backgroundColor: '#f8e8e8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  buttonDangerText: {
    color: colors.danger,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  chipWarn: {
    backgroundColor: '#f8efd9',
    color: colors.warn,
  },
  chipOk: {
    backgroundColor: colors.accentSoft,
    color: colors.accent,
  },
})

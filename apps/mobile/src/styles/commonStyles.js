import { StyleSheet } from 'react-native'; // <--- OBLIGATOIRE ICI
import { COLORS, SIZES } from '../constants/theme';

export const COMMON_STYLE_VALUES = {
  flex1: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cardSurface: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSecondary: {
    color: COLORS.secondary,
  },
  textMuted: {
    color: COLORS.placeholder,
  },
  roundedLg: {
    borderRadius: 20,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    color: COLORS.secondary,
    fontSize: 16,
  }
});
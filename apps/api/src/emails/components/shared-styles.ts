import type { CSSProperties } from 'react';
import { colors, font } from './email-tokens';

export const sharedBody: CSSProperties = {
  backgroundColor: colors.bgPage,
  fontFamily: font.base,
  padding: '48px 16px',
};

export const sharedContainer = (maxWidth: string): CSSProperties => ({
  maxWidth,
  margin: '0 auto',
  borderRadius: '30px',
  overflow: 'hidden',
  boxShadow: '0 6px 20px rgba(0,0,0,0.09)',
});

export const sharedBodySection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '36px 44px 40px',
};

export const sharedGreeting: CSSProperties = {
  fontSize: '15px',
  fontWeight: 500,
  color: colors.textPrimary,
  margin: '0 0 10px',
};

export const sharedPara: CSSProperties = {
  fontSize: '14.5px',
  color: colors.textBody,
  lineHeight: '1.75',
  margin: '0 0 10px',
};

export const sharedDivider: CSSProperties = {
  borderColor: colors.border,
  margin: '24px 0',
};

export const sharedFootnote: CSSProperties = {
  fontSize: '12.5px',
  color: colors.textMuted,
  lineHeight: '1.65',
  margin: '0',
};

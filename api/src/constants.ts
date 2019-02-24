import { ColorScheme } from './resources';

export const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

/**
 * The number of playlist entries loaded on each page. The frontend has knowledge of this so it can display a
 * "no more songs" notice when the number of songs retrieved is < the limit.
 */
export const ENTRY_PAGE_LIMIT = 20;

export const colorSchemes: ColorScheme[] = [
  {
    backgroundColor: '#8E4C9E',
    textColor: '#FFFFFF',
    cardBackgroundColor: '#2D1832',
  },
];

export const defaultColorScheme = colorSchemes[0];

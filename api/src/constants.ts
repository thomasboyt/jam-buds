import { ColorScheme } from './resources';

export const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

/**
 * The number of playlist entries loaded on each page. The frontend has knowledge of this so it can display a
 * "no more songs" notice when the number of songs retrieved is < the limit.
 */
export const ENTRY_PAGE_LIMIT = 20;

export const colorSchemes: ColorScheme[] = [
  {
    backgroundColor: '#BDF271',
    textColor: 'black',
    linkColor: '#01A2A6',
  },
  {
    backgroundColor: 'black',
    textColor: 'white',
    linkColor: 'white',
  },
  {
    backgroundColor: 'hotpink',
    textColor: 'black',
    linkColor: 'yellow',
  },
  {
    backgroundColor: 'skyblue',
    textColor: 'black',
    linkColor: 'black',
  },
  {
    backgroundColor: '#742365',
    textColor: '#FEB89F',
    linkColor: '#FEB89F',
  },
  {
    backgroundColor: '#2D2D29',
    textColor: '#92C7A3',
    linkColor: '#92C7A3',
  },
  {
    backgroundColor: '#000000',
    textColor: '#4DBCE9',
    linkColor: '#FFFFFF',
  },
];

export const defaultColorScheme = colorSchemes[0];

import {ColorScheme} from './resources';

/**
 * The number of playlist entries loaded on each page. The frontend has knowledge of this so it can display a
 * "no more songs" notice when the number of songs retrieved is < the limit.
 */
export const ENTRY_PAGE_LIMIT = 20;

export const colorSchemes: ColorScheme[] = [{
  backgroundColor: '#BDF271',
  textColor: 'black',
  linkColor: '#01A2A6',
  entryBackgroundColor: 'rgb(255, 255, 166)',
  entryTextColor: 'black',
  entryLinkColor: 'darkblue',
}, {
  backgroundColor: 'black',
  textColor: 'white',
  linkColor: 'white',
  entryBackgroundColor: 'white',
  entryTextColor: 'black',
  entryLinkColor: 'black',
}, {
  backgroundColor: 'hotpink',
  textColor: 'black',
  linkColor: 'yellow',
  entryBackgroundColor: 'yellow',
  entryTextColor: 'black',
  entryLinkColor: 'black',
}, {
  backgroundColor: 'skyblue',
  textColor: 'black',
  linkColor: 'black',
  entryBackgroundColor: 'beige',
  entryTextColor: 'black',
  entryLinkColor: 'black',
}];

export const defaultColorScheme = colorSchemes[0];
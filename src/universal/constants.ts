import { ColorScheme } from './resources';

export const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

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

}, {
  "backgroundColor": "#742365",
  "textColor": "#FEB89F",
  "linkColor": "#FEB89F",
  "entryBackgroundColor": "#FDCFBF",
  "entryTextColor": "#E23D75",
  "entryLinkColor": "#E23D75"

}, {
  "backgroundColor":"#2D2D29",
  "textColor":"#92C7A3",
  "linkColor":"#92C7A3",
  "entryBackgroundColor":"#DFECE6",
  "entryTextColor":"#215A6D",
  "entryLinkColor":"#215A6D"

}, {
  "backgroundColor":"#000000",
  "textColor":"#4DBCE9",
  "linkColor":"#FFFFFF",
  "entryBackgroundColor":"#26ADE4",
  "entryTextColor":"#000000",
  "entryLinkColor":"#000000"
}];

export const defaultColorScheme = colorSchemes[0];
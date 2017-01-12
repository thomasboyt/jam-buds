import {PlaybackSource} from './resources';

const BANDCAMP_URL = /https:\/\/(.*)\.bandcamp\.com\/track\/(.*)/;
const YOUTUBE_URL = /https:\/\/www\.youtube\.com\/watch\?v=(.*)/;

interface Source {
  value: PlaybackSource;
  name: string;
  regex: RegExp;
}

const sources: Source[] = [{
  value: 'youtube',
  name: 'Youtube',
  regex: YOUTUBE_URL,
}, {
  value: 'bandcamp',
  name: 'Bandcamp',
  regex: BANDCAMP_URL,
}];

export function getPlaybackSourceName(sourceId: PlaybackSource): string {
  return sources.find((source) => source.value === sourceId)!.name;
}

export function getPlaybackSourceForUrl(url: string): PlaybackSource | null {
  for (let source of sources) {
    if (source.regex.test(url)) {
      return source.value;
    }
  }

  return null;
}
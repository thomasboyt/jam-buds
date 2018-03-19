/**
 * TODO:
 * THIS IS COPIED FROM /api/src/playbackSources.ts WHICH IS VERY BAD
 * I think I want to serialize some of this and send it from the server? Maybe? There's a buncha
 * hardcoded stuff around sources anyways so it's not a huge deal but the regexes and stuff would
 * be good to make consistent.
 */
const BANDCAMP_URL = /https:\/\/(.*)\.bandcamp\.com\/track\/(.*)/;
const YOUTUBE_URL = /https:\/\/www\.youtube\.com\/watch\?v=(.*)/;
const SOUNDCLOUD_URL = /https:\/\/soundcloud\.com\/(.*)/;

const sources = [
  {
    value: 'youtube',
    name: 'Youtube',
    regex: YOUTUBE_URL,
  },
  {
    value: 'bandcamp',
    name: 'Bandcamp',
    regex: BANDCAMP_URL,
  },
  {
    value: 'soundcloud',
    name: 'SoundCloud',
    regex: SOUNDCLOUD_URL,
  },
];

export function getPlaybackSourceName(sourceId) {
  return sources.find((source) => source.value === sourceId).name;
}

export function getPlaybackSourceForUrl(url) {
  for (let source of sources) {
    if (source.regex.test(url)) {
      return source.value;
    }
  }

  return null;
}

import axios from 'axios';
import cheerio from 'cheerio';
import microdata from 'microdata-node';

interface BandcampTrack {
  trackId: string;
  embeddable: boolean;
  spotifyQuery: string;
  title: string;
  artist: string;
}

interface TrackMicrodata {
  title: string;
  artist: string;
  album: string;
}

function getTrackFromMicrodata(body: any): TrackMicrodata {
  const data = microdata.toJson(body);
  const recording = data.items.find(
    (item: any) => item.type[0] === 'http://schema.org/MusicRecording'
  ).properties;

  const title = recording.name[0].trim();
  const artist = recording.byArtist[0].trim();
  const album = recording.inAlbum[0].properties.name[0].trim();

  return {
    title,
    artist,
    album,
  };
}

export async function getBandcampInformation(
  url: string
): Promise<BandcampTrack> {
  const resp = await axios.get(url);

  const body = resp.data;

  const $ = cheerio.load(body);

  // Get whether the track is embeddable
  const pagedata = JSON.parse($('#pagedata').attr('data-blob'));
  const embeddable = pagedata.embed_info.public_embeddable;

  // Get the ID of the track
  // This is one of like, 8 or 9 equally shitty, equally brittle ways to do this
  const embedUrl = $('meta[property="og:video"]').attr('content');
  const trackId = embedUrl.match(/track=(\d+)/)![1];

  const { title, album, artist } = getTrackFromMicrodata(body);
  const spotifyQuery = `artist:${artist} track:${title} album:${album}`;

  return {
    trackId,
    embeddable,
    spotifyQuery,
    title,
    artist,
  };
}

export async function getBandcampStreamingUrl(
  trackId: string
): Promise<string> {
  // this is a public key that fell off the back of a truck so it's cool that it's hardcoded, don't worry about it~
  const resp = await axios.get(
    `http://api.bandcamp.com/api/track/1/info?key=anamannthrotiuppburdreinbreidr&track_id=${trackId}
  `
  );

  return resp.data.streaming_url;
}

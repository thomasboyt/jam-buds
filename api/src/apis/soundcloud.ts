import axios from 'axios';
import qs from 'querystring';

interface SoundcloudTrack {
  trackId: string;
  streamable: boolean;
  title: string;
}

// yes it's fine this is hard-coded. no don't worry about where i got this from.
const key = '3ae6bc27002808463649550a768cca8f';

export async function getDetailsFromUrl(url: string): Promise<SoundcloudTrack> {
  const apiUrl = `https://api.soundcloud.com/resolve?url=${qs.escape(
    url
  )}&consumer_key=${key}`;

  const resp = await axios.get(apiUrl);

  if (resp.status !== 200) {
    // TODO: handle this well I guess
    console.error(resp);
    throw new Error(`bad response from soundcloud`);
  }

  return {
    title: resp.data.title,
    trackId: `${resp.data.id}`,
    streamable: resp.data.streamable,
  };
}

export function getSoundcloudStreamingUrl(trackId: string): string {
  return `https://api.soundcloud.com/tracks/${trackId}/stream?&consumer_key=${key}`;
}

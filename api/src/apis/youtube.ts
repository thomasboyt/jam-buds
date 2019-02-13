import axios from 'axios';
import qs from 'query-string';

const YOUTUBE_URL = /https:\/\/www\.youtube\.com\/watch\?v=(.*)/;

export async function getYoutubeDetails(url: string) {
  const id = url.match(YOUTUBE_URL)![1];

  const params = qs.stringify({
    part: 'snippet,status',
    id,
    key: process.env.GOOGLE_API_KEY,
  });

  const resp = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );

  const video = resp.data.items[0];
  const embeddable = video.status.embeddable;
  const title = video.snippet.title;

  return { title, embeddable };
}

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Given a youtube track URL, return the title of the video
 */
export async function getYoutubeTitle(url: string): Promise<string> {
  const resp = await axios.get(url);
  const $ = cheerio.load(resp.data);
  const title = $('meta[name="title"]').attr('content');
  return title;
}
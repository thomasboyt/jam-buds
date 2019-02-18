export default function searchUrl(song) {
  const query = encodeURIComponent(song.artists[0] + ' ' + song.title);
  return `https://www.youtube.com/results?search_query=${query}`;
}

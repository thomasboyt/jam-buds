interface Item {
  title: string;
  artists: string[];
}

export default function searchUrl(item: Item) {
  const query = encodeURIComponent(item.artists[0] + ' ' + item.title);
  return `https://www.youtube.com/results?search_query=${query}`;
}

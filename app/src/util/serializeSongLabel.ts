import getArtistsList from './getArtistsList';

interface Item {
  title: string;
  artists: string[];
}

export default function serializeSongLabel(item: Item) {
  return `${getArtistsList(item.title, item.artists)} - ${item.title}`;
}

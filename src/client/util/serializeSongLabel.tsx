import {SearchResult} from '../../universal/resources';

export default function serializeSongLabel(song: SearchResult): string {
  return `${song.artists.join(',')} - ${song.name}`;
}

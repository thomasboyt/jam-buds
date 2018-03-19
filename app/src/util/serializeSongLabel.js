export default function serializeSongLabel(song) {
  return `${song.artists.join(',')} - ${song.name}`;
}

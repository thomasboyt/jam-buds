export function getSpotifySongUrl(id: string): string {
  return `https://open.spotify.com/track/${id}`;
}

export function getSpotifyAlbumUrl(id: string): string {
  return `https://open.spotify.com/album/${id}`;
}

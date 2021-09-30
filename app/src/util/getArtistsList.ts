export default function getArtistsList(title: string, artists: string[]) {
  // filter out artists mentioned in the song title, except for the first artist
  // so "Disclosure, Kelis - Watch Your Step (Disclosure VIP Remix)" still shows "Disclosure, Kelis"
  // but "Disclosure, Kelis - Watch Your Step (ft. Kelis)" just says "Disclosure"
  const artistsToShow = artists.filter(
    (artist, idx) => idx === 0 || !title.includes(artist)
  );
  return artistsToShow.join(', ');
}

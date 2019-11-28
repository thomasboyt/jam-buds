const arts = [
  require('../../assets/mixtape_icons/cd-1.jpg').default,
  require('../../assets/mixtape_icons/cd-2.jpg').default,
  require('../../assets/mixtape_icons/cd-3.jpg').default,
];

export default function getMixtapeArt(id) {
  const artIdx = id % 3;
  return arts[artIdx];
}

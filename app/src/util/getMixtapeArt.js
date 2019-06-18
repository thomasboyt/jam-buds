const arts = [
  require('../../assets/mixtape_icons/cd-1.jpg'),
  require('../../assets/mixtape_icons/cd-2.jpg'),
  require('../../assets/mixtape_icons/cd-3.jpg'),
];

export default function getMixtapeArt(id) {
  const artIdx = id % 3;
  return arts[artIdx];
}

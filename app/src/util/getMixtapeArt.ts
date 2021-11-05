import one from '~/assets/mixtape_icons/cd-1.jpg';
import two from '~/assets/mixtape_icons/cd-2.jpg';
import three from '~/assets/mixtape_icons/cd-3.jpg';
const arts = [one, two, three];

export default function getMixtapeArt(id: number): string {
  const artIdx = id % 3;
  return arts[artIdx];
}

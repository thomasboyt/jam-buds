// https://webgradients.com/
export const gradients = {
  'jam buds': '#ed72df, #89fffd',
  // 120. seashore
  aqua: '#209cff 0%, #68e0cf 100%',
  // 36. zeus miracle
  clefairy: '#cd9cf2 0%, #f6f3ff 100%',
  // 94. cloudy apple
  cloudy: '#f3e7e9 0%, #e3eeff 100%',
  // 34. Lemon Gate
  lemonade: '#96fbc4 0%, #f9f586 100%',
  // 2. night fade
  night: '#a18cd1 0%, #fbc2eb 100%',
  // 4. juicy peach
  peach: '#ffecd2 0%, #fcb69f 100%',
  // 23. rare wind
  pearl: '#a8edea 0%, #fed6e3 100%',
  // 158 Angel Care
  sunset: '#FFE29F 0%, #FFA99F 48%, #FF719A 100%',
  // 124. Magic Lake
  watermelon: '#ffafbd 0%, #c9ffbf 100%',
};

export const defaultColorScheme = {
  backgroundGradientName: 'jam buds',
  textColor: 'black',
};

export default function getGradient(name) {
  if (!gradients[name]) {
    console.log(
      `warning: didn't find gradient named ${name}, falling back to default`
    );
  }

  const gradient = gradients[name] || gradients['jam buds'];

  return `linear-gradient(to top right, ${gradient})`;
}

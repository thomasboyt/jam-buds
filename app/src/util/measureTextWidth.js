let canvas;

export default function measureTextWidth(
  text,
  { fontWeight = 400, fontStyle = 'normal', fontSize, fontFamily }
) {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontWeight} ${fontStyle} ${fontSize} ${fontFamily}`;
  return ctx.measureText(text).width;
}

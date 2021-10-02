let canvas: HTMLCanvasElement;

interface Params {
  fontWeight: number;
  fontStyle: string;
  fontSize: string;
  fontFamily: string;
}

export default function measureTextWidth(
  text: string,
  { fontWeight = 400, fontStyle = 'normal', fontSize, fontFamily }: Params
) {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontWeight} ${fontStyle} ${fontSize} ${fontFamily}`;
  return ctx.measureText(text).width;
}

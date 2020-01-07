import sprite from 'svg-sprite-loader/runtime/sprite.build';

export default (context) => {
  if (process.server) {
    context.res.__SVG_SPRITE__ = sprite.stringify();
  }
};

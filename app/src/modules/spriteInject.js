export default function () {
  this.nuxt.hook('render:route', (url, result, context) => {
    if (context.res) {
      result.html = result.html.replace(
        '<!-- svg-sprite-outlet -->',
        context.res.__SVG_SPRITE__ || ''
      );
    }
  });
}

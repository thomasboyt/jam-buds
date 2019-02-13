const path = require('path');
const fs = require('fs');
const Mustache = require('mustache');

const templatePaths = [
  '404.html',
  '500.html',
  '500-dev.html',
  'index.html',
  'webpack-error.html',
  'production-scripts.html',
];

const templates = {};

templatePaths
  .map((templatePath) => path.join(__dirname, 'templates', templatePath))
  .map((templatePath) => fs.readFileSync(templatePath, { encoding: 'utf8' }))
  .forEach((template, idx) => {
    const name = templatePaths[idx].replace(/.html$/, '');
    templates[name] = template;
  });

module.exports = {
  renderTemplate(name, context) {
    return Mustache.render(templates[name], {
      ...context,
      staticUrl: process.env.STATIC_URL,
    });
  },
  templates,
};

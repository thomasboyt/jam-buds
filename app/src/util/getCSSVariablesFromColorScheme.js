import tinycolor from 'tinycolor2';

function getHoverColor(color) {
  const isDark = tinycolor(color).isDark();
  if (isDark) {
    return tinycolor(color)
      .lighten()
      .toHexString();
  } else {
    return tinycolor(color)
      .darken()
      .toHexString();
  }
}

export default function getCSSVariablesFromColorScheme(colorScheme) {
  return {
    '--theme-body-background-color': colorScheme.backgroundColor,
    '--theme-card-background-color': colorScheme.cardBackgroundColor,
    '--theme-card-background-color-hover': getHoverColor(
      colorScheme.cardBackgroundColor
    ),
    '--theme-border-color': colorScheme.textColor,
    '--theme-text-color': colorScheme.textColor,
    '--theme-link-color': colorScheme.textColor,
  };
}

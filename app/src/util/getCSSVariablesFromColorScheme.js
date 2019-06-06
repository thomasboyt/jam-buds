import getGradient from './gradients';

export default function getCSSVariablesFromColorScheme(colorScheme) {
  return {
    '--theme-body-background': getGradient(colorScheme.backgroundGradientName),
    '--theme-text-color': colorScheme.textColor,
  };
}

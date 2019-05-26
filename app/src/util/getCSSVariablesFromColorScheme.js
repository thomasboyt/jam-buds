import gradients from './gradients';

export default function getCSSVariablesFromColorScheme(colorScheme) {
  return {
    '--theme-body-background': gradients[colorScheme.backgroundGradientName],
    '--theme-text-color': colorScheme.textColor,
  };
}

import { ApiSchema } from '~/api/_helpers';
import getGradient from './gradients';

export default function getCSSVariablesFromColorScheme(
  colorScheme: ApiSchema<'ColorScheme'>
): Record<string, string> {
  return {
    '--theme-body-background': getGradient(colorScheme.backgroundGradientName),
    '--theme-text-color': colorScheme.textColor,
  };
}

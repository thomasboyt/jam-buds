import apiRequest from '../util/apiRequest';
import {ColorScheme} from '../../universal/resources';

export default async function changeColorScheme(colorScheme: ColorScheme): Promise<void> {
  await apiRequest({
    url: '/settings/color-scheme',
    method: 'POST',
    data: colorScheme,
  });
}
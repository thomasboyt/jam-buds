import { AxiosResponse } from 'axios';
import { ExternalApiCallError } from './errors';

/**
 * Wraps an Axios request to wrap any Axios errors in ExternalApiCallError,
 * which has an easier-to-parse error message.
 */
export default function externalCallWrapper(
  xhr: Promise<AxiosResponse<any>>
): Promise<AxiosResponse<any>> {
  return xhr.catch((err) => {
    if (err.isAxiosError) {
      // axios errors get re-wrapped with nicer messages~
      throw new ExternalApiCallError(err);
    } else {
      throw err;
    }
  });
}

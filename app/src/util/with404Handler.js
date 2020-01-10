export default async function(errorHandler, promise) {
  try {
    return await promise;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      errorHandler({ statusCode: 404, message: 'Resource not found' });
    } else {
      throw err;
    }
  }
}

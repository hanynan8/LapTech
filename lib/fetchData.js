// lib/fetchData.js
// Thin wrapper around the native fetch API that adds a couple of retries
// with a short backoff for transient network errors. It intentionally
// returns the raw Response object (not parsed JSON) so callers can keep
// doing `response.ok` / `response.json()` exactly like they would with fetch.

export async function fetchData(url, options = {}, retries = 2) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Don't retry if the request was intentionally aborted (e.g. via
    // AbortController timeout) or if we're out of retries.
    if (retries > 0 && error?.name !== 'AbortError') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return fetchData(url, options, retries - 1);
    }
    throw error;
  }
}

export default fetchData;
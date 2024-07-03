// Origin:
// https://github.com/citizenfx/fivem/blob/master/ext/cfx-ui/src/cfx/utils/fetcher.ts

const originalFetch = fetch;

const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Sec-Gpc': '1',
  'Accept-Language': 'en-US,en;q=0.6',
  'Origin': 'https://servers.fivem.net',
  'Sec-Fetch-Site': 'same-site',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  'Referer': 'https://servers.fivem.net/',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Cache-Control': 'no-cache, no-store',
  'Host': 'servers-frontend.fivem.net'
};

async function json(...args) {
  const response = await fetchWithHeaders(...args);

  try {
    return await response.json();
  } catch (e) {
    throw new JsonParseError(
      response.bodyUsed
        ? 'BODY UNAVAILABLE'
        : await response.text(),
      e,
    );
  }
}

async function text(...args) {
  return (await fetchWithHeaders(...args)).text();
}

async function arrayBuffer(...args) {
  return (await fetchWithHeaders(...args)).arrayBuffer();
}

async function typedArray(ctor, ...args) {
  const ab = await arrayBuffer(...args);

  return new ctor(ab);
}

async function fetchWithHeaders(resource, config = {}, retries = 3) {
  const headers = config.headers ? { ...defaultHeaders, ...config.headers } : defaultHeaders;
  const fetchConfig = { ...config, headers, timeout: 10000 }; // 10 seconds timeout

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await originalFetch(resource, fetchConfig);
      if (!response.ok) {
        throw new HttpError(response);
      }
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(res => setTimeout(res, attempt * 1000)); // Exponential backoff
    }
  }
}

class HttpError extends Error {
  constructor(response) {
    super(`Request to ${response.url} failed with status code ${response.status}`);
    
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
  }

  static is(error) {
    return error instanceof HttpError;
  }

  async readJsonBody() {
    if (this.response.bodyUsed) {
      return null;
    }

    try {
      return await this.response.json();
    } catch (e) {
      return null;
    }
  }
}

class JsonParseError extends Error {
  constructor(originalString, error) {
    super(`Invalid json "${originalString}", ${error.message}`);
    
    this.originalString = originalString;

    // Preserve stack
    this.stack = error.stack;
  }

  static is(error) {
    return error instanceof JsonParseError;
  }
}

module.exports = {
  fetcher: {
    json,
    text,
    arrayBuffer,
    typedArray,
    fetch: fetchWithHeaders,
    HttpError,
    JsonParseError
  }
};

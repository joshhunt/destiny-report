import queryString from "query-string";

const REAUTH_TIMEOUT = 5 * 1000;
const CLIENT_ID = process.env.REACT_APP_BUNGIE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_BUNGIE_API_KEY;

const log = (...args: any[]) => console.log("[AUTH]", ...args);
const logiFrame = (...args: any[]) => console.log("[AUTH IFRAME]", ...args);

interface AuthData {
  access_token: string;
  expiresDate: Date | string;
  expires_in: number;
}

const AUTH_LS = "auth";
function getAuth(): AuthData | undefined {
  const value = window.localStorage.getItem(AUTH_LS);
  return value ? JSON.parse(value) : undefined;
}

function setAuth(value: AuthData) {
  window.localStorage.setItem(AUTH_LS, JSON.stringify(value));
}

const isAuthRefreshiFrame =
  window.self !== window.top && window.parent.__HIDDEN_IFRAME_REFRESH_AUTH;

if (isAuthRefreshiFrame && window.parent.__recieveNewCodeFromIframe) {
  logiFrame("In hidden auth iframe, checking location.search");
  const queryParams = queryString.parse(window.location.search);

  if (queryParams.code) {
    logiFrame("Authorisation code present in URL in iframe", queryParams.code);
    logiFrame("Passing to __recieveNewCodeFromIframe");
    window.parent.__recieveNewCodeFromIframe(queryParams.code);
  }
}

export function getTokenRequestUrl() {
  return `https://www.bungie.net/en/OAuth/Authorize?client_id=${CLIENT_ID}&response_type=code`;
}

const getJSON = (url: RequestInfo, options: RequestInit) => {
  return fetch(url, options).then(r => r.json());
};

export function requestNewAccessToken(authCode: string) {
  return getJSON("https://www.bungie.net/Platform/App/OAuth/Token/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-api-key": API_KEY || ""
    },
    body: `client_id=${CLIENT_ID}&grant_type=authorization_code&code=${authCode}`
  });
}

let getEnsuredAccessTokenPromise: null | Promise<string>; // I think?
export function getEnsuredAccessToken() {
  if (getEnsuredAccessTokenPromise) {
    return getEnsuredAccessTokenPromise;
  }

  getEnsuredAccessTokenPromise = _getEnsuredAccessToken();

  getEnsuredAccessTokenPromise.then(() => {
    getEnsuredAccessTokenPromise = null;
  });

  return getEnsuredAccessTokenPromise;
}

let attempts = 0;
export function _getEnsuredAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const prevAccessToken = getAccessToken();

    if (prevAccessToken) {
      return resolve(prevAccessToken);
    }

    log("Previous access token is stale");

    attempts += 1;

    if (attempts > 2) {
      reject(new Error("Too many attempts to authenticate"));
      return;
    }

    log("Creating hidden iframe");
    window.__HIDDEN_IFRAME_REFRESH_AUTH = true;
    const iframe = document.createElement("iframe");
    iframe.src = getTokenRequestUrl();
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.border = "none";
    iframe.style.position = "fixed";
    iframe.style.top = "-100px";
    iframe.style.left = "-100px";
    document.body.appendChild(iframe);

    window.__recieveNewCodeFromIframe = newCode => {
      document.body.removeChild(iframe);
      log("Got new code from iFrame", newCode);
      log("Requesting new access token using above new code");

      // TODO: error handling
      requestNewAccessToken(newCode)
        .then(handleNewAuthData)
        .then(authData => {
          resolve(authData.access_token);
        });
    };
  });
}

export function getAccessToken() {
  const authData = getAuth();

  if (authData && new Date(authData.expiresDate).getTime() > Date.now()) {
    log("We already have valid stuff in LS");
    return authData.access_token;
  }

  return null;
}

function handleNewAuthData(authData: AuthData) {
  log("Handling new auth data", authData);

  const expiry = new Date();
  expiry.setSeconds(expiry.getSeconds() + authData.expires_in);
  const betterAuthData = {
    ...authData,
    expiresDate: expiry
  };

  log("Expires on", expiry);
  setAuth(betterAuthData);

  return authData;
}

interface AuthResult {
  isAuthenticated: boolean;
  isFinal: boolean;
}

const destinyAuth = (cb: (err: Error | null, result: AuthResult) => void) => {
  const queryParams = queryString.parse(window.location.search);
  log("Starting auth", queryParams);

  const code = Array.isArray(queryParams.code)
    ? queryParams.code[0]
    : queryParams.code;

  // If the user has just returned from auth grant, immediately get and return the access token
  if (code) {
    window.history.replaceState({}, "foo", "/");
    log("Authorisation code present in URL, requesting new acceess code", code);

    requestNewAccessToken(code)
      .then(handleNewAuthData)
      .then(authData => {
        log("Successfully requested new access code, calling cb");
        cb(null, { isAuthenticated: true, isFinal: true });
      })
      .catch(err => {
        log("Error requesting new access code, calling cb");
        cb(err, { isAuthenticated: false, isFinal: true });
      });

    return;
  }

  const prevAccessToken = getAccessToken();
  if (prevAccessToken) {
    log("Already authed from localStorage, calling cb");
    cb(null, { isAuthenticated: true, isFinal: true });
    return;
  }

  if (getAuth()) {
    // Okay so we have auth stuff, but it's stale. Lets use an iframe to request new deets
    let hasReturned = false;
    log("Have previous auth data, preemptively calling cb");
    cb(null, { isAuthenticated: true, isFinal: false });

    const timeoutID = setTimeout(() => {
      log("iFrame has timed out, calling cb");
      // This is a bit of a misnomer - it might not _actually_ be final, but we pretend it is anyway
      !hasReturned && cb(null, { isAuthenticated: false, isFinal: true });
    }, REAUTH_TIMEOUT);

    log("Ensuring we have a valid acccess token");
    getEnsuredAccessToken().then(token => {
      clearTimeout(timeoutID);
      hasReturned = true;
      log("Recieved valid acccess token, calling cb");
      cb(null, { isAuthenticated: !!token, isFinal: true });
    });
  } else {
    log("No previous auth data, calling cb");
    cb(null, { isAuthenticated: false, isFinal: true });
  }
};

export default destinyAuth;

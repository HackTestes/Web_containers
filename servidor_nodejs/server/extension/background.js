function logURL(requestDetails) {
    console.log("Loading: " + requestDetails.url);
  }
  
  browser.webRequest.onCompleted.addListener(logURL);
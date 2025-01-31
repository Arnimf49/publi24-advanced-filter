if (typeof browser === "undefined") {
  var browser = chrome;
}

const IS_MOBILE_VIEW = ('ontouchstart' in document.documentElement);
const IS_SAFARI_IOS = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const htmlLog = (...logs) => {
  const errorContainer = document.createElement('p');
  errorContainer.style.padding = '20px';
  errorContainer.style.paddingBottom = '70px';
  errorContainer.innerHTML = JSON.stringify(logs);
  document.body.appendChild(errorContainer);
}

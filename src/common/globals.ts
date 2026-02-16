export const browserApi = typeof browser !== "undefined" ? browser : chrome;
export const IS_PROMOTER = process.env.PROMOTER === 'true';
export const IS_MOBILE_VIEW: boolean = ('ontouchstart' in document.documentElement);
export const IS_SAFARI_IOS: boolean = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);

// Used for ios debugging.
// export const htmlLog = (data: any): void => {
//   const errorContainer = document.createElement('p');
//   errorContainer.style.padding = '20px';
//   errorContainer.style.paddingBottom = '70px';
//   if (data?.message) {
//       errorContainer.innerHTML = `${data.message}<br>${data.stack}`;
//   } else {
//       errorContainer.innerHTML = JSON.stringify(data, null, 2);
//   }
//   document.body.appendChild(errorContainer);
// }
//
// window.addEventListener('error', htmlLog, true);

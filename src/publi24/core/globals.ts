export const IS_AD_PAGE = !!document.querySelector('[data-url^="/DetailAd/IncrementViewHit"]');

// export const htmlLog = (data: any): void => {
//   const errorContainer = document.createElement('p');
//   errorContainer.style.padding = '20px';
//   errorContainer.style.paddingBottom = '70px';
//   if (data.message) {
//       errorContainer.innerHTML = `${data.message}<br>${data.stack}`;
//   } else {
//       errorContainer.innerHTML = JSON.stringify(data, null, 2);
//   }
//   document.body.appendChild(errorContainer);
// }
//
// window.addEventListener('error', htmlLog, true);

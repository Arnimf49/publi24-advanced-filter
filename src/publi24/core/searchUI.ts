import {IS_MOBILE_VIEW} from "../../common/globals";

export function withRetry(callback: () => any) {
  try {
    callback();
  } catch (error) {
    console.warn(error);
    setTimeout(callback, 50);
  }
}

export function addSearchLoader(text: string, isManual: boolean, progress?: number, topOffset?: number): void {
  const loader = document.createElement('div');
  document.body.appendChild(loader);

  loader.style.background = 'rgba(59, 63, 71, 0.8)';
  loader.style.backdropFilter = 'blur(8px)';
  loader.style.setProperty('-webkit-backdrop-filter', 'blur(8px)');
  loader.style.position = 'fixed';
  loader.style.top = `${60 + (topOffset || 0)}px`;
  loader.style.width = IS_MOBILE_VIEW ? 'calc(100% - 50px)' : '50%';
  loader.style.left = '50%';
  loader.style.transform = 'translateX(-50%)';
  loader.style.height = '22px';
  loader.style.padding = '4px';
  loader.style.borderRadius = '4px';
  loader.style.boxShadow = '2px 2px 12px 2px rgba(0,0,0,0.4)';
  loader.style.zIndex = '9999';

  const progressBar = document.createElement('div');
  progressBar.setAttribute('data-ww-progress-bar', 'true');
  loader.appendChild(progressBar);

  const percent = progress !== undefined ? progress : 100;
  progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  progressBar.style.height = '100%';
  progressBar.style.background = 'rgba(97, 147, 59, 0.85)';
  progressBar.style.borderRadius = '4px';
  progressBar.style.transition = 'width 0.2s ease-in-out';

  let textEl = document.createElement('div');
  textEl.setAttribute('data-ww-loader-text', 'true');
  loader.appendChild(textEl);
  textEl.innerHTML = text;

  textEl.style.position = 'absolute';
  textEl.style.top = '50%';
  textEl.style.left = '50%';
  textEl.style.transform = 'translate(-50%, -50%)';
  textEl.style.color = 'white';
  textEl.style.mixBlendMode = 'overlay';
  textEl.style.fontWeight = 'bold';
  textEl.style.whiteSpace = 'nowrap';

  const manualText = document.createElement('div');
  manualText.setAttribute('data-ww-manual-text', 'true');
  document.body.appendChild(manualText);

  manualText.innerHTML = `control ${isManual ? 'manual' : 'automat'} (vezi setări)`;
  manualText.style.background = 'rgba(40, 41, 43, 0.8)';
  manualText.style.backdropFilter = 'blur(8px)';
  manualText.style.setProperty('-webkit-backdrop-filter', 'blur(8px)');
  manualText.style.color = 'rgb(106 110 117)';
  manualText.style.position = 'fixed';
  manualText.style.top = `${90 + (topOffset || 0)}px`;
  manualText.style.left = '50%';
  manualText.style.transform = 'translateX(-50%)';
  manualText.style.padding = '6px 12px';
  manualText.style.borderRadius = '0 0 4px 4px';
  manualText.style.fontSize = '12px';
  manualText.style.fontWeight = 'bold';
  manualText.style.boxShadow = '2px 2px 8px 1px rgba(0,0,0,0.3)';
  manualText.style.zIndex = '9999';
  manualText.style.textAlign = 'center';
  manualText.style.whiteSpace = 'nowrap';
}

export function addContinueButton(onContinue: () => void): void {
  const button = document.createElement('button');
  button.setAttribute('data-ww-search-continue', 'true');
  document.body.appendChild(button);

  const buttonText = document.createElement('span');
  buttonText.textContent = 'Continuă';
  buttonText.style.color = 'white';
  buttonText.style.mixBlendMode = 'overlay';
  button.appendChild(buttonText);

  button.style.background = 'rgba(97, 147, 59, 0.75)';
  button.style.backdropFilter = 'blur(8px)';
  button.style.setProperty('-webkit-backdrop-filter', 'blur(8px)');
  button.style.position = 'fixed';
  button.style.padding = '12px 24px';
  button.style.borderRadius = '4px';
  button.style.color = 'white';
  button.style.fontSize = '16px';
  button.style.fontWeight = 'bold';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '2px 2px 12px 2px rgba(0,0,0,0.4)';
  button.style.zIndex = '9999';

  if (IS_MOBILE_VIEW) {
    button.style.bottom = '20px';
    button.style.right = '20px';
  } else {
    button.style.bottom = '20px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
  }

  button.addEventListener('click', onContinue);
}

import {utils} from "../../common/utils";
import {lensPage} from "./lensPage";

interface CropControls {
  image: HTMLImageElement;
  imageRect: DOMRect;
  sliders: HTMLInputElement[];
}

interface CornerValues {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const MAX_ANCESTOR_DEPTH = 4;
const MIN_IMAGE_SIZE = 50;
const FULL_IMAGE_AREA_THRESHOLD = 0.75;
const CONTROLS_WAIT_MS = 2000;
const CROP_INIT_WAIT_MS = 1500;
const CORNER_LEFT = '0';
const CORNER_TOP = '1';
const CORNER_BOTTOM = '2';
const CORNER_RIGHT = '3';
const DRAG_STEPS = 5;
const DRAG_WAIT_MS = 1200;
const READY_STABLE_MS = 500;
const READY_SETTLE_MS = 1500;
const READY_TIMEOUT_MS = 5000;
const EXACT_REFRESH_TIMEOUT_MS = 3000;
const EXACT_POLL_MS = 100;

function getVisibleSliders(container: Element): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="range"]'))
    .filter(slider => {
      const rect = slider.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
}

function findCropControls(): CropControls | null {
  const candidates: CropControls[] = [];

  for (const image of document.querySelectorAll<HTMLImageElement>('img')) {
    const imageRect = image.getBoundingClientRect();

    if (imageRect.width < MIN_IMAGE_SIZE || imageRect.height < MIN_IMAGE_SIZE) {
      continue;
    }

    let container: HTMLElement | null = image.parentElement;

    for (let depth = 0; depth <= MAX_ANCESTOR_DEPTH && container; depth++) {
      const sliders = getVisibleSliders(container);

      if (sliders.length === 4) {
        candidates.push({image, imageRect, sliders});
        break;
      }

      container = container.parentElement;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // The crop image is the largest one with four range controls nearby.
  candidates.sort((a, b) => (b.imageRect.width * b.imageRect.height) - (a.imageRect.width * a.imageRect.height));
  return candidates[0];
}

async function waitForCropControls(timeoutMs: number): Promise<CropControls | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const controls = findCropControls();

    if (controls) {
      return controls;
    }

    await utils.sleep(100);
  }

  return null;
}

async function waitForCropInitialized(): Promise<void> {
  const deadline = Date.now() + CROP_INIT_WAIT_MS;
  let lastValues = '';
  let stableSince = Date.now();

  while (Date.now() < deadline) {
    const controls = findCropControls();
    const values = controls ? getCornerValues(controls) : null;
    const snapshot = values ? JSON.stringify(values) : '';

    if (values && values.right > 0 && values.bottom > 0 && snapshot === lastValues) {
      if (Date.now() - stableSince >= 300) {
        return;
      }
    } else {
      lastValues = snapshot;
      stableSince = Date.now();
    }

    await utils.sleep(100);
  }
}

async function waitForLensReady(): Promise<void> {
  const startedAt = Date.now();
  let lastSnapshot = '';
  let stableSince = Date.now();

  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    const controls = findCropControls();
    const values = controls ? getCornerValues(controls) : null;
    const snapshot = values
      ? JSON.stringify({
          values,
          href: lensPage.getExactMatchHref(),
          ready: document.readyState,
        })
      : '';

    if (document.readyState === 'complete' && !lensPage.isLensThinking() && snapshot !== '' && snapshot === lastSnapshot) {
      if (Date.now() - stableSince >= READY_STABLE_MS) {
        // Let the initial Lens search/model settle before changing the crop;
        // the debounced crop search captures the model when it is scheduled.
        await utils.sleep(READY_SETTLE_MS);
        return;
      }
    } else {
      lastSnapshot = snapshot;
      stableSince = Date.now();
    }

    await utils.sleep(100);
  }
}

function getCornerSlider(controls: CropControls, corner: string): HTMLInputElement | null {
  return controls.sliders.find(slider => slider.getAttribute('data-corner-type') === corner) ?? null;
}

function getCornerValues(controls: CropControls): CornerValues | null {
  const left = getCornerSlider(controls, CORNER_LEFT);
  const top = getCornerSlider(controls, CORNER_TOP);
  const right = getCornerSlider(controls, CORNER_RIGHT);
  const bottom = getCornerSlider(controls, CORNER_BOTTOM);

  if (!left || !top || !right || !bottom) {
    return null;
  }

  return {
    left: Number(left.value),
    top: Number(top.value),
    right: Number(right.value),
    bottom: Number(bottom.value),
  };
}

function getCropRect(sliders: HTMLInputElement[]): {left: number; top: number; right: number; bottom: number} {
  const rects = sliders.map(slider => slider.getBoundingClientRect());

  return {
    left: Math.min(...rects.map(rect => rect.left)),
    top: Math.min(...rects.map(rect => rect.top)),
    right: Math.max(...rects.map(rect => rect.right)),
    bottom: Math.max(...rects.map(rect => rect.bottom)),
  };
}

function getCoveredArea(controls: CropControls): number {
  const crop = getCropRect(controls.sliders);
  const widthRatio = Math.min(1, (crop.right - crop.left) / controls.imageRect.width);
  const heightRatio = Math.min(1, (crop.bottom - crop.top) / controls.imageRect.height);
  return widthRatio * heightRatio;
}

function isFullImage(values: CornerValues | null, controls: CropControls): boolean {
  if (values
    && values.left <= 1
    && values.top <= 1
    && values.right >= 99
    && values.bottom >= 99
  ) {
    return true;
  }

  return getCoveredArea(controls) >= FULL_IMAGE_AREA_THRESHOLD;
}

function isFullControls(controls: CropControls): boolean {
  return isFullImage(getCornerValues(controls), controls);
}

function isCropFull(): boolean {
  const controls = findCropControls();
  return controls ? isFullControls(controls) : false;
}

function getCornerHandle(controls: CropControls, corner: string): HTMLElement | null {
  const slider = getCornerSlider(controls, corner);
  return slider ? slider.parentElement ?? slider : null;
}

function createTouch(target: HTMLElement, x: number, y: number): Touch {
  return new Touch({
    identifier: 1,
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
  });
}

function dispatchTouchEvent(target: HTMLElement, type: string, x: number, y: number, ended: boolean): void {
  const touch = createTouch(target, x, y);

  target.dispatchEvent(new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    touches: ended ? [] : [touch],
    targetTouches: ended ? [] : [touch],
    changedTouches: [touch],
  }));
}

function dispatchHandleDrag(handle: HTMLElement, fromX: number, fromY: number, toX: number, toY: number): void {
  dispatchTouchEvent(handle, 'touchstart', fromX, fromY, false);

  for (let step = 1; step <= DRAG_STEPS; step++) {
    const x = fromX + (toX - fromX) * step / DRAG_STEPS;
    const y = fromY + (toY - fromY) * step / DRAG_STEPS;
    dispatchTouchEvent(handle, 'touchmove', x, y, false);
  }

  dispatchTouchEvent(handle, 'touchend', toX, toY, true);
}

function dragCornerTo(corner: string, toX: number, toY: number): boolean {
  const controls = findCropControls();

  if (!controls) {
    return false;
  }

  const handle = getCornerHandle(controls, corner);

  if (!handle) {
    return false;
  }

  const rect = handle.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  dispatchHandleDrag(handle, rect.x + rect.width / 2, rect.y + rect.height / 2, toX, toY);
  return true;
}

function getFullImageDrags(imageRect: DOMRect): Array<{corner: string, x: number, y: number}> {
  return [
    {corner: CORNER_LEFT, x: imageRect.left, y: imageRect.top},
    {corner: CORNER_TOP, x: imageRect.right, y: imageRect.top},
    {corner: CORNER_RIGHT, x: imageRect.right, y: imageRect.bottom},
    {corner: CORNER_BOTTOM, x: imageRect.left, y: imageRect.bottom},
  ];
}

async function dragToFullImage(imageRect: DOMRect): Promise<void> {
  for (const drag of getFullImageDrags(imageRect)) {
    dragCornerTo(drag.corner, drag.x, drag.y);
    await utils.sleep(50);
  }

  await utils.sleep(DRAG_WAIT_MS);
}

function isExactMatchReady(initialHref: string | null): boolean {
  const anchor = lensPage.getExactMatchAnchor();
  const href = anchor?.getAttribute('href') ?? '';

  if (!anchor || !href) {
    return false;
  }

  if (anchor.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  return href !== (initialHref ?? '');
}

async function waitForExactMatchRefresh(initialHref: string | null): Promise<void> {
  const deadline = Date.now() + EXACT_REFRESH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (isCropFull() && isExactMatchReady(initialHref)) {
      return;
    }

    await utils.sleep(EXACT_POLL_MS);
  }
}

async function expandToFullImage(): Promise<void> {
  let controls = findCropControls();

  if (!controls) {
    controls = await waitForCropControls(CONTROLS_WAIT_MS);
  }

  if (!controls) {
    return;
  }

  await waitForCropInitialized();

  controls = findCropControls();

  if (!controls) {
    return;
  }

  // If Lens already shows the whole image, leave the crop alone. Dragging an
  // already-full crop makes Lens cancel the exact-match refresh and leaves the
  // exact tab stuck on the visual results.
  if (isFullControls(controls)) {
    return;
  }

  // Lens writes the initial crop after the page loads. Resetting before that
  // point is overwritten and leaves the crop unchanged.
  await waitForLensReady();

  controls = findCropControls();

  if (!controls || isFullControls(controls)) {
    return;
  }

  const initialExactHref = lensPage.getExactMatchHref();

  utils.debugLog('Lens image selection is cropped; resetting it with drag gestures.');

  // Zoom out in a single gesture. Doing a "small crop first, then full image"
  // sequence schedules a second crop search while the first one is still
  // running; Lens then keeps the result container stuck on its loading state
  // and the exact tab never renders its results.
  await dragToFullImage(controls.imageRect);

  // Slider thumbs can stop a few percent short of the edge on the first pass.
  // Only repeat when the crop is actually still small.
  if (!isCropFull()) {
    const retryControls = findCropControls();

    if (retryControls) {
      await dragToFullImage(retryControls.imageRect);
    }
  }

  await waitForExactMatchRefresh(initialExactHref);
  utils.debugLog('Lens exact-match link ' + (isExactMatchReady(initialExactHref) ? 'refreshed.' : 'did not refresh in time.'));
}

export const lensSelection = {
  expandToFullImage,
};

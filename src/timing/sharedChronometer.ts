import PositionManager from '../core/PositionManager.js';
import Chronometer from './Chronometer.js';

const sharedChronometer = new Chronometer(null);
let isSubscribed = false;

function ensureSubscribed(): void {
  if (isSubscribed) {
    return;
  }

  PositionManager.getInstance().subscribe(sharedChronometer as unknown as { update?: (...args: unknown[]) => void });
  isSubscribed = true;
}

function getSharedChronometer(): Chronometer {
  ensureSubscribed();
  return sharedChronometer;
}

function attachSharedChronometerElement(element: HTMLElement | null): Chronometer {
  const chronometer = getSharedChronometer();
  chronometer.setElement(element);
  return chronometer;
}

function detachSharedChronometerElement(): void {
  sharedChronometer.setElement(null);
}

function stopSharedChronometer(): void {
  sharedChronometer.stop();
}

export {
  getSharedChronometer,
  attachSharedChronometerElement,
  detachSharedChronometerElement,
  stopSharedChronometer,
};

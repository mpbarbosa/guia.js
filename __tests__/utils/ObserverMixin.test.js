/**
 * @file ObserverMixin.test.js
 * @description Tests for the ObserverMixin factory function.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { withObserver } from '../../src/utils/ObserverMixin.js';
import ObserverSubject from '../../src/core/ObserverSubject.js';

function makeHost() {
  const host = { observerSubject: new ObserverSubject() };
  Object.assign(host, withObserver());
  return host;
}

describe('withObserver', () => {
  test('adds subscribe, unsubscribe and notifyObservers to target', () => {
    const mixin = withObserver();
    expect(typeof mixin.subscribe).toBe('function');
    expect(typeof mixin.unsubscribe).toBe('function');
    expect(typeof mixin.notifyObservers).toBe('function');
  });

  test('subscribe / notifyObservers / unsubscribe round-trip', () => {
    const host = makeHost();
    const observer = { update: jest.fn() };

    host.subscribe(observer);
    host.notifyObservers('event', { data: 1 });
    expect(observer.update).toHaveBeenCalled();

    host.unsubscribe(observer);
    host.notifyObservers('event', { data: 2 });
    expect(observer.update).toHaveBeenCalledTimes(1); // still 1
  });

  test('excludeNotify omits notifyObservers', () => {
    const mixin = withObserver({ excludeNotify: true });
    expect(mixin.notifyObservers).toBeUndefined();
    expect(typeof mixin.subscribe).toBe('function');
  });

  test('checkNull=true warns and skips null observer', () => {
    const host = { observerSubject: new ObserverSubject() };
    Object.assign(host, withObserver({ checkNull: true, className: 'TestClass' }));

    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    host.subscribe(null);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('checkNull=false accepts null without warning', () => {
    const host = makeHost();
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // null propagates to ObserverSubject — just ensure no warn from mixin
    try { host.subscribe(null); } catch (_) { /* ObserverSubject may throw */ }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('default export equals withObserver', async () => {
    const mod = await import('../../src/utils/ObserverMixin.js');
    expect(mod.default).toBe(withObserver);
  });
});

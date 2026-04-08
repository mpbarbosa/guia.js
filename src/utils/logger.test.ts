import { describe, it, expect, jest } from '@jest/globals';
import * as logger from './logger.js';

describe('logger', () => {
  it('log calls console.log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.log('foo', 1);
    expect(spy).toHaveBeenCalledWith('[LOG]', 'foo', 1);
    spy.mockRestore();
  });

  it('warn calls console.warn', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('bar', 2);
    expect(spy).toHaveBeenCalledWith('[WARN]', 'bar', 2);
    spy.mockRestore();
  });

  it('error calls console.error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('baz', 3);
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'baz', 3);
    spy.mockRestore();
  });
});

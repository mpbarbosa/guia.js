/**
 * main.test.ts — Tests for Vue 3 application entry point (src/main.ts)
 */

import { app, router } from './main';

describe('main.ts Vue app entry point', () => {
  let createAppMock: jest.Mock;
  let appInstanceMock: any;
  let mountMock: jest.Mock;
  let useMock: jest.Mock;
  let getElementByIdSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock createApp and its returned instance
    mountMock = jest.fn();
    useMock = jest.fn().mockReturnThis();
    appInstanceMock = { use: useMock, mount: mountMock };
    createAppMock = jest.fn().mockReturnValue(appInstanceMock);

    jest.resetModules();
    jest.doMock('vue', () => ({ createApp: createAppMock }));
    jest.doMock('./App.vue', () => ({}));
    jest.doMock('./router', () => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.dontMock('vue');
    jest.dontMock('./App.vue');
    jest.dontMock('./router');
    if (getElementByIdSpy) getElementByIdSpy.mockRestore();
  });

  it('should create the Vue app and use the router', () => {
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(null);
    require('./main');
    expect(createAppMock).toHaveBeenCalled();
    expect(useMock).toHaveBeenCalled();
  });

  it('should mount the app if #app element exists (happy path)', () => {
    const fakeEl = document.createElement('div');
    fakeEl.id = 'app';
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(fakeEl);
    require('./main');
    expect(mountMock).toHaveBeenCalledWith(fakeEl);
  });

  it('should not mount the app if #app element does not exist (edge case)', () => {
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(null);
    require('./main');
    expect(mountMock).not.toHaveBeenCalled();
  });

  it('should export app and router instances', () => {
    expect(app).toBeDefined();
    expect(router).toBeDefined();
  });

  it('should handle error if createApp throws (error scenario)', () => {
    createAppMock.mockImplementationOnce(() => { throw new Error('createApp failed'); });
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));
    expect(() => require('./main')).toThrow('createApp failed');
  });

  it('should handle error if app.use throws (error scenario)', () => {
    useMock.mockImplementationOnce(() => { throw new Error('use failed'); });
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));
    expect(() => require('./main')).toThrow('use failed');
  });

  it('should handle error if app.mount throws (error scenario)', () => {
    mountMock.mockImplementationOnce(() => { throw new Error('mount failed'); });
    const fakeEl = document.createElement('div');
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(fakeEl);
    expect(() => require('./main')).toThrow('mount failed');
  });
});

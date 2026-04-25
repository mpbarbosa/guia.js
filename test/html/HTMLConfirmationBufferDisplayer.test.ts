import { jest } from '@jest/globals';

let HTMLConfirmationBufferDisplayer: typeof import('../../src/html/HTMLConfirmationBufferDisplayer').default;
let timerManager: {
  setInterval: jest.Mock;
  clearTimer: jest.Mock;
};
let AddressCache: {
  getInstance: jest.Mock;
};

beforeAll(async () => {
  await jest.unstable_mockModule('../../src/utils/TimerManager.js', () => ({
    default: {
      setInterval: jest.fn(),
      clearTimer: jest.fn(),
    },
  }));

  await jest.unstable_mockModule('../../src/data/AddressCache.js', () => ({
    default: {
      getInstance: jest.fn(),
    },
  }));

  ({ default: HTMLConfirmationBufferDisplayer } = await import('../../src/html/HTMLConfirmationBufferDisplayer.js'));
  ({ default: timerManager } = await import('../../src/utils/TimerManager.js') as {
    default: { setInterval: jest.Mock; clearTimer: jest.Mock };
  });
  ({ default: AddressCache } = await import('../../src/data/AddressCache.js') as {
    default: { getInstance: jest.Mock };
  });
});

const TIMER_ID = 'confirmation-buffer-card';

const getMockFieldBufferState = (overrides = {}) => ({
  isConfirmed: false,
  confirmed: null,
  hasPending: false,
  pending: null,
  pendingCount: 0,
  threshold: 3,
  ...overrides,
});

const getMockConfirmationBufferState = (overrides = {}) => ({
  logradouro: getMockFieldBufferState(),
  bairro: getMockFieldBufferState(),
  municipio: getMockFieldBufferState(),
  ...overrides,
});

describe('HTMLConfirmationBufferDisplayer', () => {
  let element: HTMLElement;
  let displayer: InstanceType<typeof HTMLConfirmationBufferDisplayer>;
  let getInstanceMock: jest.Mock;
  let getConfirmationBufferStateMock: jest.Mock;

  beforeEach(() => {
    element = document.createElement('div');
    getConfirmationBufferStateMock = jest.fn();
    getInstanceMock = jest.fn(() => ({
      getConfirmationBufferState: getConfirmationBufferStateMock,
    }));
    (AddressCache.getInstance as jest.Mock).mockImplementation(getInstanceMock);
    (timerManager.setInterval as jest.Mock).mockClear();
    (timerManager.clearTimer as jest.Mock).mockClear();
  });

  afterEach(() => {
    if (displayer) displayer.destroy();
    jest.clearAllMocks();
  });

  it('renders the confirmation buffer table on construction (happy path)', () => {
    const state = getMockConfirmationBufferState({
      logradouro: getMockFieldBufferState({
        isConfirmed: true,
        confirmed: 'Rua A',
        hasPending: true,
        pending: 'Rua B',
        pendingCount: 2,
        threshold: 3,
      }),
      bairro: getMockFieldBufferState({
        isConfirmed: false,
        confirmed: null,
        hasPending: false,
        pending: null,
        pendingCount: 0,
        threshold: 2,
      }),
      municipio: getMockFieldBufferState({
        isConfirmed: true,
        confirmed: 'Cidade X',
        hasPending: false,
        pending: null,
        pendingCount: 0,
        threshold: 1,
      }),
    });
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(element.innerHTML).toContain('confirmation-buffer-table');
    expect(element.innerHTML).toContain('Rua A');
    expect(element.innerHTML).toContain('Cidade X');
    expect(element.innerHTML).toContain('2 / 3');
    expect(timerManager.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000, TIMER_ID);
  });

  it('renders correct HTML for null confirmed and pending values', () => {
    const state = getMockConfirmationBufferState({
      logradouro: getMockFieldBufferState({
        isConfirmed: true,
        confirmed: null,
        hasPending: true,
        pending: null,
        pendingCount: 1,
        threshold: 2,
      }),
    });
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(element.innerHTML).toContain('<em class="text-muted">nulo</em>');
  });

  it('renders correct HTML for not confirmed and not pending', () => {
    const state = getMockConfirmationBufferState({
      logradouro: getMockFieldBufferState({
        isConfirmed: false,
        hasPending: false,
        threshold: 5,
      }),
    });
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(element.innerHTML).toContain('<em class="text-muted">—</em>');
    expect(element.innerHTML).toContain('<span class="text-muted">—</span>');
    expect(element.innerHTML).toContain('<span class="text-muted">— / 5</span>');
  });

  it('applies table-warning class when hasPending is true', () => {
    const state = getMockConfirmationBufferState({
      bairro: getMockFieldBufferState({
        hasPending: true,
        pendingCount: 1,
        threshold: 2,
      }),
    });
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(element.innerHTML).toContain('class="table-warning"');
  });

  it('calls timerManager.clearTimer on destroy', () => {
    getConfirmationBufferStateMock.mockReturnValue(getMockConfirmationBufferState());
    displayer = new HTMLConfirmationBufferDisplayer(element);

    displayer.destroy();

    expect(timerManager.clearTimer).toHaveBeenCalledWith(TIMER_ID);
  });

  it('refreshes the table every second', () => {
    getConfirmationBufferStateMock.mockReturnValue(getMockConfirmationBufferState());
    displayer = new HTMLConfirmationBufferDisplayer(element);

    // Simulate timer callback
    const intervalFn = (timerManager.setInterval as jest.Mock).mock.calls[0][0];
    getConfirmationBufferStateMock.mockReturnValue(getMockConfirmationBufferState({
      logradouro: getMockFieldBufferState({ isConfirmed: true, confirmed: 'Rua Nova' }),
    }));
    intervalFn();

    expect(element.innerHTML).toContain('Rua Nova');
  });

  it('handles edge case: all fields missing or empty', () => {
    const state = {
      logradouro: undefined,
      bairro: undefined,
      municipio: undefined,
    } as any;
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    // Should not throw, but will render undefined fields
    expect(element.innerHTML).toContain('confirmation-buffer-table');
  });

  it('handles edge case: field buffer with missing properties', () => {
    const state = getMockConfirmationBufferState({
      logradouro: {} as any,
    });
    getConfirmationBufferStateMock.mockReturnValue(state);

    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(element.innerHTML).toContain('confirmation-buffer-table');
  });

  it('does not throw if destroy is called multiple times', () => {
    getConfirmationBufferStateMock.mockReturnValue(getMockConfirmationBufferState());
    displayer = new HTMLConfirmationBufferDisplayer(element);

    expect(() => {
      displayer.destroy();
      displayer.destroy();
    }).not.toThrow();
  });
});

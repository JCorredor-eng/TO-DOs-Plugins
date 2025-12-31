import '@testing-library/jest-dom';

jest.mock('react-focus-lock', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.scrollTo = jest.fn();
global.requestAnimationFrame = jest.fn((cb) => {
  cb(0);
  return 0;
});
global.cancelAnimationFrame = jest.fn();

beforeEach(() => {
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'euiPortal');
  document.body.appendChild(portalRoot);
  document.body.style.overflow = 'visible';
});

afterEach(() => {
  const portalRoot = document.getElementById('euiPortal');
  if (portalRoot && document.body.contains(portalRoot)) {
    document.body.removeChild(portalRoot);
  }
  document.body.style.overflow = '';
});

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('[React Intl]'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

export {};

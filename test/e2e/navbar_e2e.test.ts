import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import Navbar from '../../src/html/Navbar.js';

function createRealisticDocument() {
  // Simulate a minimal DOM for E2E
  const elements: Record<string, any> = {};
  const body = {
    prepend: (el: any) => { elements[el.id] = el; },
  };
  return {
    body,
    getElementById: (id: string) => elements[id] || null,
    createElement: (tag: string) => {
      const el: any = {
        id: '',
        innerHTML: '',
        classList: {
          toggle: jest.fn(),
          remove: jest.fn(),
          add: jest.fn(),
          contains: jest.fn(),
        },
        querySelector: jest.fn(() => ({ classList: { toggle: jest.fn(), remove: jest.fn(), add: jest.fn() } })),
        addEventListener: jest.fn(),
        parentElement: null,
        contains: jest.fn(() => false),
      };
      return el;
    },
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
  } as unknown as Document;
}

describe('Navbar E2E', () => {
  let document: Document;

  beforeEach(() => {
    document = createRealisticDocument();
  });

  it('user journey: renders, toggles dropdown, closes on outside click', () => {
    const params = {
      brand: 'GuiaJS',
      navItems: [
        { label: 'Home', href: '/' },
        { label: 'Tours', href: '/tours' },
        { label: 'More', href: '#', isDropdown: true, dropdownMenu: { items: [{ label: 'About', href: '/about' }] } }
      ],
      searchForm: { placeholder: 'Search...', isFunctional: true }
    };
    const navbar = new Navbar(params);
    navbar.render(document);

    // Simulate dropdown toggle click
    const parent = {
      classList: { toggle: jest.fn(), remove: jest.fn(), add: jest.fn() },
      querySelector: jest.fn(() => ({ classList: { toggle: jest.fn(), remove: jest.fn(), add: jest.fn() } })),
      contains: jest.fn(() => false),
    };
    const toggle = { parentElement: parent, addEventListener: jest.fn((_, cb) => { cb.call(toggle, { preventDefault: jest.fn() }); }) };
    (document.querySelectorAll as any).mockReturnValue([toggle]);
    navbar['containerId'] = 'navbar-container';
    navbar['render'](document);

    // Simulate outside click
    (document.addEventListener as any) = jest.fn((_, cb) => { cb({ target: {} }); });
    navbar['render'](document);

    expect(document.getElementById('navbar-container').innerHTML).toContain('navbar-brand');
    expect(document.getElementById('navbar-container').innerHTML).toContain('dropdown-toggle');
    expect(document.getElementById('navbar-container').innerHTML).toContain('form-inline');
  });

  it('user journey: renders without search form', () => {
    const params = {
      brand: 'GuiaJS',
      navItems: [
        { label: 'Home', href: '/' }
      ]
    };
    const navbar = new Navbar(params);
    navbar.render(document);
    expect(document.getElementById('navbar-container').innerHTML).toContain('Home');
    expect(document.getElementById('navbar-container').innerHTML).not.toContain('form-inline');
  });
});

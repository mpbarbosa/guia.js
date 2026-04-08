import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import Navbar, { NavbarParams, SearchForm } from './Navbar.js';

function createMockDocument() {
  const elements: Record<string, any> = {};
  return {
    body: {
      prepend: jest.fn((el: any) => { elements[el.id] = el; }),
    },
    getElementById: jest.fn((id: string) => elements[id] || null),
    createElement: jest.fn((_tag: string) => {
      const el: any = { id: '', innerHTML: '', classList: { toggle: jest.fn(), remove: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      return el;
    }),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
  } as unknown as Document;
}

const baseParams: NavbarParams = {
  brand: 'TestBrand',
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ],
};

describe('Navbar', () => {
  let doc: ReturnType<typeof createMockDocument>;

  beforeEach(() => {
    doc = createMockDocument();
  });

  describe('constructor', () => {
    it('sets brand, navItems, and default containerId', () => {
      const navbar = new Navbar(baseParams);
      expect(navbar.brand).toBe('TestBrand');
      expect(navbar.navItems).toHaveLength(2);
      expect(navbar.containerId).toBe('navbar-container');
    });

    it('accepts a custom containerId', () => {
      const navbar = new Navbar({ ...baseParams, containerId: 'my-nav' });
      expect(navbar.containerId).toBe('my-nav');
    });

    it('stores optional searchForm', () => {
      const form: SearchForm = { placeholder: 'Search…', isFunctional: true };
      const navbar = new Navbar({ ...baseParams, searchForm: form });
      expect(navbar.searchForm).toEqual(form);
    });
  });

  describe('render()', () => {
    it('creates a container element when none exists and prepends it to body', () => {
      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);
      expect(doc.createElement).toHaveBeenCalledWith('nav');
      expect(doc.body.prepend).toHaveBeenCalled();
    });

    it('reuses an existing container element', () => {
      const existing: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(existing);

      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);

      expect(doc.createElement).not.toHaveBeenCalled();
      expect(existing.innerHTML).not.toBe('');
    });

    it('attaches document-level click listener for closing dropdowns', () => {
      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);
      expect(doc.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('_buildNavbarHtml()', () => {
    it('includes the brand name', () => {
      const container: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(container);
      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);
      expect(container.innerHTML).toContain('TestBrand');
    });

    it('includes nav item labels and hrefs', () => {
      const container: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(container);
      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);
      expect(container.innerHTML).toContain('Home');
      expect(container.innerHTML).toContain('/about');
    });

    it('includes dropdown items when navItem.isDropdown is true', () => {
      const container: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(container);
      const params: NavbarParams = {
        ...baseParams,
        navItems: [
          {
            label: 'More',
            href: '#',
            isDropdown: true,
            dropdownMenu: { items: [{ label: 'Contact', href: '/contact' }] },
          },
        ],
      };
      const navbar = new Navbar(params);
      navbar.render(doc as unknown as Document);
      expect(container.innerHTML).toContain('dropdown-toggle');
      expect(container.innerHTML).toContain('Contact');
      expect(container.innerHTML).toContain('/contact');
    });

    it('includes search form when searchForm is provided', () => {
      const container: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(container);
      const navbar = new Navbar({ ...baseParams, searchForm: { placeholder: 'Find it', isFunctional: false } });
      navbar.render(doc as unknown as Document);
      expect(container.innerHTML).toContain('Find it');
      expect(container.innerHTML).toContain('form-inline');
    });

    it('omits search form when searchForm is not provided', () => {
      const container: any = { id: 'navbar-container', innerHTML: '', classList: { toggle: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      (doc.getElementById as jest.Mock).mockReturnValue(container);
      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);
      expect(container.innerHTML).not.toContain('form-inline');
    });
  });

  describe('_attachDropdownHandlers()', () => {
    it('attaches click listeners to dropdown toggles', () => {
      const toggle = { addEventListener: jest.fn(), parentElement: { classList: { toggle: jest.fn(), remove: jest.fn() }, querySelector: jest.fn(() => null), contains: jest.fn(() => false) } };
      (doc.querySelectorAll as jest.Mock).mockReturnValue([toggle]);

      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);

      expect(toggle.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('toggles "show" on parent when dropdown toggle is clicked', () => {
      const menu = { classList: { toggle: jest.fn(), remove: jest.fn() } };
      const parent = { classList: { toggle: jest.fn(), remove: jest.fn() }, querySelector: jest.fn(() => menu), contains: jest.fn(() => false) };
      const toggle = { addEventListener: jest.fn(), parentElement: parent };
      (doc.querySelectorAll as jest.Mock).mockReturnValue([toggle]);

      const navbar = new Navbar(baseParams);
      navbar.render(doc as unknown as Document);

      // Retrieve and invoke the registered click handler with correct `this`
      const clickHandler = (toggle.addEventListener as jest.Mock).mock.calls[0][1] as (this: typeof toggle, e: { preventDefault: () => void }) => void;
      clickHandler.call(toggle, { preventDefault: jest.fn() });

      expect(parent.classList.toggle).toHaveBeenCalledWith('show');
      expect(menu.classList.toggle).toHaveBeenCalledWith('show');
    });
  });
});

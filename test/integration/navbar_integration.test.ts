import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import Navbar from '../../src/html/Navbar.js';
import NavItem from '../../src/html/NavItem.js';
import DropdownMenu from '../../src/html/DropdownMenu.js';
import SearchForm from '../../src/html/SearchForm.js';

function createMockDocument() {
  const elements: Record<string, any> = {};
  return {
    body: {
      prepend: jest.fn((el) => { elements[el.id] = el; }),
    },
    getElementById: jest.fn((id) => elements[id] || null),
    createElement: jest.fn((tag) => {
      const el: any = { id: '', innerHTML: '', classList: { toggle: jest.fn(), remove: jest.fn() }, querySelector: jest.fn(), addEventListener: jest.fn() };
      return el;
    }),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
  } as unknown as Document;
}

describe('Navbar integration', () => {
  let document: Document;

  beforeEach(() => {
    document = createMockDocument();
  });

  it('renders Navbar with NavItem and DropdownMenu', () => {
    const navItems = [
      new NavItem({ label: 'Home', href: '/' }),
      new NavItem({
        label: 'More',
        href: '#',
        isDropdown: true,
        dropdownMenu: new DropdownMenu({ items: [{ label: 'About', href: '/about' }] })
      })
    ].map((ni: any) => ({
      label: ni.label,
      href: ni.href,
      isDropdown: ni.isDropdown,
      dropdownMenu: ni.dropdownMenu
    }));

    const navbar = new Navbar({
      brand: 'GuiaJS',
      navItems,
      searchForm: { placeholder: 'Search...', isFunctional: true }
    });

    navbar.render(document);
    const container = document.getElementById('navbar-container');
    expect(container.innerHTML).toContain('navbar-brand');
    expect(container.innerHTML).toContain('dropdown-toggle');
    expect(container.innerHTML).toContain('dropdown-menu');
    expect(container.innerHTML).toContain('form-inline');
  });

  it('renders Navbar with SearchForm', () => {
    const navbar = new Navbar({
      brand: 'GuiaJS',
      navItems: [],
      searchForm: new SearchForm({ placeholder: 'Buscar...', isFunctional: false })
    });
    navbar.render(document);
    const container = document.getElementById('navbar-container');
    expect(container.innerHTML).toContain('Buscar...');
    expect(container.innerHTML).toContain('disabled');
  });

  it('Navbar and NavItem HTML match', () => {
    const navItem = new NavItem({ label: 'Tours', href: '/tours' });
    const navbar = new Navbar({
      brand: 'GuiaJS',
      navItems: [navItem as any],
    });
    const navHtml = navItem.render(0);
    const navbarHtml = (navbar as any)._buildNavItemHtml(navItem as any, 0);
    expect(navHtml).toBe(navbarHtml);
  });

  it('DropdownMenu HTML matches in Navbar and DropdownMenu', () => {
    const dropdownMenu = new DropdownMenu({ items: [{ label: 'About', href: '/about' }] });
    const navItem = new NavItem({ label: 'More', href: '#', isDropdown: true, dropdownMenu });
    const navbar = new Navbar({
      brand: 'GuiaJS',
      navItems: [navItem as any],
    });
    const navHtml = navItem.render(0);
    const navbarHtml = (navbar as any)._buildNavItemHtml(navItem as any, 0);
    expect(navHtml).toBe(navbarHtml);
    expect(dropdownMenu.render()).toContain('About');
  });
});

import { describe, it, expect } from '@jest/globals';
import NavItem from './NavItem.js';

describe('NavItem', () => {
  it('constructs with required params', () => {
    const item = new NavItem({ label: 'Home', href: '/' });
    expect(item.label).toBe('Home');
    expect(item.href).toBe('/');
    expect(item.isDropdown).toBe(false);
    expect(item.dropdownMenu).toBeUndefined();
  });

  it('constructs with dropdown', () => {
    const item = new NavItem({
      label: 'More',
      href: '#',
      isDropdown: true,
      dropdownMenu: { items: [{ label: 'About', href: '/about' }] }
    });
    expect(item.isDropdown).toBe(true);
    expect(item.dropdownMenu?.items.length).toBe(1);
  });

  it('renders normal nav item', () => {
    const item = new NavItem({ label: 'Home', href: '/' });
    const html = item.render(0);
    expect(html).toContain('nav-item');
    expect(html).toContain('nav-link');
    expect(html).toContain('Home');
    expect(html).not.toContain('dropdown');
  });

  it('renders dropdown nav item', () => {
    const item = new NavItem({
      label: 'More',
      href: '#',
      isDropdown: true,
      dropdownMenu: { items: [{ label: 'About', href: '/about' }] }
    });
    const html = item.render(1);
    expect(html).toContain('dropdown-toggle');
    expect(html).toContain('dropdown-menu');
    expect(html).toContain('About');
  });

  it('renders dropdown with multiple items', () => {
    const item = new NavItem({
      label: 'More',
      href: '#',
      isDropdown: true,
      dropdownMenu: { items: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] }
    });
    const html = item.render(2);
    expect(html).toContain('About');
    expect(html).toContain('Contact');
  });

  it('handles missing dropdownMenu gracefully', () => {
    const item = new NavItem({ label: 'Broken', href: '#', isDropdown: true });
    const html = item.render(3);
    expect(html).toContain('nav-item');
    expect(html).not.toContain('dropdown-menu');
  });
});

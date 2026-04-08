import { describe, it, expect } from '@jest/globals';
import DropdownMenu from './DropdownMenu.js';

describe('DropdownMenu', () => {
  it('constructs with items', () => {
    const menu = new DropdownMenu({ items: [{ label: 'About', href: '/about' }] });
    expect(menu.items.length).toBe(1);
    expect(menu.items[0].label).toBe('About');
  });

  it('renders single item', () => {
    const menu = new DropdownMenu({ items: [{ label: 'About', href: '/about' }] });
    const html = menu.render();
    expect(html).toContain('dropdown-item');
    expect(html).toContain('About');
    expect(html).toContain('/about');
  });

  it('renders multiple items', () => {
    const menu = new DropdownMenu({
      items: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ]
    });
    const html = menu.render();
    expect(html).toContain('About');
    expect(html).toContain('Contact');
    expect(html.match(/dropdown-item/g)?.length).toBe(2);
  });

  it('renders empty when no items', () => {
    const menu = new DropdownMenu({ items: [] });
    const html = menu.render();
    expect(html).toBe('');
  });
});

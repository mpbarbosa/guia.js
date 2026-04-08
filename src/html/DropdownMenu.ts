/**
 * @fileoverview DropdownMenu Component - Dropdown menu for navigation bar.
 * @module html/DropdownMenu
 * @since 0.11.0
 */

export interface DropdownItem {
  label: string;
  href: string;
}

export interface DropdownMenuParams {
  items: DropdownItem[];
}

/**
 * DropdownMenu component for navigation bar.
 */
class DropdownMenu {
  items: DropdownItem[];

  constructor(params: DropdownMenuParams) {
    this.items = params.items;
  }

  render(): string {
    return this.items.map(item =>
      `<a class="dropdown-item" href="${item.href}">${item.label}</a>`
    ).join('');
  }
}

export default DropdownMenu;

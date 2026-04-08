/**
 * @fileoverview NavItem Component - Single navigation item or dropdown trigger.
 * @module html/NavItem
 * @since 0.11.0
 */

import { DropdownMenu } from './Navbar.js';

export interface NavItemParams {
  label: string;
  href: string;
  isDropdown?: boolean;
  dropdownMenu?: DropdownMenu;
}

/**
 * NavItem component for navigation bar.
 */
class NavItem {
  label: string;
  href: string;
  isDropdown: boolean;
  dropdownMenu?: DropdownMenu;

  constructor(params: NavItemParams) {
    this.label = params.label;
    this.href = params.href;
    this.isDropdown = !!params.isDropdown;
    if (params.dropdownMenu !== undefined) this.dropdownMenu = params.dropdownMenu;
  }

  render(idx: number): string {
    if (this.isDropdown && this.dropdownMenu) {
      return `
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="${this.href}" id="navbarDropdown${idx}" role="button"
    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    ${this.label}
  </a>
  <div class="dropdown-menu" aria-labelledby="navbarDropdown${idx}">
    ${this.dropdownMenu.items.map(di => `<a class="dropdown-item" href="${di.href}">${di.label}</a>`).join('')}
  </div>
</li>
      `.trim();
    }
    return `
<li class="nav-item">
  <a class="nav-link" href="${this.href}">${this.label}</a>
</li>
    `.trim();
  }
}

export default NavItem;

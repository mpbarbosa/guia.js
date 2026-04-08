/**
 * @fileoverview Navbar Component - Bootstrap 4 Navigation Bar
 * Implements a strictly typed, modular navigation bar with dropdowns and search form.
 * 
 * @module html/Navbar
 * @since 0.11.0
 * @author
 */

import { log } from '../utils/logger.js';

export interface DropdownItem {
  label: string;
  href: string;
}

export interface DropdownMenu {
  items: DropdownItem[];
}

export interface NavItem {
  label: string;
  href: string;
  isDropdown?: boolean;
  dropdownMenu?: DropdownMenu;
}

export interface SearchForm {
  placeholder: string;
  isFunctional?: boolean;
}

export interface NavbarParams {
  brand: string;
  navItems: NavItem[];
  searchForm?: SearchForm;
  containerId?: string;
}

/**
 * Navbar component for Bootstrap 4 navigation bar.
 * 
 * Usage:
 *   const navbar = new Navbar({
 *     brand: 'GuiaJS',
 *     navItems: [
 *       { label: 'Home', href: '/' },
 *       { label: 'Tours', href: '/tours' },
 *       { label: 'More', href: '#', isDropdown: true, dropdownMenu: { items: [{ label: 'About', href: '/about' }] } }
 *     ],
 *     searchForm: { placeholder: 'Search...', isFunctional: true }
 *   });
 *   navbar.render(document);
 */
class Navbar {
  brand: string;
  navItems: NavItem[];
  searchForm?: SearchForm;
  containerId: string;

  constructor(params: NavbarParams) {
    this.brand = params.brand;
    this.navItems = params.navItems;
    if (params.searchForm !== undefined) this.searchForm = params.searchForm;
    this.containerId = params.containerId || 'navbar-container';
  }

  /**
   * Renders the navbar into the specified document.
   * @param document The browser document object.
   */
  render(document: Document): void {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('nav');
      container.id = this.containerId;
      document.body.prepend(container);
    }
    container.innerHTML = this._buildNavbarHtml();
    this._attachDropdownHandlers(document);
    log('Navbar rendered');
  }

  private _buildNavbarHtml(): string {
    return `
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">${this.brand}</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav mr-auto">
      ${this.navItems.map((item, idx) => this._buildNavItemHtml(item, idx)).join('')}
    </ul>
    ${this.searchForm ? this._buildSearchFormHtml(this.searchForm) : ''}
  </div>
</nav>
    `.trim();
  }

  private _buildNavItemHtml(item: NavItem, idx: number): string {
    if (item.isDropdown && item.dropdownMenu) {
      return `
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="${item.href}" id="navbarDropdown${idx}" role="button"
    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    ${item.label}
  </a>
  <div class="dropdown-menu" aria-labelledby="navbarDropdown${idx}">
    ${item.dropdownMenu.items.map(di => `<a class="dropdown-item" href="${di.href}">${di.label}</a>`).join('')}
  </div>
</li>
      `.trim();
    }
    return `
<li class="nav-item">
  <a class="nav-link" href="${item.href}">${item.label}</a>
</li>
    `.trim();
  }

  private _buildSearchFormHtml(form: SearchForm): string {
    return `
<form class="form-inline my-2 my-lg-0" ${form.isFunctional ? 'onsubmit="return false;"' : ''}>
  <input class="form-control mr-sm-2" type="search" placeholder="${form.placeholder}" aria-label="Search">
  <button class="btn btn-outline-success my-2 my-sm-0" type="submit" ${form.isFunctional ? '' : 'disabled'}>Search</button>
</form>
    `.trim();
  }

  /**
   * Attaches dropdown menu handlers for accessibility and Bootstrap 4 compatibility.
   * @param document The browser document object.
   */
  private _attachDropdownHandlers(document: Document): void {
    // Bootstrap 4 dropdowns require jQuery/Popper, but we add fallback for toggling
    const dropdownToggles = document.querySelectorAll(`#${this.containerId} .dropdown-toggle`);
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function (this: HTMLElement, e) {
        e.preventDefault();
        const parent = this.parentElement;
        if (!parent) return;
        parent.classList.toggle('show');
        const menu = parent.querySelector('.dropdown-menu');
        if (menu) menu.classList.toggle('show');
      });
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      dropdownToggles.forEach(toggle => {
        const parent = (toggle as HTMLElement).parentElement;
        if (!parent) return;
        if (!parent.contains(e.target as Node)) {
          parent.classList.remove('show');
          const menu = parent.querySelector('.dropdown-menu');
          if (menu) menu.classList.remove('show');
        }
      });
    });
  }
}

export default Navbar;

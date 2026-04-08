import { describe, it, expect } from '@jest/globals';
import * as html from './index.js';

describe('html barrel exports', () => {
  it('exports Navbar', () => {
    expect(html.Navbar).toBeDefined();
  });
  it('exports NavItem', () => {
    expect(html.NavItem).toBeDefined();
  });
  it('exports DropdownMenu', () => {
    expect(html.DropdownMenu).toBeDefined();
  });
  it('exports SearchForm', () => {
    expect(html.SearchForm).toBeDefined();
  });
});

import { describe, it, expect } from '@jest/globals';
import SearchForm from './SearchForm.js';

describe('SearchForm', () => {
  it('constructs with required param', () => {
    const form = new SearchForm({ placeholder: 'Search...' });
    expect(form.placeholder).toBe('Search...');
    expect(form.isFunctional).toBe(false);
  });

  it('constructs with isFunctional true', () => {
    const form = new SearchForm({ placeholder: 'Search...', isFunctional: true });
    expect(form.isFunctional).toBe(true);
  });

  it('renders functional form', () => {
    const form = new SearchForm({ placeholder: 'Search...', isFunctional: true });
    const html = form.render();
    expect(html).toContain('form-inline');
    expect(html).toContain('onsubmit="return false;"');
    expect(html).not.toContain('disabled');
  });

  it('renders non-functional form', () => {
    const form = new SearchForm({ placeholder: 'Search...' });
    const html = form.render();
    expect(html).toContain('form-inline');
    expect(html).toContain('disabled');
    expect(html).not.toContain('onsubmit="return false;"');
  });

  it('renders with correct placeholder', () => {
    const form = new SearchForm({ placeholder: 'Buscar...' });
    const html = form.render();
    expect(html).toContain('placeholder="Buscar..."');
  });
});

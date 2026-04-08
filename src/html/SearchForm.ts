/**
 * @fileoverview SearchForm Component - Search form for navigation bar.
 * @module html/SearchForm
 * @since 0.11.0
 */

export interface SearchFormParams {
  placeholder: string;
  isFunctional?: boolean;
}

/**
 * SearchForm component for navigation bar.
 */
class SearchForm {
  placeholder: string;
  isFunctional: boolean;

  constructor(params: SearchFormParams) {
    this.placeholder = params.placeholder;
    this.isFunctional = !!params.isFunctional;
  }

  render(): string {
    return `
<form class="form-inline my-2 my-lg-0" ${this.isFunctional ? 'onsubmit="return false;"' : ''}>
  <input class="form-control mr-sm-2" type="search" placeholder="${this.placeholder}" aria-label="Search">
  <button class="btn btn-outline-success my-2 my-sm-0" type="submit" ${this.isFunctional ? '' : 'disabled'}>Search</button>
</form>
    `.trim();
  }
}

export default SearchForm;

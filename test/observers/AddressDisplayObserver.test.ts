import AddressDisplayObserver from '../../src/observers/AddressDisplayObserver';

describe('AddressDisplayObserver', () => {
	let element: any;
	let displayer: any;

	beforeEach(() => {
		element = { innerHTML: '' };
		displayer = {
			renderAddressHtml: jest.fn((addressData, enderecoPadronizado) => {
				return `<div>${addressData?.street || enderecoPadronizado?.logradouro || 'No address'}</div>`;
			}),
		};
	});

	describe('constructor', () => {
		it('should set element and displayer and freeze the instance', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			expect(observer.element).toBe(element);
			expect(observer.displayer).toBe(displayer);
			expect(Object.isFrozen(observer)).toBe(true);
		});

		it('should throw TypeError if displayer is null', () => {
			expect(() => new AddressDisplayObserver(element, null)).toThrow(TypeError);
		});

		it('should throw TypeError if displayer is undefined', () => {
			expect(() => new AddressDisplayObserver(element, undefined)).toThrow(TypeError);
		});
	});

	describe('update', () => {
		const ADDRESS_FETCHED_EVENT = 'Address fetched';

		it('should log and warn if element is falsy', () => {
			const observer = new AddressDisplayObserver(null, displayer);
			// Should not throw, and element (null) means update returns early
			expect(() => observer.update({}, {}, ADDRESS_FETCHED_EVENT, false, null)).not.toThrow();
		});

		it('should set loading HTML when loading is truthy', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			observer.update({}, {}, ADDRESS_FETCHED_EVENT, true, null);
			expect(element.innerHTML).toBe('<p class="loading">Carregando endereço...</p>');
		});

		it('should set error HTML when error is present', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			const error = { message: '<script>alert("x")</script>' };
			observer.update({}, {}, ADDRESS_FETCHED_EVENT, false, error);
			// escapeHtml converts < > " to HTML entities
			expect(element.innerHTML).toBe('<p class="error">Erro ao carregar endereço: &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>');
		});

		it('should set error HTML when error is truthy (false)', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			observer.update({}, {}, ADDRESS_FETCHED_EVENT, false, false);
			// false is falsy so error branch is skipped; address rendering proceeds
			expect(element.innerHTML).toBe('<div>No address</div>');
		});

		it('should set address HTML when posEvent matches and addressData is present', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			const addressData = { street: 'Rua das Flores' };
			observer.update(addressData, null, ADDRESS_FETCHED_EVENT, false, null);
		 expect(displayer.renderAddressHtml).toHaveBeenCalledWith(addressData, null);
			expect(element.innerHTML).toBe('<div>Rua das Flores</div>');
		});

		it('should set address HTML when posEvent matches and enderecoPadronizado is present', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			const enderecoPadronizado = { logradouro: 'Avenida Brasil' };
			observer.update(null, enderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);
			expect(displayer.renderAddressHtml).toHaveBeenCalledWith(null, enderecoPadronizado);
			expect(element.innerHTML).toBe('<div>Avenida Brasil</div>');
		});

		it('should not set address HTML if posEvent does not match', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			observer.update({ street: 'Rua X' }, null, 'other-event', false, null);
			expect(displayer.renderAddressHtml).not.toHaveBeenCalled();
			expect(element.innerHTML).toBe('');
		});

		it('should not set address HTML if both addressData and enderecoPadronizado are falsy', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			observer.update(null, null, ADDRESS_FETCHED_EVENT, false, null);
			expect(displayer.renderAddressHtml).not.toHaveBeenCalled();
			expect(element.innerHTML).toBe('');
		});
	});

	describe('toString', () => {
		it('should return the class name', () => {
			const observer = new AddressDisplayObserver(element, displayer);
			expect(observer.toString()).toBe('AddressDisplayObserver');
		});
	});
});

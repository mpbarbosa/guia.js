/**
 * Integration Test: locationResult Content Duplication
 *
 * Regression test for bug where #locationResult innerHTML gets appended
 * (duplicated) on every new geoposition + address fetch, instead of being
 * replaced with the latest content.
 *
 * Root cause: HTMLAddressDisplayer.update() uses `+=` instead of `=` when
 * writing the rendered address HTML to the DOM element (line 217 of
 * HTMLAddressDisplayer.ts).
 *
 * @since 0.11.2-alpha
 */

import { ADDRESS_FETCHED_EVENT } from '../../src/config/defaults.js';
import HTMLAddressDisplayer from '../../src/html/HTMLAddressDisplayer.js';

// Node.js environment — no browser DOM
global.document = undefined;

// Minimal mock address objects for two consecutive location updates
const firstAddress = {
	display_name: 'Avenida Paulista, Bela Vista, São Paulo, SP, Brasil',
	address: { road: 'Avenida Paulista', city: 'São Paulo', state: 'São Paulo' },
};

const secondAddress = {
	display_name: 'Praça da Sé, Sé, São Paulo, SP, Brasil',
	address: { place: 'Praça da Sé', city: 'São Paulo', state: 'São Paulo' },
};

describe('locationResult content duplication regression', () => {
	let locationResultEl: { id: string; innerHTML: string };
	let displayer: InstanceType<typeof HTMLAddressDisplayer>;

	beforeEach(() => {
		locationResultEl = { id: 'locationResult', innerHTML: '' };
		displayer = new HTMLAddressDisplayer(locationResultEl);
	});

	test('first address update populates the element', () => {
		displayer.update(firstAddress, null, ADDRESS_FETCHED_EVENT, false, null);

		expect(locationResultEl.innerHTML).toContain('Avenida Paulista');
		expect(locationResultEl.innerHTML.length).toBeGreaterThan(0);
	});

	test('second address update replaces (not appends) the element content', () => {
		displayer.update(firstAddress, null, ADDRESS_FETCHED_EVENT, false, null);
		displayer.update(secondAddress, null, ADDRESS_FETCHED_EVENT, false, null);

		// Only the second address should be present
		expect(locationResultEl.innerHTML).toContain('Praça da Sé');

		// The first address must NOT remain in the element (duplication bug)
		expect(locationResultEl.innerHTML).not.toContain('Avenida Paulista');
	});

	test('element content does not grow with repeated updates', () => {
		displayer.update(firstAddress, null, ADDRESS_FETCHED_EVENT, false, null);
		const lengthAfterFirst = locationResultEl.innerHTML.length;

		displayer.update(secondAddress, null, ADDRESS_FETCHED_EVENT, false, null);
		const lengthAfterSecond = locationResultEl.innerHTML.length;

		// Content length after second update should be comparable to first,
		// not double (which would indicate duplication).
		expect(lengthAfterSecond).toBeLessThanOrEqual(lengthAfterFirst * 1.5);
	});

	test('three consecutive updates leave only the latest address', () => {
		const thirdAddress = {
			display_name: 'Rua das Flores, Centro, Curitiba, PR, Brasil',
			address: { road: 'Rua das Flores', city: 'Curitiba', state: 'Paraná' },
		};

		displayer.update(firstAddress,  null, ADDRESS_FETCHED_EVENT, false, null);
		displayer.update(secondAddress, null, ADDRESS_FETCHED_EVENT, false, null);
		displayer.update(thirdAddress,  null, ADDRESS_FETCHED_EVENT, false, null);

		expect(locationResultEl.innerHTML).toContain('Curitiba');
		expect(locationResultEl.innerHTML).not.toContain('Avenida Paulista');
		expect(locationResultEl.innerHTML).not.toContain('Praça da Sé');
	});
});

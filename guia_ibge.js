function renderUrlUFNome(nomeUF, idUF) {
	return `<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/${idUF}">${nomeUF}</a>`;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		renderUrlUFNome
	};
}

describe('CRUD de Produtos (admin)', () => {
  beforeEach(() => {
    localStorage.clear();
    cy.login('admin@exemplo.com', 'admin123');
    cy.visit('/products');
  });

  it('deve exibir a lista de produtos', () => {
    cy.contains('Produtos').should('exist');
    cy.get('[data-cy="btn-new-product"]').should('exist');
  });

  it('deve criar um novo produto', () => {
    const name = `Produto Cypress ${Date.now()}`;
    cy.get('[data-cy="btn-new-product"]').click();
    cy.get('[data-cy="product-form"]').should('exist');
    cy.get('[data-cy="product-name-input"]').type(name);
    cy.get('[data-cy="product-desc-input"]').type('Descrição criada pelo Cypress');
    cy.get('[data-cy="product-price-input"]').type('149.90');
    cy.get('[data-cy="product-stock-input"]').type('20');
    cy.get('[data-cy="product-save-btn"]').click();
    cy.contains('criado com sucesso').should('exist');
    cy.contains(name).should('exist');
  });

  it('deve editar um produto existente', () => {
    cy.get('[data-cy="product-row"]').first().within(() => {
      cy.get('[data-cy="btn-edit-product"]').click();
    });
    cy.get('[data-cy="product-form"]').should('exist');
    cy.get('[data-cy="product-name-input"]').clear().type('Produto Editado Cypress');
    cy.get('[data-cy="product-save-btn"]').click();
    cy.contains('atualizado com sucesso').should('exist');
    cy.contains('Produto Editado Cypress').should('exist');
  });

  it('deve buscar produtos pelo nome', () => {
    cy.intercept('GET', '/api/products*').as('searchProducts');
    cy.get('[data-cy="search-input"]').clear().type('Mouse');
    cy.contains('Buscar').click();
    cy.wait('@searchProducts');
    cy.get('[data-cy="product-row"]').should('have.length.greaterThan', 0);
  });

  it('deve excluir um produto', () => {
    const name = `Para Deletar ${Date.now()}`;
    cy.get('[data-cy="btn-new-product"]').click();
    cy.get('[data-cy="product-name-input"]').type(name);
    cy.get('[data-cy="product-price-input"]').type('1.00');
    cy.get('[data-cy="product-save-btn"]').click();
    cy.contains('criado com sucesso').should('exist');

    cy.contains('[data-cy="product-row"]', name).within(() => {
      cy.get('[data-cy="btn-delete-product"]').click();
    });
    cy.on('window:confirm', () => true);
    cy.contains('excluído com sucesso').should('exist');
  });
});

describe('Produtos (usuário comum)', () => {
  beforeEach(() => {
    localStorage.clear();
    cy.login('usuario@exemplo.com', 'user123');
    cy.visit('/products');
  });

  it('não deve exibir botões de criação/edição/exclusão', () => {
    cy.get('[data-cy="btn-new-product"]').should('not.exist');
    cy.get('[data-cy="btn-edit-product"]').should('not.exist');
    cy.get('[data-cy="btn-delete-product"]').should('not.exist');
  });

  it('deve exibir a lista de produtos somente leitura', () => {
    cy.contains('Produtos').should('exist');
    cy.get('[data-cy="product-row"]').should('have.length.greaterThan', 0);
  });
});
describe('Autenticação', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Tela de Login', () => {
    it('deve exibir o formulário de login', () => {
      cy.visit('/login');
      cy.get('[data-cy="login-form"]').should('exist');
      cy.get('[data-cy="email-input"]').should('exist');
      cy.get('[data-cy="password-input"]').should('exist');
      cy.get('[data-cy="submit-btn"]').should('exist');
    });

    it('deve fazer login com credenciais válidas', () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('usuario@exemplo.com');
      cy.get('[data-cy="password-input"]').type('user123');
      cy.get('[data-cy="submit-btn"]').click();
      cy.url().should('include', '/dashboard');
      cy.contains('Bem-vindo').should('exist');
    });

    it('deve exibir erro com credenciais inválidas', () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('invalido@teste.com');
      cy.get('[data-cy="password-input"]').type('senhaerrada');
      cy.get('[data-cy="submit-btn"]').click();
      cy.contains('Credenciais inválidas').should('exist');
    });

    it('deve redirecionar para dashboard se já logado', () => {
      cy.login('usuario@exemplo.com', 'user123');
      cy.visit('/login');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Tela de Registro', () => {
    it('deve exibir o formulário de registro', () => {
      cy.visit('/register');
      cy.get('[data-cy="register-form"]').should('exist');
      cy.get('[data-cy="name-input"]').should('exist');
    });

    it('deve registrar um novo usuário', () => {
      const email = `user${Date.now()}@teste.com`;
      cy.visit('/register');
      cy.get('[data-cy="name-input"]').type('Novo Usuário');
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type('senha123');
      cy.get('[data-cy="confirm-input"]').type('senha123');
      cy.get('[data-cy="submit-btn"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('deve exibir erro se senhas não coincidem', () => {
      cy.visit('/register');
      cy.get('[data-cy="name-input"]').type('Teste');
      cy.get('[data-cy="email-input"]').type('teste@email.com');
      cy.get('[data-cy="password-input"]').type('senha123');
      cy.get('[data-cy="confirm-input"]').type('senhadiferente');
      cy.get('[data-cy="submit-btn"]').click();
      cy.contains('senhas não coincidem').should('exist');
    });
  });

  describe('Proteção de rotas', () => {
    it('deve redirecionar para login quando não autenticado', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('deve fazer logout corretamente', () => {
      cy.loginUI('usuario@exemplo.com', 'user123');
      cy.contains('Sair').click();
      cy.url().should('include', '/login');
    });
  });
});
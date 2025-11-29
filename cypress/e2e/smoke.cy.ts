describe('ERP Shell - Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the homepage', () => {
    cy.get('h2').contains('Welcome to ERP Shell').should('be.visible');
  });

  it('toggles primary sidebar', () => {
    cy.get('[data-testid="primary-sidebar"]').should('be.visible');
    cy.get('[data-testid="toggle-sidebar-btn"]').click();
    cy.get('[data-testid="primary-sidebar"]').should('not.be.visible');
  });

  it('displays menu items', () => {
    cy.get('[data-testid="nav-dashboard"]').should('be.visible');
    cy.get('[data-testid="nav-crm"]').should('be.visible');
    cy.get('[data-testid="nav-settings"]').should('be.visible');
  });

  it('has accessible dark mode toggle', () => {
    cy.get('button[aria-label="Toggle dark mode"]').should('exist');
  });

  it('renders footer with links', () => {
    cy.get('footer').should('be.visible');
    cy.get('footer a').should('have.length.greaterThan', 0);
  });
});

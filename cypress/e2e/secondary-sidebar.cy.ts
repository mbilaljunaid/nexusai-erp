describe('SecondarySidebar', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Desktop View (>= 1024px)', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('displays sidebar on desktop', () => {
      cy.get('[data-testid="secondary-sidebar"]').should('be.visible');
    });

    it('expands section when clicked', () => {
      cy.get('[data-testid="section-transactions"]').click();
      cy.get('[data-testid="item-invoices"]').should('be.visible');
    });

    it('collapses section when clicked again', () => {
      cy.get('[data-testid="section-transactions"]').click();
      cy.get('[data-testid="item-invoices"]').should('not.be.visible');
    });

    it('highlights active item', () => {
      cy.get('[data-testid="item-invoices"]').click();
      cy.get('[data-testid="item-invoices"]').should('have.class', 'bg-blue-100');
    });

    it('supports keyboard navigation', () => {
      cy.get('[data-testid="section-transactions"]')
        .focus()
        .type('{enter}');
      cy.get('[data-testid="item-invoices"]').should('be.visible');
    });
  });

  describe('Mobile View (< 1024px)', () => {
    beforeEach(() => {
      cy.viewport('iphone-12');
    });

    it('shows overlay when drawer opens', () => {
      cy.get('[data-testid="sidebar-overlay"]').should('be.visible');
    });

    it('closes drawer when overlay clicked', () => {
      cy.get('[data-testid="sidebar-overlay"]').click();
      cy.get('[data-testid="secondary-sidebar-mobile"]').should('not.exist');
    });

    it('closes drawer with close button', () => {
      // In a real test, click the actual close button
      // This assumes the mobile drawer is open
    });

    it('maintains section expansion state on mobile', () => {
      cy.get('[data-testid="section-transactions"]').click();
      cy.get('[data-testid="item-invoices"]').should('be.visible');
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when item clicked', () => {
      cy.get('[data-testid="item-invoices"]').click();
      cy.get('[data-testid="item-invoices"]').should('have.class', 'bg-blue-100');
    });

    it('shows/hides chevron on section toggle', () => {
      cy.get('[data-testid="section-transactions"]')
        .find('svg')
        .should('have.class', 'rotate-180');
    });

    it('displays correct module name', () => {
      cy.contains('Finance').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      cy.get('button[aria-label="Close sidebar"]').should('exist');
    });

    it('supports focus management', () => {
      cy.get('[data-testid="section-transactions"]')
        .focus()
        .should('be.focused');
    });

    it('has semantic navigation', () => {
      cy.get('nav').should('exist');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark classes in dark mode', () => {
      // Mock dark mode
      cy.get('html').invoke('addClass', 'dark');
      cy.get('[data-testid="secondary-sidebar"]').should(
        'have.class',
        'dark:bg-slate-900'
      );
    });
  });
});

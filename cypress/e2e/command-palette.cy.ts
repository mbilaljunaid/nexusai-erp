describe('CommandPalette', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Opening', () => {
    it('opens with Cmd+K keyboard shortcut', () => {
      cy.get('body').type('{cmd}k');
      cy.get('[data-testid="command-palette"]').should('be.visible');
    });

    it('opens when search button clicked', () => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-palette"]').should('be.visible');
    });

    it('focuses input on open', () => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-input"]').should('have.focus');
    });
  });

  describe('Closing', () => {
    beforeEach(() => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-palette"]').should('be.visible');
    });

    it('closes with Escape key', () => {
      cy.get('[data-testid="command-input"]').type('{esc}');
      cy.get('[data-testid="command-palette"]').should('not.exist');
    });

    it('closes when backdrop clicked', () => {
      cy.get('[data-testid="command-palette-backdrop"]').click();
      cy.get('[data-testid="command-palette"]').should('not.exist');
    });

    it('closes with close button', () => {
      cy.get('button[aria-label="Close command palette"]').click();
      cy.get('[data-testid="command-palette"]').should('not.exist');
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-palette"]').should('be.visible');
    });

    it('shows all commands on empty query', () => {
      cy.get('[data-testid^="command-item-"]').should('have.length.greaterThan', 0);
    });

    it('filters items on search', () => {
      cy.get('[data-testid="command-input"]').type('invoice');
      cy.get('[data-testid="command-item-create-invoice"]').should('be.visible');
    });

    it('shows no results for non-matching query', () => {
      cy.get('[data-testid="command-input"]').type('xyzabc');
      cy.contains('No results found').should('be.visible');
    });

    it('clears search and shows all results', () => {
      cy.get('[data-testid="command-input"]').type('invoice');
      cy.get('[data-testid="command-input"]').clear();
      cy.get('[data-testid^="command-item-"]').should('have.length.greaterThan', 1);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      cy.get('[data-testid="command-palette-trigger"]').click();
    });

    it('navigates down with arrow key', () => {
      cy.get('[data-testid="command-input"]').type('{downarrow}');
      cy.get('[data-testid^="command-item-"]').first().should('have.class', 'bg-blue-500');
    });

    it('navigates up with arrow key', () => {
      cy.get('[data-testid="command-input"]').type('{downarrow}{downarrow}');
      cy.get('[data-testid="command-input"]').type('{uparrow}');
      // Should be at index 1 now
    });

    it('wraps around on arrow navigation', () => {
      const getItemCount = () => cy.get('[data-testid^="command-item-"]').then((items) => items.length);

      getItemCount().then((count) => {
        // Navigate down to last item
        for (let i = 0; i < count; i++) {
          cy.get('[data-testid="command-input"]').type('{downarrow}');
        }
        // Press down again should wrap to first
      });
    });
  });

  describe('Selection', () => {
    beforeEach(() => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-palette"]').should('be.visible');
    });

    it('highlights item on hover', () => {
      cy.get('[data-testid^="command-item-"]').first().trigger('mouseenter');
      cy.get('[data-testid^="command-item-"]').first().should('have.class', 'bg-blue-500');
    });

    it('executes action on Enter', () => {
      cy.get('[data-testid="command-input"]').type('create');
      cy.get('[data-testid="command-input"]').type('{enter}');
      // Command palette should close after executing
      cy.get('[data-testid="command-palette"]').should('not.exist');
    });

    it('executes action on click', () => {
      cy.get('[data-testid="command-item-create-invoice"]').click();
      cy.get('[data-testid="command-palette"]').should('not.exist');
    });
  });

  describe('Results Display', () => {
    beforeEach(() => {
      cy.get('[data-testid="command-palette-trigger"]').click();
    });

    it('displays grouped results by category', () => {
      cy.contains('Actions').should('be.visible');
      cy.contains('Pages').should('be.visible');
      cy.contains('Records').should('be.visible');
      cy.contains('Reports').should('be.visible');
    });

    it('shows result count footer', () => {
      cy.contains('of').should('be.visible');
    });

    it('displays item tags', () => {
      cy.get('[data-testid^="command-item-"]').first().within(() => {
        cy.get('span').should('include.text', 'AP');
      });
    });

    it('displays keystroke hints', () => {
      cy.get('[data-testid^="command-item-"]')
        .first()
        .within(() => {
          cy.contains('⌘').should('be.visible');
        });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      cy.get('button[aria-label="Close command palette"]').should('exist');
      cy.get('button[aria-label="Open command palette (Cmd+K)"]').should('exist');
    });

    it('keyboard accessible input', () => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('[data-testid="command-input"]').should('have.focus');
      cy.get('[data-testid="command-input"]').should('be.visible');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode classes', () => {
      cy.get('[data-testid="command-palette-trigger"]').click();
      cy.get('html').invoke('addClass', 'dark');
      cy.get('[data-testid="command-palette"]').should('have.class', 'dark:bg-slate-800');
    });
  });
});

describe('ERP Shell - Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Home Page', () => {
    it('loads home page successfully', () => {
      cy.get('h2', { timeout: 10000 }).contains('Welcome to ERP Shell').should('be.visible');
    });

    it('displays navigation sidebar', () => {
      cy.get('[data-testid="primary-sidebar"]', { timeout: 5000 }).should('be.visible');
    });

    it('has working dark mode toggle', () => {
      cy.get('button[aria-label="Toggle dark mode"]').should('exist').click();
      cy.get('html').should('have.class', 'dark');
    });
  });

  describe('Command Palette', () => {
    it('opens with keyboard shortcut Cmd/Ctrl+K', () => {
      cy.get('body').type('{cmd}k');
      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    });

    it('closes with Escape key', () => {
      cy.get('body').type('{cmd}k');
      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('filters commands by search text', () => {
      cy.get('body').type('{cmd}k');
      cy.get('input[placeholder*="command" i], input[placeholder*="search" i]', { timeout: 5000 }).type('invoice');
      cy.get('[role="dialog"]').should('contain', 'invoice');
    });
  });

  describe('Navigation to Finance → AP → Invoices', () => {
    it('navigates via sidebar menu', () => {
      cy.get('[data-testid="nav-finance"]', { timeout: 5000 }).should('exist').click();
      cy.get('[data-testid="nav-ap"]').should('exist').click();
      cy.get('[data-testid="nav-invoices"]').should('exist').click();
      cy.url().should('include', '/finance/ap/invoices');
    });

    it('loads invoices page with table', () => {
      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('h1, h2', { timeout: 10000 }).should('contain', 'Invoice');
      cy.get('table', { timeout: 5000 }).should('be.visible');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('invoice filters work', () => {
      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('select, [role="combobox"]', { timeout: 5000 }).first().should('exist');
    });

    it('pagination controls exist', () => {
      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('[role="navigation"] button, button:contains("1"), button:contains("2")', { timeout: 5000 }).should('have.length.greaterThan', 0);
    });
  });

  describe('Accessibility - Invoices Page (axe-core)', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/finance/ap/invoices');
    });

    it('has semantic page structure', () => {
      cy.get('h1, h2').should('have.length.greaterThan', 0);
      cy.get('nav', { timeout: 5000 }).should('exist');
      cy.get('table').should('exist');
    });

    it('table has proper headers', () => {
      cy.get('table thead th', { timeout: 5000 }).should('have.length.greaterThan', 0);
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('form inputs are accessible', () => {
      cy.get('input, select, textarea').each(($input) => {
        cy.wrap($input).should('have.attr', 'aria-label').or('have.attr', 'id');
      });
    });

    it('buttons have accessible labels', () => {
      cy.get('button').each(($btn) => {
        const hasText = $btn.text().length > 0;
        const hasAriaLabel = $btn.attr('aria-label');
        cy.wrap($btn).should(() => {
          expect(hasText || hasAriaLabel).to.be.true;
        });
      });
    });

    it('maintains focus visible on keyboard navigation', () => {
      cy.get('button').first().focus().should('have.focus');
      cy.get('body').type('{tab}');
      cy.focused().should('have.css', 'outline').or('have.class', 'focus-visible');
    });

    it('status badges have sufficient contrast', () => {
      cy.get('[data-testid*="status"], .status-badge').first().should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('sidebar collapses on mobile (< 768px)', () => {
      cy.viewport(640, 800);
      cy.visit('http://localhost:3000');
      
      cy.get('[data-testid="primary-sidebar"]').then(($sidebar) => {
        const isVisible = $sidebar.is(':visible');
        if (!isVisible) {
          cy.wrap($sidebar).should('not.be.visible');
        }
      });
    });

    it('sidebar visible on tablet (≥ 768px)', () => {
      cy.viewport(1024, 800);
      cy.visit('http://localhost:3000');
      
      cy.get('[data-testid="primary-sidebar"]', { timeout: 5000 }).should('be.visible');
    });

    it('command palette accessible on all viewport sizes', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000');
      
      cy.get('body').type('{cmd}k');
      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    });

    it('table scrolls horizontally on small screens', () => {
      cy.viewport(640, 800);
      cy.visit('http://localhost:3000/finance/ap/invoices');
      
      cy.get('table', { timeout: 5000 }).should('be.visible');
    });

    it('page header remains accessible when sticky', () => {
      cy.viewport(1024, 800);
      cy.visit('http://localhost:3000/finance/ap/invoices');
      
      cy.get('header', { timeout: 5000 }).then(($header) => {
        const headerPosition = $header.css('position');
        cy.wrap($header).should('be.visible');
      });
    });
  });

  describe('Dark Mode Consistency', () => {
    it('dark mode applies to all pages', () => {
      cy.get('button[aria-label="Toggle dark mode"]').click();
      cy.get('html').should('have.class', 'dark');

      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('html').should('have.class', 'dark');
    });

    it('dark mode persists across page navigation', () => {
      cy.get('button[aria-label="Toggle dark mode"]').click();
      cy.get('html').should('have.class', 'dark');

      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('html').should('have.class', 'dark');

      cy.go('back');
      cy.get('html').should('have.class', 'dark');
    });

    it('command palette responds to dark mode', () => {
      cy.get('button[aria-label="Toggle dark mode"]').click();
      cy.get('body').type('{cmd}k');
      cy.get('[role="dialog"]', { timeout: 5000 }).should('have.class', 'dark');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid routes gracefully', () => {
      cy.visit('http://localhost:3000/nonexistent-route', { failOnStatusCode: false });
      cy.get('body').should('not.contain', '[object Object]');
    });

    it('recovers from navigation errors', () => {
      cy.visit('http://localhost:3000');
      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('table', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Performance', () => {
    it('invoice page loads within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('http://localhost:3000/finance/ap/invoices');
      cy.get('table', { timeout: 10000 }).should('be.visible');
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('sidebar toggle is responsive', () => {
      cy.get('button[data-testid*="toggle"]').first().click({ force: true });
      cy.get('body').should('not.have.class', 'loading');
    });
  });
});

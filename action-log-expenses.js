// Action 3: Log Recruiting Expenses
// Expense tracking with dynamic form generation and running total

const ExpenseTracker = {
  expenses: [],
  nextId: 1,

  init() {
    this.expensesContainer = document.getElementById('expensesContainer');
    this.emptyState = document.getElementById('emptyState');
    this.totalAmount = document.getElementById('totalAmount');
    this.expenseCount = document.getElementById('expenseCount');
    this.addButton = document.getElementById('addExpenseButton');
    this.completeButton = document.getElementById('completeButton');
    
    this.attachEventListeners();
    this.loadSavedData();
    
    // Add first expense if none exist
    if (this.expenses.length === 0) {
      this.addExpense();
    } else {
      this.updateUI();
    }
  },

  attachEventListeners() {
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.addExpense());
    }

    if (this.completeButton) {
      this.completeButton.addEventListener('click', () => this.handleComplete());
    }
  },

  addExpense() {
    const expense = {
      id: this.nextId++,
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      notes: ''
    };

    this.expenses.push(expense);
    this.renderExpense(expense);
    this.updateUI();
    this.saveData();
  },

  renderExpense(expense) {
    const expenseCard = document.createElement('div');
    expenseCard.className = 'expense-card';
    expenseCard.dataset.expenseId = expense.id;

    expenseCard.innerHTML = `
      <div class="expense-header">
        <span class="expense-number">Expense #${this.expenses.indexOf(expense) + 1}</span>
        ${this.expenses.length > 1 ? `
          <button type="button" class="remove-expense" onclick="ExpenseTracker.removeExpense(${expense.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : ''}
      </div>
      
      <div class="expense-fields">
        <div class="expense-field">
          <label class="expense-label">Category</label>
          <select 
            class="expense-select" 
            data-field="category"
            onchange="ExpenseTracker.updateExpenseField(${expense.id}, 'category', this.value)"
          >
            <option value="">Select category</option>
            <option value="showcase" ${expense.category === 'showcase' ? 'selected' : ''}>Showcase</option>
            <option value="camp" ${expense.category === 'camp' ? 'selected' : ''}>Camp</option>
            <option value="travel" ${expense.category === 'travel' ? 'selected' : ''}>Travel</option>
            <option value="equipment" ${expense.category === 'equipment' ? 'selected' : ''}>Equipment</option>
            <option value="training" ${expense.category === 'training' ? 'selected' : ''}>Private Training</option>
            <option value="other" ${expense.category === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <div class="expense-field">
          <label class="expense-label">Amount</label>
          <input 
            type="number" 
            class="expense-input" 
            placeholder="0.00"
            step="0.01"
            min="0"
            value="${expense.amount}"
            data-field="amount"
            oninput="ExpenseTracker.updateExpenseField(${expense.id}, 'amount', this.value)"
          >
        </div>

        <div class="expense-field">
          <label class="expense-label">Date</label>
          <input 
            type="date" 
            class="expense-input"
            value="${expense.date}"
            data-field="date"
            onchange="ExpenseTracker.updateExpenseField(${expense.id}, 'date', this.value)"
          >
        </div>

        <div class="expense-field field-full-width">
          <label class="expense-label">Notes (Optional)</label>
          <textarea 
            class="expense-textarea"
            placeholder="E.g., Perfect Game showcase in Atlanta"
            data-field="notes"
            oninput="ExpenseTracker.updateExpenseField(${expense.id}, 'notes', this.value)"
          >${expense.notes}</textarea>
        </div>
      </div>
    `;

    this.expensesContainer.appendChild(expenseCard);
  },

  updateExpenseField(expenseId, field, value) {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) {
      expense[field] = value;
      this.updateUI();
      this.saveData();
    }
  },

  removeExpense(expenseId) {
    this.expenses = this.expenses.filter(e => e.id !== expenseId);
    
    // Re-render all expenses to update numbering
    this.expensesContainer.innerHTML = '';
    this.expenses.forEach(expense => this.renderExpense(expense));
    
    this.updateUI();
    this.saveData();
  },

  calculateTotal() {
    return this.expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return total + amount;
    }, 0);
  },

  updateUI() {
    // Update total
    const total = this.calculateTotal();
    this.totalAmount.textContent = `$${total.toFixed(2)}`;

    // Update count
    this.expenseCount.textContent = this.expenses.length;

    // Show/hide empty state
    if (this.expenses.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.expensesContainer.style.display = 'none';
    } else {
      this.emptyState.classList.add('hidden');
      this.expensesContainer.style.display = 'flex';
    }

    // Enable/disable complete button
    const hasValidExpense = this.expenses.some(e => 
      e.category && e.amount && parseFloat(e.amount) > 0
    );
    this.completeButton.disabled = !hasValidExpense;
  },

  saveData() {
    localStorage.setItem('action3_expenses', JSON.stringify(this.expenses));
  },

  loadSavedData() {
    const saved = localStorage.getItem('action3_expenses');
    if (saved) {
      this.expenses = JSON.parse(saved);
      
      // Update nextId to be higher than any existing ID
      if (this.expenses.length > 0) {
        this.nextId = Math.max(...this.expenses.map(e => e.id)) + 1;
      }
    }
  },

  handleComplete() {
    const hasValidExpense = this.expenses.some(e => 
      e.category && e.amount && parseFloat(e.amount) > 0
    );

    if (!hasValidExpense) {
      alert('Please add at least one complete expense (category and amount required).');
      return;
    }

    // Mark action as complete
    this.markActionComplete();
    
    // Redirect with success parameter
    window.location.href = 'weekly-plan.html?action=3&completed=true';
  },

  markActionComplete() {
    const planState = JSON.parse(localStorage.getItem('weeklyPlanState') || '{}');
    
    if (!planState.actions) {
      planState.actions = [
        { id: 1, completed: false },
        { id: 2, completed: false },
        { id: 3, completed: false }
      ];
    }

    const action = planState.actions.find(a => a.id === 3);
    if (action) {
      action.completed = true;
      action.completedAt = new Date().toISOString();
    }

    localStorage.setItem('weeklyPlanState', JSON.stringify(planState));
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ExpenseTracker.init());
} else {
  ExpenseTracker.init();
}

// Make ExpenseTracker available globally for onclick handlers
window.ExpenseTracker = ExpenseTracker;

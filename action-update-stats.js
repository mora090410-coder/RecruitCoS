// Action 1: Update Athlete Stats
// Form handling and state management

const StatsForm = {
  init() {
    this.form = document.getElementById('statsForm');
    this.attachEventListeners();
    this.loadSavedData();
  },

  attachEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Auto-save on input change
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => this.autoSave());
    });
  },

  handleSubmit(e) {
    e.preventDefault();

    const formData = this.getFormData();

    // Validate at least one field is filled
    if (!this.validateForm(formData)) {
      alert('Please enter at least one stat to continue.');
      return;
    }

    // Save to localStorage
    this.saveFormData(formData);

    // Mark action as complete
    this.markActionComplete();

    // Redirect with success parameter
    window.location.href = 'weekly-plan.html?action=1&completed=true';
  },

  getFormData() {
    return {
      dashTime: document.getElementById('dashTime')?.value || '',
      verticalJump: document.getElementById('verticalJump')?.value || '',
      recentStats: document.getElementById('recentStats')?.value || '',
      completedAt: new Date().toISOString()
    };
  },

  validateForm(data) {
    return data.dashTime || data.verticalJump || data.recentStats;
  },

  saveFormData(data) {
    localStorage.setItem('action1_stats', JSON.stringify(data));
    console.log('Stats saved:', data);
  },

  loadSavedData() {
    const saved = localStorage.getItem('action1_stats');
    if (saved) {
      const data = JSON.parse(saved);

      if (data.dashTime) {
        document.getElementById('dashTime').value = data.dashTime;
      }
      if (data.verticalJump) {
        document.getElementById('verticalJump').value = data.verticalJump;
      }
      if (data.recentStats) {
        document.getElementById('recentStats').value = data.recentStats;
      }
    }
  },

  autoSave() {
    const formData = this.getFormData();
    localStorage.setItem('action1_stats_draft', JSON.stringify(formData));
    console.log('Auto-saved draft');
  },

  markActionComplete() {
    // Update weekly plan state
    const planState = JSON.parse(localStorage.getItem('weeklyPlanState') || '{}');

    if (!planState.actions) {
      planState.actions = [
        { id: 1, completed: false },
        { id: 2, completed: false },
        { id: 3, completed: false }
      ];
    }

    const action = planState.actions.find(a => a.id === 1);
    if (action) {
      action.completed = true;
      action.completedAt = new Date().toISOString();
    }

    localStorage.setItem('weeklyPlanState', JSON.stringify(planState));
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => StatsForm.init());
} else {
  StatsForm.init();
}

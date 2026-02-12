// Action 2: Research Schools
// School search and selection logic

// Sample school database (in production, this would come from your backend)
const SCHOOLS_DATABASE = [
  { id: 1, name: 'Stanford University', location: 'California', division: 'd1', conference: 'Pac-12' },
  { id: 2, name: 'Duke University', location: 'North Carolina', division: 'd1', conference: 'ACC' },
  { id: 3, name: 'Amherst College', location: 'Massachusetts', division: 'd3', conference: 'NESCAC' },
  { id: 4, name: 'Williams College', location: 'Massachusetts', division: 'd3', conference: 'NESCAC' },
  { id: 5, name: 'Grand Valley State', location: 'Michigan', division: 'd2', conference: 'GLIAC' },
  { id: 6, name: 'Azusa Pacific', location: 'California', division: 'naia', conference: 'Golden State' },
  { id: 7, name: 'Iowa Central CC', location: 'Iowa', division: 'juco', conference: 'NJCAA' },
  { id: 8, name: 'UCLA', location: 'California', division: 'd1', conference: 'Big Ten' },
  { id: 9, name: 'Tufts University', location: 'Massachusetts', division: 'd3', conference: 'NESCAC' },
  { id: 10, name: 'Bentley University', location: 'Massachusetts', division: 'd2', conference: 'NE-10' },
  { id: 11, name: 'University of Michigan', location: 'Michigan', division: 'd1', conference: 'Big Ten' },
  { id: 12, name: 'Northwestern University', location: 'Illinois', division: 'd1', conference: 'Big Ten' },
  { id: 13, name: 'Bowdoin College', location: 'Maine', division: 'd3', conference: 'NESCAC' },
  { id: 14, name: 'Saint Leo University', location: 'Florida', division: 'd2', conference: 'SSC' },
  { id: 15, name: 'Embry-Riddle', location: 'Florida', division: 'naia', conference: 'Sun' }
];

const SchoolResearch = {
  selectedSchools: [],
  maxSchools: 3,

  init() {
    this.searchInput = document.getElementById('schoolSearch');
    this.searchResults = document.getElementById('searchResults');
    this.selectedContainer = document.getElementById('selectedSchools');
    this.selectedCount = document.getElementById('selectedCount');
    this.completeButton = document.getElementById('completeButton');

    this.attachEventListeners();
    this.loadSavedData();
    this.updateUI();
  },

  attachEventListeners() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Division filters
    const divisionCheckboxes = document.querySelectorAll('input[name="division"]');
    divisionCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleSearch(this.searchInput.value));
    });

    // Complete button
    if (this.completeButton) {
      this.completeButton.addEventListener('click', () => this.handleComplete());
    }
  },

  handleSearch(query) {
    const selectedDivisions = Array.from(document.querySelectorAll('input[name="division"]:checked'))
      .map(cb => cb.value);

    if (!query && selectedDivisions.length === 0) {
      this.searchResults.style.display = 'none';
      return;
    }

    let results = SCHOOLS_DATABASE;

    // Filter by division
    if (selectedDivisions.length > 0) {
      results = results.filter(school => selectedDivisions.includes(school.division));
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(school =>
        school.name.toLowerCase().includes(lowerQuery) ||
        school.location.toLowerCase().includes(lowerQuery)
      );
    }

    // Exclude already selected schools
    results = results.filter(school =>
      !this.selectedSchools.find(s => s.id === school.id)
    );

    this.displayResults(results);
  },

  displayResults(results) {
    if (results.length === 0) {
      this.searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280;">No schools found</div>';
      this.searchResults.style.display = 'block';
      return;
    }

    const html = results.map(school => `
      <div class="result-item">
        <div class="result-info">
          <div class="result-name">${school.name}</div>
          <div class="result-meta">
            <span class="result-division">${school.division.toUpperCase()}</span>
            ${school.location} • ${school.conference}
          </div>
        </div>
        <button
          class="add-button"
          onclick="SchoolResearch.addSchool(${school.id})"
          ${this.selectedSchools.length >= this.maxSchools ? 'disabled' : ''}
        >
          + Add
        </button>
      </div>
    `).join('');

    this.searchResults.innerHTML = html;
    this.searchResults.style.display = 'block';
  },

  addSchool(schoolId) {
    if (this.selectedSchools.length >= this.maxSchools) {
      alert(`You can only add up to ${this.maxSchools} schools`);
      return;
    }

    const school = SCHOOLS_DATABASE.find(s => s.id === schoolId);
    if (school && !this.selectedSchools.find(s => s.id === schoolId)) {
      this.selectedSchools.push(school);
      this.updateUI();
      this.saveData();

      // Refresh search results to remove the added school
      this.handleSearch(this.searchInput.value);
    }
  },

  removeSchool(schoolId) {
    this.selectedSchools = this.selectedSchools.filter(s => s.id !== schoolId);
    this.updateUI();
    this.saveData();

    // Refresh search results
    this.handleSearch(this.searchInput.value);
  },

  updateUI() {
    // Update count
    this.selectedCount.textContent = this.selectedSchools.length;

    // Update selected schools display
    if (this.selectedSchools.length === 0) {
      this.selectedContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <p class="empty-text">Add up to 3 schools to start researching</p>
          <p class="empty-subtext">Search above and click the + button to add schools</p>
        </div>
      `;
    } else {
      const html = this.selectedSchools.map(school => `
        <div class="school-card">
          <div class="school-info">
            <div class="school-name">${school.name}</div>
            <div class="school-meta">
              <span class="school-division">${school.division.toUpperCase()}</span>
              ${school.location} • ${school.conference}
            </div>
          </div>
          <button class="remove-button" onclick="SchoolResearch.removeSchool(${school.id})">
            Remove
          </button>
        </div>
      `).join('');

      this.selectedContainer.innerHTML = html;
    }

    // Enable/disable complete button
    this.completeButton.disabled = this.selectedSchools.length === 0;
  },

  saveData() {
    localStorage.setItem('action2_schools', JSON.stringify(this.selectedSchools));
  },

  loadSavedData() {
    const saved = localStorage.getItem('action2_schools');
    if (saved) {
      this.selectedSchools = JSON.parse(saved);
    }
  },

  handleComplete() {
    if (this.selectedSchools.length === 0) {
      alert('Please add at least one school before completing.');
      return;
    }

    // Mark action as complete
    this.markActionComplete();

    // Redirect with success parameter
    window.location.href = 'weekly-plan.html?action=2&completed=true';
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

    const action = planState.actions.find(a => a.id === 2);
    if (action) {
      action.completed = true;
      action.completedAt = new Date().toISOString();
    }

    localStorage.setItem('weeklyPlanState', JSON.stringify(planState));
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SchoolResearch.init());
} else {
  SchoolResearch.init();
}

// Make SchoolResearch available globally for onclick handlers
window.SchoolResearch = SchoolResearch;

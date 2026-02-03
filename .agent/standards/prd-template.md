# Product Requirement Document (PRD) Template

> **Enterprise Standard**: This template incorporates Apple (Privacy), Google (Scalability), Meta (Impact), and NVIDIA (Performance) best practices.

---

## Document Metadata
| Field | Value |
|-------|-------|
| **Feature Name** | [Feature Name] |
| **Author** | [Name] |
| **Status** | Draft / In Review / Approved |
| **Created** | [Date] |
| **Last Updated** | [Date] |
| **Reviewers** | [Engineering Lead, Design Lead, Security] |

---

## 1. Objective

### Problem Statement
*What specific problem are we solving? Be measurable, not aspirational.*

**Bad**: "Make the user experience better."
**Good**: "Reduce checkout abandonment rate from 68% to 50% by simplifying the payment flow."

### Hypothesis
*If we [action], then [outcome] because [rationale].*

### Success Definition
*What does "done" look like? How will we know this succeeded?*

---

## 2. Success Metrics (KPIs)

### Primary Metrics
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| North Star | [value] | [value] | [Analytics tool] |
| Primary | [value] | [value] | [Analytics tool] |

### Secondary Metrics
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| [Metric 1] | [value] | [value] | [Analytics tool] |
| [Metric 2] | [value] | [value] | [Analytics tool] |

### Counter Metrics (Guardrails)
*These must NOT degrade as a result of this feature.*
| Metric | Current | Acceptable Range |
|--------|---------|------------------|
| Page Load Time | [value] | ±10% |
| Error Rate | [value] | No increase |
| API Latency p95 | [value] | <500ms |

### A/B Test Plan
- [ ] A/B test required: Yes / No
- [ ] Sample size calculation: [link]
- [ ] Minimum detectable effect: [X]%
- [ ] Test duration: [X] days

---

## 3. User Stories

### Primary Persona
**As a** [user role],
**I want to** [action/capability],
**So that** [benefit/outcome].

### Acceptance Criteria
```gherkin
Given [precondition]
When [action]
Then [expected result]
```

### User Journey
| Step | User Action | System Response | Success Criteria |
|------|-------------|-----------------|------------------|
| 1 | [Action] | [Response] | [Criteria] |
| 2 | [Action] | [Response] | [Criteria] |

### Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Empty State | [Behavior] |
| Error State | [Behavior] |
| Offline Mode | [Behavior] |
| Rate Limited | [Behavior] |

---

## 4. Technical Constraints

### Platform Requirements
| Requirement | Specification |
|-------------|---------------|
| Supported Browsers | Chrome 90+, Safari 15+, Firefox 90+, Edge 90+ |
| Mobile Support | iOS 15+, Android 12+ |
| Screen Sizes | 320px – 2560px responsive |
| Accessibility | WCAG 2.1 AA compliance |

### Dependencies
| Dependency | Version | Owner | Risk |
|------------|---------|-------|------|
| [Service/API] | [version] | [team] | [Low/Med/High] |

### Performance Budget
| Metric | Budget |
|--------|--------|
| Bundle Size (JS) | <200KB gzipped |
| Time to Interactive | <3s on 3G |
| Lighthouse Performance | >90 |
| Core Web Vitals | All "Good" |

---

## 5. Privacy Impact Assessment (Apple Standard)

### Data Collection
| Data Type | Collected | Purpose | Retention |
|-----------|-----------|---------|-----------|
| [Type] | Yes/No | [Purpose] | [Duration] |

### Privacy Checklist
- [ ] **Data Minimization**: Only collecting data essential for feature functionality.
- [ ] **Purpose Limitation**: Data used only for stated purposes.
- [ ] **User Consent**: Explicit consent obtained where required (GDPR, CCPA).
- [ ] **Data Access**: Users can view/export their data.
- [ ] **Data Deletion**: Users can request data deletion.
- [ ] **Encryption**: Data encrypted at rest and in transit.
- [ ] **Third Parties**: No sharing with third parties without consent.

### Privacy-Preserving Alternatives Considered
*What alternatives did we consider to minimize data collection?*

---

## 6. Scalability Requirements (Google Standard)

### Load Projections
| Scenario | Requests/sec | Concurrent Users | Data Volume |
|----------|--------------|------------------|-------------|
| Current | [value] | [value] | [value] |
| 10x Growth | [value] | [value] | [value] |
| Peak Event | [value] | [value] | [value] |

### Infrastructure Checklist
- [ ] **Horizontal Scaling**: Service can scale horizontally.
- [ ] **Database Load**: Query patterns optimized, indexes in place.
- [ ] **Caching Strategy**: Static content cached at CDN edge.
- [ ] **Rate Limiting**: API rate limits configured.
- [ ] **Circuit Breakers**: Graceful degradation on dependency failure.
- [ ] **Queue Processing**: Async tasks for non-critical paths.

### Failure Modes
| Failure | Impact | Mitigation |
|---------|--------|------------|
| Database Down | [Impact] | [Mitigation] |
| Third-Party API Down | [Impact] | [Mitigation] |
| CDN Failure | [Impact] | [Mitigation] |

---

## 7. Security Considerations

### Threat Model
| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| [Threat] | Low/Med/High | Low/Med/High | [Mitigation] |

### Security Checklist
- [ ] Input validation on all user inputs.
- [ ] Output encoding to prevent XSS.
- [ ] Authentication required for sensitive actions.
- [ ] Authorization checks at API layer.
- [ ] Rate limiting to prevent abuse.
- [ ] Audit logging for sensitive operations.

---

## 8. Launch Plan

### Rollout Strategy
| Phase | Traffic % | Duration | Success Criteria |
|-------|-----------|----------|------------------|
| Canary | 1% | 24 hours | No error increase |
| Beta | 10% | 1 week | Metrics stable |
| GA | 100% | Ongoing | Targets met |

### Rollback Plan
*What triggers a rollback? How quickly can we roll back?*

### Communication Plan
| Audience | Channel | Timing |
|----------|---------|--------|
| Internal | Slack | Pre-launch |
| Users | In-app / Email | Launch day |
| Support | KB Article | Pre-launch |

---

## 9. Open Questions

| Question | Owner | Due Date | Status |
|----------|-------|----------|--------|
| [Question] | [Owner] | [Date] | Open / Resolved |

---

## Appendix

### Related Documents
- Design Spec: [link]
- Technical Design: [link]
- Analytics Plan: [link]

### Revision History
| Date | Author | Changes |
|------|--------|---------|
| [Date] | [Author] | Initial draft |

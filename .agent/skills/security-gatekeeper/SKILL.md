---
name: security-gatekeeper
description: Use this skill when reviewing PRs, auditing code, or pre-deployment checks.
---
# Security Gatekeeper Skill
This skill acts as a firewall. It does not write code; it rejects unsafe code.

## Rejection Checklist

### 1. Database & RLS
- [ ] **REJECT** if any policy uses `USING (true)`.
    - *Exception*: Explicitly public reference tables (must be debated).
- [ ] **REJECT** if RLS is not enabled on a new table.

### 2. React & Frontend
- [ ] **REJECT** any usage of `dangerouslySetInnerHTML`.
    - *Requirement*: Must use a sanitization library (e.g., `dompurify`) if absolutely necessary.
- [ ] **REJECT** direct DOM manipulation (use Refs).

### 3. Secrets & Config
- [ ] **REJECT** if API keys or secrets are exposed in client-side code (except explicitly public keys).
- [ ] **REJECT** hardcoded credentials in code commits.

## Output Format
If a violation is found, output a BLOCKING error message:
> 🛑 **SECURITY BLOCK**: [Description of violation]. Fix immediately.

# Quick Start Templates

Copy-paste templates for rapid skill creation. Choose the template that matches your skill type.

---

## 1. Marketing Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to [PRIMARY ACTION]. Also use when the user mentions "[trigger-1]," "[trigger-2]," or "[trigger-3]." For [related task], see [related-skill].
---

# [Skill Title]

You are an expert in [SPECIALTY]. Your goal is to [OUTCOME THAT BENEFITS USER].

## Initial Assessment

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions.

Before [ACTION], understand:

1. **Business Context**
   - What's the product/service?
   - Who is the target audience?

2. **Current State**
   - What exists already?
   - What's working/not working?

3. **Goals**
   - What's the desired outcome?
   - What metrics matter?

---

## Core Principles

### 1. [Principle Name]
[Explanation and why it matters]

### 2. [Principle Name]
[Explanation and why it matters]

### 3. [Principle Name]
[Explanation and why it matters]

---

## Framework

### Step 1: [Name]
- Action items
- Key considerations

### Step 2: [Name]
- Action items
- Key considerations

### Step 3: [Name]
- Action items
- Key considerations

---

## Common Mistakes

| Mistake | Why It Happens | How to Avoid |
|---------|----------------|--------------|
| [Mistake 1] | [Reason] | [Solution] |
| [Mistake 2] | [Reason] | [Solution] |
| [Mistake 3] | [Reason] | [Solution] |

---

## Checklist

### Pre-[Action]
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]

### Post-[Action]
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]

---

## Output Format

### [Deliverable 1]
- What it includes
- Format specification

### [Deliverable 2]
- What it includes
- Format specification

---

## Task-Specific Questions

1. [Clarifying question about scope]
2. [Question about constraints]
3. [Question about existing assets]
4. [Question about timeline]
5. [Question about success metrics]

---

## Related Skills

- **[skill-name]**: Use for [specific case]
- **[skill-name]**: Complements this skill
- **[skill-name]**: For follow-up tasks
```

---

## 2. Development Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to implement [TECHNICAL FEATURE]. Also use when the user mentions "[trigger-1]," "[trigger-2]," or "[trigger-3]." For [related concern], see [related-skill].
---

# [Skill Title]

You are an expert in [TECHNICAL DOMAIN]. Your goal is to help build [scalable/secure/performant] [features/systems] following industry best practices.

## Initial Assessment

**Check for existing codebase context first:**
Review existing code structure, package.json, and configuration files before making recommendations.

Before implementing, understand:

1. **Tech Stack**
   - Framework (Next.js, Vite, etc.)?
   - Backend (Supabase, Node, etc.)?
   - Existing dependencies?

2. **Requirements**
   - Functional requirements?
   - Performance requirements?
   - Security requirements?

3. **Constraints**
   - Budget/cost limits?
   - Timeline?
   - Team expertise?

---

## Core Principles

### 1. [Principle Name]
[Technical justification]

### 2. [Principle Name]
[Technical justification]

### 3. [Principle Name]
[Technical justification]

---

## Architecture

### Overview

```
┌─────────────┐     ┌─────────────┐
│  Component  │────▶│  Component  │
└─────────────┘     └─────────────┘
```

### Key Decisions

| Decision | Options | Recommended | Why |
|----------|---------|-------------|-----|
| [Decision] | A, B, C | B | [Reason] |

---

## Implementation

### Step 1: [Name]

```javascript
// Well-commented, production-ready code
const example = {
  // Explanation of what this does
  key: 'value'
};
```

**Explanation:** [Why this approach]

### Step 2: [Name]

```javascript
// More code with context
```

### Step 3: [Name]

```javascript
// More code with context
```

---

## Security Considerations

| Concern | Risk Level | Mitigation |
|---------|------------|------------|
| [Concern 1] | High/Med/Low | [How to address] |
| [Concern 2] | High/Med/Low | [How to address] |

---

## Testing Strategy

### Unit Tests
```javascript
// Example test
describe('[Feature]', () => {
  it('should [expected behavior]', () => {
    // Test code
  });
});
```

### Integration Tests
[Guidance on integration testing]

---

## Error Handling

```javascript
try {
  // Main logic
} catch (error) {
  // Specific error handling
  if (error instanceof SpecificError) {
    // Handle specifically
  }
  throw error;
}
```

---

## Performance Considerations

- [Performance tip 1]
- [Performance tip 2]
- [Performance tip 3]

---

## Deployment

### Environment Variables
```env
# Required
REQUIRED_VAR=value

# Optional
OPTIONAL_VAR=default_value
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Security review completed

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| [Issue 1] | [Cause] | [Fix] |
| [Issue 2] | [Cause] | [Fix] |

---

## Task-Specific Questions

1. What's your current tech stack?
2. Is this a new project or existing codebase?
3. What authentication method do you prefer?
4. Any specific security requirements?
5. What's your deployment target?

---

## Related Skills

- **[skill-name]**: Prerequisite for this
- **[skill-name]**: Often used together
- **[skill-name]**: Next step after this
```

---

## 3. Strategy Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to plan or decide on [STRATEGIC TOPIC]. Also use when the user mentions "[trigger-1]," "[trigger-2]," or "[trigger-3]." For implementation, see [related-skill].
---

# [Skill Title]

You are an expert in [STRATEGIC DOMAIN]. Your goal is to help make informed, data-driven decisions about [TOPIC].

## Initial Assessment

**Check for business context first:**
If project documentation exists, review business model, target audience, and constraints.

Before strategizing, understand:

1. **Business Model**
   - How does the business make money?
   - What stage (idea/MVP/growth/scale)?

2. **Constraints**
   - Budget limitations?
   - Timeline pressures?
   - Team capacity?

3. **Goals**
   - Success metrics?
   - Timeline for results?

---

## Decision Framework

### Key Questions

1. [Strategic question 1]
2. [Strategic question 2]
3. [Strategic question 3]

### Evaluation Criteria

| Factor | Weight | How to Evaluate |
|--------|--------|-----------------|
| [Factor 1] | High | [Method] |
| [Factor 2] | Medium | [Method] |
| [Factor 3] | Low | [Method] |

---

## Options Analysis

### Option A: [Name]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Best for:** [Scenario]

### Option B: [Name]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Best for:** [Scenario]

---

## Recommendation Framework

When [CONDITION A]:
→ Recommend [APPROACH A] because [REASON]

When [CONDITION B]:
→ Recommend [APPROACH B] because [REASON]

---

## Implementation Roadmap

### Phase 1: [Name] (Week 1-2)
- [ ] Action item 1
- [ ] Action item 2

### Phase 2: [Name] (Week 3-4)
- [ ] Action item 1
- [ ] Action item 2

### Phase 3: [Name] (Week 5+)
- [ ] Action item 1
- [ ] Action item 2

---

## Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| [Metric 1] | [Current] | [Goal] | [When] |
| [Metric 2] | [Current] | [Goal] | [When] |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to address] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to address] |

---

## Output Format

### Strategy Document
Include:
- Executive summary
- Analysis and findings
- Recommendations
- Implementation roadmap
- Success metrics

---

## Task-Specific Questions

1. What's driving this decision now?
2. What options have you already considered?
3. What would success look like?
4. What's the timeline for decision and implementation?
5. Who are the stakeholders?

---

## Related Skills

- **[skill-name]**: For researching options
- **[skill-name]**: For implementing the choice
- **[skill-name]**: For measuring results
```

---

## 4. Audit/Review Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to audit, review, or diagnose [TOPIC]. Also use when the user mentions "[trigger-1]," "[trigger-2]," or "[trigger-3]." For fixing issues, see [related-skill].
---

# [Skill Title]

You are an expert in [DOMAIN]. Your goal is to identify issues and provide actionable recommendations to improve [OUTCOME].

## Initial Assessment

Before auditing, understand:

1. **Scope**
   - Full audit or specific focus?
   - What assets/pages to review?

2. **Current State**
   - Known issues already?
   - Recent changes?

3. **Priorities**
   - Most important areas?
   - What metrics matter?

---

## Audit Framework

### Priority Order
1. **[Category 1]** (Critical - blocks everything)
2. **[Category 2]** (High - major impact)
3. **[Category 3]** (Medium - noticeable impact)
4. **[Category 4]** (Low - nice to have)

---

## [Category 1] Audit

### Check For:
- [Item 1]
- [Item 2]
- [Item 3]

### Common Issues:
| Issue | Impact | How to Identify |
|-------|--------|-----------------|
| [Issue] | High/Med/Low | [Method] |

### Tools:
- [Tool 1]: [What it checks]
- [Tool 2]: [What it checks]

---

## [Category 2] Audit

### Check For:
- [Item 1]
- [Item 2]

### Common Issues:
| Issue | Impact | How to Identify |
|-------|--------|-----------------|
| [Issue] | High/Med/Low | [Method] |

---

## Output Format

### Audit Report Structure

**Executive Summary**
- Overall assessment (score or rating)
- Top 3-5 critical issues
- Quick wins identified

**Findings by Category**
For each issue:
- **Issue**: Description
- **Impact**: High/Medium/Low
- **Evidence**: How identified
- **Fix**: Recommendation
- **Priority**: 1-5

**Action Plan**
1. Critical (fix immediately)
2. High priority (this week)
3. Medium priority (this month)
4. Low priority (backlog)

---

## Checklist

### Pre-Audit
- [ ] Access to all necessary tools
- [ ] Scope defined and agreed
- [ ] Baseline metrics captured

### Post-Audit
- [ ] All categories reviewed
- [ ] Findings prioritized
- [ ] Recommendations actionable
- [ ] Report delivered

---

## Task-Specific Questions

1. What's the primary concern prompting this audit?
2. What access do I have to analytics/tools?
3. When was the last audit or major change?
4. Who will implement the recommendations?
5. What's the timeline for improvements?

---

## Related Skills

- **[skill-name]**: For fixing identified issues
- **[skill-name]**: For ongoing monitoring
- **[skill-name]**: For deeper analysis
```

---

## Usage Notes

1. **Copy the appropriate template**
2. **Replace all `[PLACEHOLDERS]`** with specific content
3. **Delete sections that don't apply** to your skill
4. **Add skill-specific sections** as needed
5. **Run through the quality rubric** before finalizing

---

*Last updated: 2026-02-07*
*Used by: skill-creator*

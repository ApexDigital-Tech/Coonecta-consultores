---
name: skill-creator
version: 1.0.0
description: When the user wants to create a new skill, define a skill template, or establish skill standards. Also use when the user mentions "create skill," "new skill," "skill template," "skill generator," or "skill factory." This is a meta-skill that generates other skills following established quality standards.
---

# Skill Creator

You are an expert in creating high-quality AI agent skills. Your goal is to generate comprehensive, well-structured skills that follow established patterns and maintain consistency across the skill library.

## What is a Skill?

A skill is a specialized instruction set that extends an AI agent's capabilities for specific tasks. Skills live in `.agent/skills/[skill-name]/` and contain:

- **SKILL.md** (required): Main instruction file with YAML frontmatter + markdown
- **references/** (optional): Supporting documents, examples, checklists
- **scripts/** (optional): Automation scripts and utilities
- **examples/** (optional): Reference implementations

---

## Skill Categories

When creating skills, first identify the category:

| Category | Focus | Examples |
|----------|-------|----------|
| **Marketing** | Growth, conversion, content | copywriting, seo-audit, page-cro |
| **Development** | Code, architecture, infrastructure | web-architecture, auth-implementation |
| **Design** | UI/UX, visual, accessibility | design-system, responsive-design |
| **Operations** | Deployment, monitoring, DevOps | deployment-strategy, monitoring |
| **Integration** | Third-party services, APIs | payment-integration, email-transactional |
| **Strategy** | Planning, decisions, analysis | pricing-strategy, content-strategy |
| **Meta** | Creating/managing other skills | skill-creator |

---

## Skill Structure Template

### 1. YAML Frontmatter (Required)

```yaml
---
name: skill-name-in-kebab-case
version: 1.0.0
description: When the user wants to [primary use case]. Also use when the user mentions "[trigger phrase 1]," "[trigger phrase 2]," or "[trigger phrase 3]." For [related task], see [related-skill].
---
```

**Description formula:**
```
When the user wants to [ACTION]. Also use when the user mentions "[TRIGGER 1]," "[TRIGGER 2]," or "[TRIGGER 3]." For [RELATED TASK], see [related-skill].
```

### 2. Title and Role Definition

```markdown
# [Skill Name]

You are an expert in [domain/specialty]. Your goal is to [primary objective that benefits the user].
```

### 3. Initial Assessment Section

```markdown
## Initial Assessment

**Check for product/project context first:**
If `.claude/product-marketing-context.md` or relevant context files exist, read them before asking questions. Use that context and only ask for information not already covered.

Before [action], understand:

1. **[Context Category 1]**
   - Question 1
   - Question 2

2. **[Context Category 2]**
   - Question 1
   - Question 2

3. **[Context Category 3]**
   - Question 1
   - Question 2
```

### 4. Core Principles Section

```markdown
## Core Principles

### 1. [Principle Name]
- Explanation
- Why it matters

### 2. [Principle Name]
- Explanation
- Why it matters

### 3. [Principle Name]
- Explanation
- Why it matters
```

### 5. Framework/Methodology Section

```markdown
## [Main Framework Name]

### [Subsection 1]

**Check for:**
- Item 1
- Item 2

**Common issues:**
- Issue 1
- Issue 2

### [Subsection 2]

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data | Data | Data |
```

### 6. Implementation Steps

```markdown
## Implementation

### Step 1: [Name]
- Action items
- Considerations

### Step 2: [Name]
- Action items
- Considerations

### Step 3: [Name]
- Action items
- Considerations
```

### 7. Code Examples (for technical skills)

````markdown
## Code Examples

### [Use Case Name]

```javascript
// Well-commented, production-ready code
const example = {
  key: 'value'
};
```

**Explanation:** Why this approach, what it solves.
````

### 8. Checklists

```markdown
## Checklist

### Pre-[Action] Checklist
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

### Post-[Action] Checklist
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3
```

### 9. Output Format Section

```markdown
## Output Format

When completing this task, provide:

### [Output Type 1]
- Description of format
- What to include

### [Output Type 2]
- Description of format
- What to include
```

### 10. Task-Specific Questions

```markdown
## Task-Specific Questions

1. [Question that clarifies scope]
2. [Question that identifies constraints]
3. [Question that reveals context]
4. [Question that determines priorities]
5. [Question that uncovers existing solutions]
```

### 11. Related Skills

```markdown
## Related Skills

- **[skill-name]**: When to use this instead
- **[skill-name]**: Complementary skill
- **[skill-name]**: For follow-up tasks
```

---

## Quality Standards

### ✅ A Well-Crafted Skill Has:

| Aspect | Requirement |
|--------|-------------|
| **Clarity** | Anyone can understand what it does and when to use it |
| **Completeness** | Covers the full scope without requiring external knowledge |
| **Actionability** | Provides specific steps, not just general advice |
| **Structure** | Logical flow from understanding → planning → executing |
| **Examples** | Concrete illustrations of abstract concepts |
| **Checklists** | Validation steps to ensure quality |
| **Cross-references** | Links to related skills for complete coverage |

### ❌ Common Skill Anti-Patterns:

- **Too vague**: "Make it good" without defining what good means
- **Too narrow**: Only covers one specific case
- **Too broad**: Tries to cover everything, covers nothing well
- **No structure**: Wall of text without sections
- **No examples**: Abstract principles without concrete application
- **No validation**: No way to verify the work is complete
- **Orphaned**: No connection to other skills

---

## Skill Naming Conventions

### File/Folder Names
- **Format**: `kebab-case` (lowercase with hyphens)
- **Length**: 2-4 words maximum
- **Style**: Descriptive, not clever

| ✅ Good | ❌ Bad |
|---------|--------|
| `seo-audit` | `SEO_Audit` |
| `auth-implementation` | `authentication-and-authorization-implementation` |
| `payment-integration` | `stripe-paddle-payment` |
| `design-system` | `ds` |

### Skill Titles (in markdown)
- **Format**: Title Case
- **Style**: Clear and professional

---

## Creating a New Skill: Process

### Phase 1: Research & Planning

1. **Identify the gap**
   - What task is not currently covered?
   - Who needs this skill and when?

2. **Define scope**
   - What's included?
   - What's explicitly excluded?
   - What related skills exist?

3. **Research best practices**
   - Industry standards
   - Common patterns
   - Anti-patterns to avoid

### Phase 2: Structure & Draft

1. **Create folder structure**
   ```
   .agent/skills/[skill-name]/
   ├── SKILL.md
   └── references/
       └── [supporting-docs].md
   ```

2. **Write YAML frontmatter**
   - Name, version, description
   - Trigger phrases
   - Related skill references

3. **Draft core sections**
   - Initial Assessment
   - Core Principles
   - Main Framework
   - Implementation Steps

### Phase 3: Enhance & Validate

1. **Add examples**
   - Code snippets for technical skills
   - Copy examples for marketing skills
   - Output templates

2. **Create checklists**
   - Pre-action validation
   - Post-action verification

3. **Cross-reference**
   - Link to related skills
   - Reference external resources

4. **Review against quality standards**
   - Run through the checklist below

---

## Skill Creation Checklist

### Structure
- [ ] YAML frontmatter is complete and valid
- [ ] Description includes trigger phrases
- [ ] Description references related skills
- [ ] All major sections are present
- [ ] Logical flow from context → principles → action → validation

### Content
- [ ] Role/expertise is clearly defined
- [ ] Initial assessment covers necessary context
- [ ] Core principles provide foundational knowledge
- [ ] Framework is comprehensive but focused
- [ ] Examples are concrete and relevant
- [ ] Checklists enable self-validation

### Quality
- [ ] Actionable (tells WHAT to do, not just concepts)
- [ ] Specific (avoids vague generalizations)
- [ ] Complete (covers the full scope)
- [ ] Consistent (matches existing skill style)
- [ ] Referenced (links to related skills)

### Technical (for dev skills)
- [ ] Code examples are production-ready
- [ ] Security considerations are addressed
- [ ] Performance implications are noted
- [ ] Error handling is included

---

## Skill Templates by Category

### Marketing Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to [marketing goal]. Also use when the user mentions "[trigger]."
---

# [Skill Name]

You are an expert in [marketing specialty]. Your goal is to [objective that improves conversions/growth].

## Initial Assessment
[Context questions about audience, goals, current state]

## Core Principles
[Marketing fundamentals for this domain]

## Framework
[Step-by-step methodology]

## Output Format
[What deliverables look like]

## Task-Specific Questions
[5-6 clarifying questions]

## Related Skills
[Cross-references]
```

### Development Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to implement [technical feature]. Also use when the user mentions "[trigger]."
---

# [Skill Name]

You are an expert in [technical domain]. Your goal is to help build [scalable/secure/performant] [systems/features].

## Initial Assessment
[Technical context: stack, constraints, existing code]

## Core Principles
[Architectural/security/performance fundamentals]

## Architecture
[System design, component structure]

## Implementation
[Step-by-step with code examples]

## Security Considerations
[Security-specific guidance]

## Testing Strategy
[How to validate the implementation]

## Deployment
[Production considerations]

## Troubleshooting
[Common issues and solutions]

## Related Skills
[Cross-references]
```

### Strategy Skill Template

```markdown
---
name: [skill-name]
version: 1.0.0
description: When the user wants to plan [strategic decision]. Also use when the user mentions "[trigger]."
---

# [Skill Name]

You are an expert in [strategic domain]. Your goal is to help make [informed/data-driven] decisions about [topic].

## Initial Assessment
[Business context, constraints, goals]

## Decision Framework
[How to evaluate options]

## Analysis Method
[Research and data gathering]

## Options Evaluation
[Comparison criteria]

## Recommendation Format
[How to present findings]

## Implementation Roadmap
[Next steps after decision]

## Related Skills
[Cross-references]
```

---

## Advanced: Reference Documents

### When to Create References

Create separate reference documents (`references/*.md`) when:
- Content is too detailed for the main skill
- Information is reusable across multiple skills
- You have extensive lists, examples, or templates
- External resources need documentation

### Reference Document Structure

```markdown
# [Reference Title]

## Overview
Brief description of what this reference contains.

## [Section 1]
Detailed content...

## [Section 2]
Detailed content...

---

*Last updated: [Date]*
*Used by: [skill-1], [skill-2]*
```

---

## Example: Complete Skill Creation

**User Request:** "Create a skill for implementing authentication"

### Step 1: Create Structure

```
.agent/skills/auth-implementation/
├── SKILL.md
└── references/
    ├── provider-comparison.md
    └── security-checklist.md
```

### Step 2: Write SKILL.md

```markdown
---
name: auth-implementation
version: 1.0.0
description: When the user wants to implement user authentication, login systems, or access control. Also use when the user mentions "auth," "login," "signup," "authentication," "OAuth," "JWT," or "session management." For authorization and permissions, see security-hardening. For signup flow optimization, see signup-flow-cro.
---

# Authentication Implementation

You are an expert in authentication systems and security. Your goal is to help implement secure, user-friendly authentication that follows industry best practices.

[... rest of skill content ...]
```

---

## Output Format

When creating a skill, provide:

### 1. Skill Overview
- Name and category
- Primary use cases
- Related skills

### 2. Complete SKILL.md
- Full content ready to save

### 3. Reference Documents (if needed)
- Supporting materials

### 4. Integration Notes
- How it connects to existing skills
- Recommended skill combinations

---

## Task-Specific Questions

1. What domain/task should this skill cover?
2. Who is the primary user of this skill?
3. What existing skills does it relate to?
4. What triggers should activate this skill?
5. Are there specific tools/technologies to include?
6. What level of detail is needed? (quick reference vs. comprehensive)

---

## Related Skills

- **product-marketing-context**: For establishing project context that skills reference
- **copywriting**: Example of well-structured marketing skill
- **seo-audit**: Example of comprehensive audit skill
- **analytics-tracking**: Example of technical implementation skill

---

## Meta Notes

This skill should be used by the AI agent when:
1. User explicitly requests a new skill
2. A gap is identified in the skill library
3. An existing skill needs to be restructured
4. Skill quality standards need to be applied

**Skill creation is iterative**: Create, test, refine based on real usage.

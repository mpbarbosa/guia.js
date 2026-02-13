# English Feedback Guide for GitHub Copilot CLI

**Purpose**: Improve English language skills while using GitHub Copilot  
**Target Audience**: Non-native English speakers (especially Portuguese speakers)  
**Activation**: On-demand with `[[ENGLISH-FEEDBACK]]` keyword  
**Last Updated**: 2026-02-13

---

## 📖 Overview

This guide enables comprehensive English language feedback during your GitHub Copilot CLI sessions. When activated, Copilot will analyze your prompt for grammar, vocabulary, clarity, and style, providing detailed feedback before executing your request.

### Benefits

- **Learn while working** - Get English feedback without interrupting your workflow
- **Comprehensive analysis** - Grammar, vocabulary, clarity, and style improvements
- **Professional development** - Learn formal, technical English suitable for software development
- **On-demand control** - Activate only when you want feedback
- **Immediate application** - See improved version immediately, then use it

---

## 🚀 Quick Start

### Activation

Add the `[[ENGLISH-FEEDBACK]]` keyword at the beginning of your prompt:

```
[[ENGLISH-FEEDBACK]] Your prompt here
```

### Example

**Your prompt:**
```
[[ENGLISH-FEEDBACK]] I need to fix the documentation what have many outdated version references
```

**Copilot will:**
1. Provide detailed English feedback
2. Show corrected version
3. Then execute your request

---

## 📝 Feedback Format

When you use `[[ENGLISH-FEEDBACK]]`, Copilot will analyze your prompt and provide feedback in this structured format:

```
📝 ENGLISH FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORIGINAL TEXT:
[Your prompt exactly as written]

GRAMMAR ISSUES:
❌ [Error identified] → ✅ [Correction]
   - [Explanation of why this is incorrect]

VOCABULARY SUGGESTIONS:
• [Original word/phrase] → [Better alternative]
  Reason: [Why this is better]

CLARITY IMPROVEMENTS:
[Rephrased sentence with better structure]
Improvement: [Why this is clearer]

STYLE RECOMMENDATIONS:
[More formal/professional alternatives]

POLISHED VERSION:
"[Your prompt rewritten in professional US English]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Proceeding with your request...]
```

---

## 🔍 Feedback Categories

### 1. Grammar Analysis

**What's checked:**
- Subject-verb agreement
- Verb tenses (past, present, future)
- Pronoun usage
- Relative clauses (that, which, who)
- Preposition usage
- Article usage (a, an, the)
- Singular vs plural forms
- Word order

**Example:**
```
❌ "The documentation what have errors"
✅ "The documentation that has errors"

Error: 
- "what" should be "that" (relative pronoun for things)
- "have" should be "has" (singular subject "documentation")
```

---

### 2. Vocabulary Enhancement

**What's checked:**
- Word choice appropriateness
- Formal vs casual language
- Technical vocabulary accuracy
- False cognates (especially Portuguese→English)
- Redundant words
- Precision of meaning

**Example:**
```
Original: "fix the problem"
Better: "resolve the issue" or "address the problem"
Reason: More professional, specific to the context

Original: "very big"
Better: "substantial" or "significant"
Reason: More precise and formal
```

---

### 3. Clarity Improvements

**What's checked:**
- Sentence structure
- Logical flow
- Ambiguous phrasing
- Run-on sentences
- Fragment sentences
- Conciseness
- Parallel structure

**Example:**
```
Original: "I want to that we update the docs and then we can make it better"
Improved: "I want us to update the documentation and improve it"
Improvement: Removed redundancy, clarified subject, smoother flow
```

---

### 4. Style Recommendations

**What's checked:**
- Formality level
- Professional tone
- Technical writing conventions
- Active vs passive voice
- Consistency
- Politeness markers

**Example:**
```
Casual: "Can you help me fix this?"
Professional: "Could you assist with resolving this issue?"

Casual: "The code is broken"
Professional: "The code contains errors" or "The code is not functioning as expected"
```

---

## 🎯 Copilot Instructions

### For GitHub Copilot CLI

When you encounter the `[[ENGLISH-FEEDBACK]]` keyword in a user prompt:

#### Step 1: Detection
- Parse the user's message for `[[ENGLISH-FEEDBACK]]` keyword
- Extract the actual prompt (text after the keyword)
- Flag the session for feedback mode

#### Step 2: Analysis
Analyze the prompt for:
1. **Grammar errors** (syntax, agreement, tenses)
2. **Vocabulary issues** (word choice, formality level)
3. **Clarity problems** (structure, ambiguity)
4. **Style concerns** (tone, professionalism)

#### Step 3: Provide Feedback
Format feedback following the template:
- Show original text
- List grammar issues with corrections
- Suggest vocabulary improvements
- Propose clarity enhancements
- Recommend style adjustments
- Provide polished final version

#### Step 4: Execute Request
After providing feedback:
- Proceed with the user's original request
- Use the improved/corrected prompt if clarification was needed
- Continue normal operation

---

## 💡 Practical Examples

### Example 1: Simple Grammar Correction

**User prompt:**
```
[[ENGLISH-FEEDBACK]] I need to update the tests what is failing
```

**Copilot response:**
```
📝 ENGLISH FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORIGINAL TEXT:
"I need to update the tests what is failing"

GRAMMAR ISSUES:
❌ "tests what is failing" → ✅ "tests that are failing"
   - Use "that" (not "what") for relative clauses referring to things
   - Subject-verb agreement: "tests" is plural, use "are" not "is"

POLISHED VERSION:
"I need to update the tests that are failing"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Analyzing failing tests...]
```

---

### Example 2: Complex Technical Prompt

**User prompt:**
```
[[ENGLISH-FEEDBACK]] We should to refactor the code for make it more better and less complex because the new developers are having difficulty to understand the architecture
```

**Copilot response:**
```
📝 ENGLISH FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORIGINAL TEXT:
"We should to refactor the code for make it more better and less complex because 
the new developers are having difficulty to understand the architecture"

GRAMMAR ISSUES:
❌ "should to refactor" → ✅ "should refactor"
   - "Should" is a modal verb; don't use "to" after modals

❌ "for make it" → ✅ "to make it"
   - Use "to" (infinitive), not "for" before verbs of purpose

❌ "more better" → ✅ "better" (or "much better")
   - "Better" is already comparative; don't use "more" with it

❌ "difficulty to understand" → ✅ "difficulty understanding"
   - Use gerund (-ing form) after "difficulty"

VOCABULARY SUGGESTIONS:
• "less complex" → "simpler" or "less complicated"
  Reason: More concise

CLARITY IMPROVEMENTS:
"We should refactor the code to make it simpler because new developers are 
having difficulty understanding the architecture"

STYLE RECOMMENDATIONS:
More professional version:
"We should refactor the code to improve its clarity and reduce complexity, 
as new developers are struggling to understand the architecture"

POLISHED VERSION:
"We should refactor the code to make it simpler and easier to understand, 
as new developers are having difficulty with the current architecture"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Analyzing code for refactoring opportunities...]
```

---

### Example 3: Casual to Professional

**User prompt:**
```
[[ENGLISH-FEEDBACK]] Can you check out the bug in the login page? It's kinda broken and users are getting mad
```

**Copilot response:**
```
📝 ENGLISH FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORIGINAL TEXT:
"Can you check out the bug in the login page? It's kinda broken and users 
are getting mad"

VOCABULARY SUGGESTIONS:
• "check out" → "investigate" or "examine"
  Reason: More professional, less casual

• "kinda broken" → "not functioning properly" or "malfunctioning"
  Reason: "Kinda" is informal; be specific about the issue

• "getting mad" → "frustrated" or "experiencing issues"
  Reason: More professional, less emotional

STYLE RECOMMENDATIONS:
Transform from casual conversation to professional technical communication:
- Remove contractions in formal writing ("It's" → "It is")
- Use technical vocabulary
- Maintain professional tone

POLISHED VERSION:
"Could you investigate the bug in the login page? It is not functioning 
properly and users are experiencing frustration"

OR (more concise):
"Please investigate the login page bug that is causing user frustration"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Analyzing login page for bugs...]
```

---

## 📚 Quick Reference for Portuguese Speakers

### Common Grammar Pitfalls

#### 1. False Cognates (False Friends)

**Portuguese → English (WRONG) → English (CORRECT)**

| Portuguese | Looks like... | Actually means... |
|------------|---------------|-------------------|
| Atualmente | Actually | Currently |
| Pretender | Pretend | Intend, plan to |
| Assistir | Assist | Watch, attend |
| Realizar | Realize | Accomplish, carry out |
| Eventualmente | Eventually | Occasionally |
| Esquisito | Exquisite | Strange, weird |
| Parentes | Parents | Relatives |
| Sensível | Sensible | Sensitive |
| Resumir | Resume | Summarize |
| Suportar | Support | Endure, tolerate |

**Examples:**
```
❌ "Actually, I am working on this feature"
✅ "Currently, I am working on this feature"

❌ "I pretend to finish this by Friday"
✅ "I intend to finish this by Friday"

❌ "I will assist the presentation"
✅ "I will attend the presentation"
```

---

#### 2. Preposition Differences

**Portuguese → English**

| Context | Portuguese | English |
|---------|-----------|----------|
| Arrive | Chegar em | Arrive at/in |
| Depend | Depender de | Depend on |
| Listen | Escutar (direto) | Listen to |
| Wait | Esperar por | Wait for |
| Dream | Sonhar com | Dream about/of |
| Think | Pensar em | Think about |

**Examples:**
```
❌ "I arrived in the office"
✅ "I arrived at the office"

❌ "It depends of the situation"
✅ "It depends on the situation"

❌ "I am waiting the response"
✅ "I am waiting for the response"
```

---

#### 3. Article Usage (a, an, the)

Portuguese uses articles more liberally than English.

**When NOT to use articles in English:**

```
❌ "The life is beautiful" (general concept)
✅ "Life is beautiful"

❌ "I like the programming" (general activity)
✅ "I like programming"

❌ "The software development is complex" (general field)
✅ "Software development is complex"

✅ "The software development at our company is complex" (specific instance)
```

**When TO use "the":**

```
✅ "The documentation we wrote yesterday" (specific documentation)
✅ "The bug you mentioned" (specific bug)
✅ "The code in this repository" (specific code)
```

---

#### 4. Gerund vs Infinitive

In Portuguese, you can use infinitive after many verbs. English is more strict.

**Use GERUND (-ing) after:**
- enjoy, finish, stop, avoid, consider, mind, suggest
- prepositions (after, before, without, for, about)
- "have trouble/difficulty"

**Use INFINITIVE (to + verb) after:**
- want, need, plan, decide, hope, expect, agree
- would like, would prefer

**Examples:**
```
❌ "I enjoy to code"
✅ "I enjoy coding"

❌ "Stop to worry"
✅ "Stop worrying"

❌ "I want going to the meeting"
✅ "I want to go to the meeting"

❌ "We need updating the docs"
✅ "We need to update the docs"
```

---

#### 5. Subject-Verb Agreement

Portuguese allows dropping subject pronouns. English requires explicit subjects.

**Examples:**
```
❌ "Is important to test" (missing subject)
✅ "It is important to test"

❌ "Are many bugs in the code" (missing subject)
✅ "There are many bugs in the code"

❌ "Have three options" (missing subject)
✅ "There are three options" or "We have three options"
```

---

#### 6. Word Order Differences

**Adjective placement:**

Portuguese: noun + adjective  
English: adjective + noun

```
❌ "We need a solution better"
✅ "We need a better solution"

❌ "This is a problem serious"
✅ "This is a serious problem"
```

**Question formation:**

```
❌ "You can help me?" (Portuguese word order)
✅ "Can you help me?" (auxiliary verb first)

❌ "When you will finish?" (Portuguese word order)
✅ "When will you finish?" (auxiliary verb after question word)
```

---

### Common Vocabulary Issues

#### Technical Terms - Formal vs Casual

| Casual/Informal | Professional/Formal |
|----------------|---------------------|
| fix | resolve, address, correct |
| broken | malfunctioning, not working properly |
| mess up | corrupt, compromise, introduce errors |
| check out | investigate, examine, review |
| figure out | determine, ascertain, identify |
| get rid of | remove, eliminate, delete |
| kind of/sort of | somewhat, partially |
| a lot of | many, numerous, substantial |
| tons of | numerous, substantial, many |
| really good | excellent, effective, robust |

**Examples in context:**
```
Casual: "Let's fix the broken code"
Professional: "Let's address the malfunctioning code"

Casual: "Can you check out this bug?"
Professional: "Could you investigate this bug?"

Casual: "This solution is really good"
Professional: "This solution is highly effective"
```

---

## 🎓 Usage Tips

### 1. When to Request Feedback

**Good times:**
- Writing documentation
- Creating pull request descriptions
- Drafting technical proposals
- Asking complex questions
- Learning new technical vocabulary

**Less useful:**
- Quick commands ("run tests")
- Simple file operations
- When speed is critical

---

### 2. Learning Strategy

**Progressive approach:**
1. **First week**: Use `[[ENGLISH-FEEDBACK]]` on all prompts to identify patterns
2. **Second week**: Focus on your most common errors
3. **Third week**: Request feedback only for complex prompts
4. **Ongoing**: Periodic checks to reinforce learning

---

### 3. Taking Notes

Create a personal reference document for your common errors:

```markdown
# My English Improvement Notes

## Common Errors I Make

1. Using "what" instead of "that" in relative clauses
2. Forgetting subject-verb agreement with singular subjects
3. Using "for" instead of "to" before infinitives

## Words I'm Learning

- "refactor" (not "rewrite" for improving code structure)
- "implement" (not "make" for features)
- "debug" (not "fix" for finding errors)
```

---

## 🚫 Limitations

This feature does NOT:

- ❌ Automatically correct your prompts (you must request it)
- ❌ Provide translation services (English improvement only)
- ❌ Teach comprehensive grammar (focused on common issues)
- ❌ Replace formal language learning (supplement only)
- ❌ Work in programming language code (only natural language prompts)

---

## 🔄 Future Enhancements

Potential additions in future versions:

- `[[ENGLISH-TRANSLATION]]` - Portuguese to English translation
- `[[ENGLISH-PRACTICE]]` - Random grammar exercises
- Difficulty levels (beginner, intermediate, advanced)
- Persistent error tracking across sessions
- Weekly progress summaries

---

## 📞 Support & Feedback

### If Feedback Seems Wrong

English has many exceptions and contextual rules. If feedback seems incorrect:
1. Research the specific grammar rule
2. Consider the context (formal vs casual, technical vs general)
3. Ask for clarification: "Can you explain why [X] is incorrect?"

### Requesting Specific Feedback

You can ask for focused analysis:

```
[[ENGLISH-FEEDBACK:grammar-only]] Your prompt here
[[ENGLISH-FEEDBACK:vocabulary-only]] Your prompt here
[[ENGLISH-FEEDBACK:style-only]] Your prompt here
```

*(Note: These focused modes may be added in future versions)*

---

## 📖 Additional Resources

### For Portuguese Speakers Learning English

**Recommended resources:**
- **Grammar**: "English Grammar in Use" by Raymond Murphy
- **Vocabulary**: "Word Power Made Easy" by Norman Lewis
- **Technical English**: IEEE Technical Writing Guide
- **False Cognates**: Portuguese-English False Friends Lists
- **Practice**: Writing technical documentation, code comments in English

### Online Tools

- Grammarly (grammar checking)
- Hemingway Editor (clarity and readability)
- Google Scholar (academic/technical vocabulary examples)
- GitHub (reading code documentation in English)

---

## ✅ Quick Checklist

Before requesting feedback, ask yourself:

- [ ] Is this a complex prompt where I might make errors?
- [ ] Do I want to learn from this interaction?
- [ ] Am I writing documentation or formal communication?
- [ ] Do I have time to read and process feedback?
- [ ] Will I apply what I learn to future prompts?

If you answered "yes" to 3+ questions, use `[[ENGLISH-FEEDBACK]]`!

---

## 📝 Summary

**Activation**: `[[ENGLISH-FEEDBACK]]` at start of prompt  
**Coverage**: Grammar, vocabulary, clarity, style  
**Language**: English only (immersive learning)  
**Format**: Structured, easy-to-scan feedback  
**Target**: Non-native speakers (especially Portuguese)  
**Goal**: Improve English while working with Copilot

---

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Maintainer**: GitHub Copilot CLI Team  
**License**: Internal Use Only

---

**Remember**: The best way to improve is through consistent practice. Use this feature regularly, take notes on your common errors, and celebrate your progress! 🎉

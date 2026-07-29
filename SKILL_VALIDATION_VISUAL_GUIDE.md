# Skill Validation - Visual Guide

## User Story Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ SKILL BARTER - EXCHANGE FLOW WITH VALIDATION                │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│  User A Profile                 │
│  ├─ Name: Alice                 │
│  ├─ Skills to Teach:            │
│  │  ├─ JavaScript               │
│  │  └─ Piano                    │
│  └─ Skills to Learn:            │
│     ├─ Python                   │
│     └─ Painting                 │
└─────────────────────────────────┘
         │
         │ Searches for User B
         ▼
┌─────────────────────────────────┐
│  User B Profile (Search Result) │
│  ├─ Name: Bob                   │
│  ├─ Skills to Teach:            │
│  │  ├─ Python                   │
│  │  └─ Painting                 │
│  └─ Location: New York          │
└─────────────────────────────────┘
         │
         │ Clicks "Start Exchange"
         ▼
┌──────────────────────────────────────┐
│  EXCHANGE MODAL OPENS                │
│                                      │
│  Title: "Start Exchange with Bob"   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Skill You Can Teach          │   │
│  │ Dropdown (From Your Profile) │   │
│  │                              │   │
│  │ ☑ Select a skill to teach    │   │ ← Only shows
│  │   - JavaScript       ✓        │   │   Alice's
│  │   - Piano            ✓        │   │   skills
│  │                              │   │
│  │ Helper: "You can only teach  │   │
│  │ skills you've defined in     │   │
│  │ your profile"                │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Skill You Want to Learn      │   │
│  │ Dropdown (From Bob's Profile)│   │
│  │                              │   │
│  │ ☑ Select a skill to learn    │   │
│  │   - Python           ✓        │   │ ← Only shows
│  │   - Painting         ✓        │   │   Bob's
│  │                              │   │   skills
│  │ Helper: "Choose from skills  │   │
│  │ that Bob can teach"          │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Cancel] [Create Exchange]         │
│           (enabled when both        │
│            selections made)         │
└──────────────────────────────────────┘
         │
         │ Alice selects:
         │ - Teach: "JavaScript"
         │ - Learn: "Python"
         ▼
┌──────────────────────────────────────┐
│  API CALL: POST /api/exchanges       │
│  Body: {                             │
│    participantId: "bob_id",          │
│    offeredSkillId: "js_skill_id",    │
│    requestedSkillId: "python_id"     │
│  }                                   │
└──────────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  ✅ VALID  ❌ INVALID
    │
┌─────────────────────────────────┐
│ Backend Validates:              │
│ 1. Is "js_skill_id" in          │
│    Alice.skillsToTeach?         │ → YES ✅
│ 2. Is "python_id" in            │
│    Bob.skillsToTeach?           │ → YES ✅
│                                 │
│ Result: EXCHANGE CREATED ✅     │
└─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Success! Exchange Created           │
│  Alert: "Exchange created! You can   │
│  now chat with Bob"                  │
│                                      │
│  Modal stays open...                 │
│                                      │
│  Skill dropdowns reset to:           │
│  - "Select a skill to teach"         │
│  - "Select a skill to learn"         │
│                                      │
│  Alice can now start another         │
│  exchange with Bob if desired        │
└──────────────────────────────────────┘
```

---

## Modal States

### State 1: Both Users Have Skills (Happy Path)

```
┌──────────────────────────────────┐
│ Skill You Can Teach              │
├──────────────────────────────────┤
│ ☑ Select a skill to teach        │
│   • JavaScript                   │
│   • Piano                        │
│ ✅ Dropdown enabled              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Skill You Want to Learn          │
├──────────────────────────────────┤
│ ☑ Select a skill to learn        │
│   • Python                       │
│   • Painting                     │
│ ✅ Dropdown enabled              │
└──────────────────────────────────┘

Button State: [Cancel] [Create Exchange ✅]
              (enabled when both skills selected)
```

---

### State 2: Current User Has No Skills

```
┌──────────────────────────────────┐
│ Skill You Can Teach              │
├──────────────────────────────────┤
│ ⚠️ You haven't added any skills  │
│    to teach yet. Please update   │
│    your profile first.           │
│                                  │
│ ❌ Dropdown disabled             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Skill You Want to Learn          │
├──────────────────────────────────┤
│ ☑ Select a skill to learn        │
│   • Python                       │
│   • Painting                     │
│ ✅ Dropdown enabled              │
└──────────────────────────────────┘

Button State: [Cancel] [Create Exchange ❌]
              (disabled - tooltip: "Add skills to your profile first")
```

---

### State 3: Partner Has No Skills

```
┌──────────────────────────────────┐
│ Skill You Can Teach              │
├──────────────────────────────────┤
│ ☑ Select a skill to teach        │
│   • JavaScript                   │
│   • Piano                        │
│ ✅ Dropdown enabled              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Skill You Want to Learn          │
├──────────────────────────────────┤
│ ⚠️ This user hasn't added any    │
│    skills they can teach.        │
│                                  │
│ ❌ Dropdown disabled             │
└──────────────────────────────────┘

Button State: [Cancel] [Create Exchange ❌]
              (disabled - tooltip: "This user has no skills to teach")
```

---

## Validation Decision Tree

```
                        ┌─ User clicks "Start Exchange"
                        │
                        ▼
              ┌─────────────────────┐
              │ Modal Opens         │
              └──────────┬──────────┘
                         │
                    ┌────┴────┐
                    │          │
                    ▼          ▼
              ✅ YES      ❌ NO
                  │          │
        User has  │          │  User has
        skills?   │          │  no skills?
                  │          │
                  ▼          ▼
             ┌────────┐  ┌──────────┐
             │Show    │  │ Show     │
             │dropdown│  │ warning  │
             └────┬───┘  └─────┬────┘
                  │             │
                  ▼             ▼
              ┌────────────────────────┐
              │ Check Partner Skills   │
              └────────┬───────────────┘
                       │
                   ┌───┴────┐
                   │         │
                   ▼         ▼
              ✅ HAS      ❌ NONE
                   │         │
                   ▼         ▼
              ┌────────┐  ┌──────────┐
              │Show    │  │ Show     │
              │dropdown│  │ warning  │
              └────┬───┘  └─────┬────┘
                   │            │
                   ▼            ▼
            ┌─────────────────────────┐
            │ Button State            │
            └────────┬────────────────┘
                     │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
        ENABLED             DISABLED
      (Both skills      (Missing skills,
       available &       no selections,
       selected)         or warnings)
           │                   │
           ▼                   ▼
      Submit Form         Can't Submit
           │
           ▼
      ┌─────────────────────────────┐
      │ BACKEND VALIDATION          │
      │                             │
      │ 1. Offered skill in         │
      │    user list? → Validate    │
      │ 2. Requested skill in       │
      │    partner list? → Validate │
      └────────┬────────────────────┘
               │
           ┌───┴───┐
           │       │
           ▼       ▼
         ✅ OK   ❌ FAIL
           │       │
           ▼       ▼
        Create  Return 403
        Exchange Error
```

---

## Skill Arrays Comparison

```
┌──────────────────────────────────────────────────────────┐
│ WHO CAN TEACH WHAT?                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  User A Profile          →    User B Profile            │
│  ─────────────────           ─────────────────           │
│  skillsToTeach:              skillsToTeach:             │
│    □ JavaScript               □ Python                  │
│    □ Piano                    □ Painting                │
│                                                          │
│  When A exchanges with B:                               │
│  ✅ A can offer: JavaScript  (in A's list)             │
│  ✅ A can offer: Piano       (in A's list)             │
│  ❌ A can offer: Python      (NOT in A's list)         │
│  ❌ A can offer: Painting    (NOT in A's list)         │
│                                                          │
│  ✅ A can learn: Python      (in B's list)             │
│  ✅ A can learn: Painting    (in B's list)             │
│  ❌ A can learn: JavaScript  (NOT in B's list)         │
│  ❌ A can learn: Piano       (NOT in B's list)         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Error Scenarios & Messages

```
┌─────────────────────────────────────────────────────────────┐
│ SCENARIO 1: User Has No Skills                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔴 Skill You Can Teach:                                    │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ⚠️  You haven't added any skills to teach yet.      │  │
│ │    Please update your profile first.                │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ Button: DISABLED                                           │
│ Tooltip: "Add skills to your profile first"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SCENARIO 2: Partner Has No Skills                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔴 Skill You Want to Learn:                                │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ⚠️  This user hasn't added any skills they can      │  │
│ │    teach.                                            │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ Button: DISABLED                                           │
│ Tooltip: "This user has no skills to teach"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SCENARIO 3: Invalid Offered Skill (Backend)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ API Response: 403 Forbidden                                │
│ Error Message:                                             │
│ "You can only teach skills you have defined in your       │
│  profile"                                                   │
│                                                             │
│ User Sees: Alert popup with error message                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SCENARIO 4: Invalid Requested Skill (Backend)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ API Response: 403 Forbidden                                │
│ Error Message:                                             │
│ "The other user does not teach the skill you want to      │
│  learn"                                                     │
│                                                             │
│ User Sees: Alert popup with error message                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
SearchPage (Component)
│
├─ State Management
│  ├─ selectedPartner (UserType | null)
│  ├─ showExchangeModal (boolean)
│  ├─ selectedOfferedSkill (string)
│  ├─ selectedRequestedSkill (string)
│  ├─ currentUserSkills (Skill[])
│  └─ isSubmittingExchange (boolean)
│
├─ Search Results Grid
│  └─ User Cards
│     └─ "Start Exchange" Button
│        └─ onClick → Opens Modal
│
└─ Exchange Modal
   ├─ Modal Container (showExchangeModal && selectedPartner)
   │
   ├─ Header
   │  ├─ Title: "Start Exchange with {name}"
   │  └─ Close Button (X)
   │
   ├─ Body
   │  ├─ Skill You Can Teach Section
   │  │  ├─ Label
   │  │  ├─ Conditional Rendering
   │  │  │  ├─ If no skills → Warning message
   │  │  │  └─ If has skills → Dropdown
   │  │  └─ Helper text
   │  │
   │  ├─ Skill You Want to Learn Section
   │  │  ├─ Label
   │  │  ├─ Conditional Rendering
   │  │  │  ├─ If partner no skills → Warning message
   │  │  │  └─ If partner has skills → Dropdown
   │  │  └─ Helper text
   │  │
   │  └─ Buttons
   │     ├─ Cancel (always enabled)
   │     └─ Create Exchange (conditional)
   │        ├─ Disabled if: no user skills
   │        ├─ Disabled if: no partner skills
   │        ├─ Disabled if: no selections
   │        └─ Disabled if: submitting
   │
   └─ On Success
      ├─ Reset skill selections
      ├─ Keep modal open
      └─ Show success message
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│                                                              │
│  [Search Results] → [User Card] → [Start Exchange Button]  │
│                                              │               │
│                                              ▼               │
│                      ┌─────────────────────────────────┐    │
│                      │   MODAL COMPONENT               │    │
│                      │                                 │    │
│                      │  Skill Dropdowns (Conditional)  │    │
│                      │  - Your Skills                  │    │
│                      │  - Partner Skills               │    │
│                      │                                 │    │
│                      │  Submit Button (Conditional)    │    │
│                      └────────────────┬────────────────┘    │
│                                       │                     │
└───────────────────────────────────────┼─────────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────┐
                     │   FRONTEND VALIDATION        │
                     │                              │
                     │  • Both skills selected?     │
                     │  • Arrays populated?         │
                     │  • Button state valid?       │
                     │                              │
                     │  ✅ Pass → Send API request  │
                     │  ❌ Fail → Prevent submit    │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │   API: /api/exchanges (POST)   │
                    │                                │
                    │  Request: {                    │
                    │    participantId,              │
                    │    offeredSkillId,             │
                    │    requestedSkillId            │
                    │  }                             │
                    └────────────────┬───────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │  BACKEND VALIDATION            │
                    │                                │
                    │  1. Fetch current user         │
                    │  2. Fetch participant          │
                    │  3. Validate offered skill     │
                    │  4. Validate requested skill   │
                    │                                │
                    │  ✅ Valid → Create exchange    │
                    │  ❌ Invalid → Return 403       │
                    └────────────────┬───────────────┘
                                     │
                         ┌───────────┴──────────┐
                         │                      │
                         ▼                      ▼
                    ✅ SUCCESS                ❌ ERROR
                         │                      │
                         ▼                      ▼
                  Save to Database    Show Error Message
                  Reset Modal State   Keep Modal Open
                  Show Success Alert  User Can Retry
```

---

## Browser DevTools Testing

```
1. Open DevTools (F12)
2. Go to Console tab
3. Paste this code:

// Check if validation is working
fetch('/api/exchanges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participantId: 'USER_B_ID',
    offeredSkillId: 'INVALID_SKILL',
    requestedSkillId: 'VALID_SKILL'
  })
})
.then(r => r.json())
.then(data => {
  if (data.error?.includes('skills you have defined')) {
    console.log('✅ Offered skill validation working!');
  } else {
    console.log('❌ Validation may not be working:', data.error);
  }
});

// Check dropdown population
console.log('Current user skills:', currentUserSkills);
console.log('Partner skills:', selectedPartner?.skillsToTeach);
```

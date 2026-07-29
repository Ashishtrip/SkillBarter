# Skill Validation Quick Reference

## The Rule

✅ **User can learn:** ANY skill the other user has in their `skillsToTeach`  
❌ **User can only teach:** Skills they have defined in their own `skillsToTeach`

## How It Works

### Start Exchange Flow

```
1. Search → Find a user
2. Click "Start Exchange"
3. Modal opens showing:
   - YOUR skills (what you can teach)
   - THEIR skills (what they can teach you)
4. Select:
   - What you will teach (your dropdown)
   - What you want to learn (their dropdown)
5. Click "Create Exchange"
```

### What Happens Behind the Scenes

**Frontend Layer:**

- Modal loads your `skillsToTeach` array
- Modal loads partner's `skillsToTeach` array
- User selects from available skills
- Button disabled if any dropdowns empty or arrays empty

**Backend Layer:**

- Verifies offered skill is in your `skillsToTeach`
- Verifies requested skill is in partner's `skillsToTeach`
- Creates exchange if both validations pass
- Returns 403 error if validation fails

## Code Locations

| Component          | File                              | What                         |
| ------------------ | --------------------------------- | ---------------------------- |
| **Search Modal**   | `/src/app/search/page.tsx`        | Shows skill dropdowns        |
| **Exchange API**   | `/src/app/api/exchanges/route.ts` | Validates skills             |
| **Exchange Model** | `/src/models/Exchange.ts`         | Stores exchange data         |
| **User Model**     | `/src/models/User.ts`             | Stores `skillsToTeach` array |

## Key States (Search Page)

```typescript
currentUserSkills; // Your skillsToTeach - used for "Skill You Can Teach"
selectedPartner; // The user you want to exchange with
selectedOfferedSkill; // Skill you selected to teach
selectedRequestedSkill; // Skill you want to learn from them
showExchangeModal; // Modal visibility toggle
```

## Common Scenarios

### ✅ User Has Skills, Partner Has Skills

- Both dropdowns populate
- Button enabled when both skills selected
- Exchange can be created

### ⚠️ User Has NO Skills

- "Skill You Can Teach" shows warning
- Button disabled
- Message: "You haven't added any skills to teach yet"

### ⚠️ Partner Has NO Skills

- "Skill You Want to Learn" shows warning
- Button disabled
- Message: "This user hasn't added any skills they can teach"

### ❌ Invalid API Call Attempt

- Backend rejects with 403
- User sees: "You can only teach skills you have defined in your profile"
- Or: "The other user does not teach the skill you want to learn"

## Validation Layers

```
Layer 1: Frontend (UX Prevention)
├─ Check if arrays empty
├─ Show warnings
└─ Disable button

Layer 2: Backend (Security Enforcement)
├─ Validate offered skill in user.skillsToTeach
├─ Validate requested skill in partner.skillsToTeach
└─ Return 403 if fails
```

## Testing Quick Checks

**Test User A wants to exchange with User B:**

1. **Setup:**
   - User A: Add 2 skills to profile (e.g., "JavaScript", "Piano")
   - User B: Add 2 skills to profile (e.g., "Python", "Painting")

2. **Positive Test:**
   - User A searches, finds User B
   - Clicks "Start Exchange"
   - Selects "JavaScript" to teach
   - Selects "Python" to learn
   - Exchange created ✅

3. **Negative Test:**
   - User A tries to teach "Python" (doesn't have it)
   - Should be blocked by frontend (dropdown only shows their skills)
   - Even if bypassed, backend rejects it ✅

4. **Edge Case:**
   - User A with no skills tries to exchange
   - Warning shown: "You haven't added any skills to teach yet"
   - Button disabled ✅

## User Profile Impact

When user updates their `skillsToTeach` in profile:

- Next time they open Search and Start Exchange modal
- The dropdown automatically shows updated skills
- No page refresh needed (React state updates)

## Multiple Exchanges

Same user pair can have multiple exchanges:

- User A can exchange different skills with User B multiple times
- Each exchange is separate: `offeredBy`, `requestedBy`, `skills`, `status`
- Modal stays open after first exchange to allow immediate second exchange

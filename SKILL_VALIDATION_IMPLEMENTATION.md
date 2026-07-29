# Skill Validation Implementation Guide

## Overview

This document outlines the implementation of skill validation constraints in the Skill Barter application:

- **Users can ONLY teach skills they have defined in their profile**
- **Users can learn ANY skill offered by another user**

## Implementation Details

### 1. Backend Validation (API Level)

**File:** `/src/app/api/exchanges/route.ts` (POST endpoint)

#### New Validation Checks

```typescript
// Fetch current user and participant to validate skills
const currentUser = await User.findById(session.user.id).populate(
  "skillsToTeach",
);
const participant =
  await User.findById(participantId).populate("skillsToTeach");

// Validate that offered skill belongs to current user's skillsToTeach
const userTeachesOfferedSkill = currentUser.skillsToTeach?.some(
  (skill: any) => skill._id.toString() === offeredSkillId,
);

if (!userTeachesOfferedSkill) {
  return createApiErrorResponse(
    "You can only teach skills you have defined in your profile",
    403,
  );
}

// Validate that requested skill belongs to participant's skillsToTeach
const participantTeachesRequestedSkill = participant.skillsToTeach?.some(
  (skill: any) => skill._id.toString() === requestedSkillId,
);

if (!participantTeachesRequestedSkill) {
  return createApiErrorResponse(
    "The other user does not teach the skill you want to learn",
    403,
  );
}
```

**Benefits:**

- Prevents unauthorized skill offerings via direct API calls
- Ensures database integrity
- Returns clear error messages to clients

### 2. Frontend Validation (UI Level)

**File:** `/src/app/search/page.tsx`

#### Modal Skill Dropdowns with Conditional Rendering

**"Skill You Can Teach" Dropdown:**

```tsx
{
  currentUserSkills.length === 0 ? (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
      You haven't added any skills to teach yet. Please update your profile
      first.
    </div>
  ) : (
    <select>
      <option value="">Select a skill to teach</option>
      {currentUserSkills.map((skill: Skill) => (
        <option key={skill._id} value={skill._id}>
          {skill.name}
        </option>
      ))}
    </select>
  );
}
```

**"Skill You Want to Learn" Dropdown:**

```tsx
{
  !selectedPartner.skillsToTeach ||
  selectedPartner.skillsToTeach.length === 0 ? (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
      This user hasn't added any skills they can teach.
    </div>
  ) : (
    <select>
      <option value="">Select a skill to learn</option>
      {selectedPartner.skillsToTeach.map((skill: Skill) => (
        <option key={skill._id} value={skill._id}>
          {skill.name}
        </option>
      ))}
    </select>
  );
}
```

#### Enhanced Create Exchange Button

The button now disables when:

- User has no skills to teach
- Partner has no skills to teach
- Either skill dropdown hasn't been selected
- Exchange is being submitted

```tsx
<button
  disabled={
    isSubmittingExchange ||
    !selectedOfferedSkill ||
    !selectedRequestedSkill ||
    currentUserSkills.length === 0 ||
    !selectedPartner.skillsToTeach ||
    selectedPartner.skillsToTeach.length === 0
  }
  title={/* helpful tooltips for disable reasons */}
>
  {isSubmittingExchange ? "Creating..." : "Create Exchange"}
</button>
```

#### Helper Text

Both dropdowns now include helper text explaining the constraint:

- **For offered skill:** "You can only teach skills you've defined in your profile"
- **For requested skill:** "Choose from skills that [PartnerName] can teach"

### 3. Data Flow Architecture

```
Search Results Page
    ↓
    User clicks "Start Exchange"
    ↓
    Modal opens with:
    - Current user's skillsToTeach (for offered skill dropdown)
    - Selected partner's skillsToTeach (for requested skill dropdown)
    ↓
    User selects both skills
    ↓
    Frontend validates:
    - Both skills selected
    - Skills available (arrays not empty)
    ↓
    POST /api/exchanges
    ↓
    Backend validates:
    - Offered skill in user's skillsToTeach
    - Requested skill in partner's skillsToTeach
    ↓
    Exchange created or error returned
```

### 4. User Experience Flow

#### Happy Path (Valid Exchange)

1. User searches for partners
2. Clicks "Start Exchange" with a partner
3. Modal opens showing:
   - Dropdown with their teachable skills
   - Dropdown with partner's teachable skills
4. User selects both skills
5. Clicks "Create Exchange"
6. Exchange created successfully
7. Can create another exchange with same user (modal stays open)

#### Error Path 1 (User has no skills)

1. Modal opens
2. "Skill You Can Teach" shows warning message
3. "Create Exchange" button disabled with tooltip
4. User must update profile first

#### Error Path 2 (Partner has no skills)

1. Modal opens
2. "Skill You Want to Learn" shows warning message
3. "Create Exchange" button disabled with tooltip
4. User must find another partner

#### Error Path 3 (Invalid skill selection attempt)

- User attempts to submit with incomplete selections
- Frontend prevents submission (button disabled)
- Backend validation catches any API-level bypass attempts

### 5. Error Messages

**Backend Error Responses:**

| Scenario                              | Status | Message                                                      |
| ------------------------------------- | ------ | ------------------------------------------------------------ |
| User doesn't teach offered skill      | 403    | "You can only teach skills you have defined in your profile" |
| Partner doesn't teach requested skill | 403    | "The other user does not teach the skill you want to learn"  |
| User not found                        | 404    | "User not found"                                             |
| Self-exchange attempt                 | 400    | "You cannot start an exchange with yourself"                 |
| Exchange already active               | 409    | "Exchange already exists with this user"                     |

**Frontend Warning Messages:**

| Scenario              | Message                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| No skills to teach    | "You haven't added any skills to teach yet. Please update your profile first." |
| Partner has no skills | "This user hasn't added any skills they can teach."                            |

### 6. Database Validation

The Exchange model enforces:

- `skills.offered` must be a valid Skill reference
- `skills.requested` must be a valid Skill reference
- `offeredBy` must be a valid User reference
- `requestedBy` must be a valid User reference

### 7. Multiple Exchanges Support

The implementation allows multiple exchanges between the same two users:

- Users can create multiple different skill exchanges with the same partner
- Each exchange is tracked independently
- Previous validation prevents duplicate ACTIVE exchanges for the same skill pair

**Key Change:** Modal now uses separate `showExchangeModal` state:

- Modal stays open after successful exchange
- Skills are reset to empty for new selection
- User can immediately create another exchange with same partner
- Only closes when user explicitly clicks "Cancel" or close button

### 8. Testing Checklist

- [ ] **Test 1:** User with no skills tries to start exchange → Error message shown
- [ ] **Test 2:** Partner with no skills → Error message shown
- [ ] **Test 3:** Valid exchange created successfully
- [ ] **Test 4:** Can create multiple exchanges with same partner
- [ ] **Test 5:** Direct API call with invalid skill → Backend rejects with 403
- [ ] **Test 6:** Update profile with new skill → Dropdown reflects change immediately
- [ ] **Test 7:** User searches, selects skills, creates exchange, creates another with same partner

### 9. Security Considerations

1. **Server-side validation is primary:** Backend checks all skill ownership
2. **Frontend validation is UX improvement:** Prevents unnecessary failed requests
3. **No bypass possible:** Backend validates regardless of frontend state
4. **Authorization checks:** Verifies user is authenticated before creating exchanges
5. **Data isolation:** Users can only see and exchange with their own and visible profiles' skills

### 10. Future Enhancements

1. **Skill filtering:** Filter search results by available skills
2. **Skill matching algorithm:** Suggest matches based on complementary skills
3. **Skill categories:** Group skills and exchanges by category
4. **Skill levels:** Match appropriate skill difficulty levels
5. **Exchange history:** Track completed skill exchanges per user
6. **Ratings by skill:** Rate users' teaching quality per specific skill

## Files Modified

1. **`/src/app/api/exchanges/route.ts`**
   - Added skill validation in POST handler
   - Validates offered skill belongs to current user
   - Validates requested skill belongs to participant

2. **`/src/app/search/page.tsx`**
   - Added `showExchangeModal` state for modal visibility
   - Enhanced skill dropdowns with conditional rendering
   - Added warning messages for missing skills
   - Updated button with comprehensive disable conditions
   - Kept modal open after successful exchange (allows multiple exchanges)
   - Added helper text explaining skill constraints

## Migration Notes

- ✅ Backward compatible: Existing exchanges remain unchanged
- ✅ No database schema changes needed
- ✅ No user data migration required
- ✅ Graceful handling of users with no skills

## Deployment Checklist

- [ ] Test all validation paths in staging
- [ ] Monitor API error responses for new 403 codes
- [ ] Verify UI error messages display correctly
- [ ] Test on mobile/tablet for responsive UI
- [ ] Check console for any warnings
- [ ] Verify analytics tracking for new error cases
- [ ] Create help documentation for "skills to teach" profile section

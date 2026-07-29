# Skill Validation Testing Checklist

## Pre-Test Setup

### Account 1: User A

- [ ] Create account for User A
- [ ] Add to profile: Skills to teach = ["JavaScript", "Piano"]
- [ ] Add to profile: Skills to learn = ["Python", "Painting"]

### Account 2: User B

- [ ] Create account for User B
- [ ] Add to profile: Skills to teach = ["Python", "Painting"]
- [ ] Add to profile: Skills to learn = ["JavaScript", "Piano"]

### Account 3: User C (No Skills)

- [ ] Create account for User C
- [ ] Do NOT add any skills to profile

---

## Test Cases

### Test 1: Valid Exchange Creation

**Objective:** User A can create exchange with User B using valid skills

**Steps:**

- [ ] Log in as User A
- [ ] Go to Search page
- [ ] Search for User B
- [ ] Click "Start Exchange" on User B's card
- [ ] Modal opens
- [ ] "Skill You Can Teach" dropdown shows: "JavaScript", "Piano"
- [ ] "Skill You Want to Learn" dropdown shows: "Python", "Painting"
- [ ] Select "JavaScript" from first dropdown
- [ ] Select "Python" from second dropdown
- [ ] Click "Create Exchange"
- [ ] See success message: "Exchange created successfully!"
- [ ] Modal stays open

**Expected Result:** ✅ Exchange created successfully

---

### Test 2: Multiple Exchanges with Same User

**Objective:** User A can create another exchange with User B immediately

**Steps:**

- [ ] From Test 1: Modal is still open
- [ ] "Skill You Can Teach" dropdown is reset to "Select a skill..."
- [ ] "Skill You Want to Learn" dropdown is reset to "Select a skill..."
- [ ] Select "Piano" from first dropdown
- [ ] Select "Painting" from second dropdown
- [ ] Click "Create Exchange"
- [ ] See success message

**Expected Result:** ✅ Second exchange created with same partner

---

### Test 3: User with No Skills - Cannot Teach

**Objective:** User C cannot start exchange because they have no skills to teach

**Steps:**

- [ ] Log in as User C
- [ ] Go to Search page
- [ ] Search for User A or B
- [ ] Click "Start Exchange" on any user
- [ ] Modal opens
- [ ] "Skill You Can Teach" section shows warning:
      "You haven't added any skills to teach yet. Please update your profile first."
- [ ] "Create Exchange" button is disabled (grayed out)
- [ ] Hover over button, see tooltip explaining why disabled

**Expected Result:** ✅ Cannot proceed; warning message shown; button disabled

---

### Test 4: Partner with No Skills - Cannot Learn

**Objective:** Cannot exchange with a user who has no skills to teach

**Steps:**

- [ ] Log in as User A
- [ ] Go to Search page
- [ ] Search for User C (no skills)
- [ ] Click "Start Exchange" on User C
- [ ] Modal opens
- [ ] "Skill You Can Teach" dropdown works (shows A's skills)
- [ ] "Skill You Want to Learn" section shows warning:
      "This user hasn't added any skills they can teach."
- [ ] "Create Exchange" button is disabled
- [ ] Hover over button, see tooltip

**Expected Result:** ✅ Cannot proceed; warning shown; button disabled

---

### Test 5: Try to Teach Skill You Don't Have (Frontend)

**Objective:** Frontend prevents selecting invalid skills

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Modal opens
- [ ] Try to see if "Python" or "Painting" appear in "Skill You Can Teach"
- [ ] They should NOT appear (only "JavaScript" and "Piano")

**Expected Result:** ✅ Dropdowns only show user's actual skills

---

### Test 6: Try to Learn Skill Partner Doesn't Teach (Frontend)

**Objective:** Frontend prevents selecting invalid skills from partner

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Modal opens
- [ ] In "Skill You Want to Learn", check available options
- [ ] Should only show: "Python", "Painting"
- [ ] Should NOT show: "JavaScript", "Piano" (B doesn't teach these)

**Expected Result:** ✅ Dropdown only shows partner's actual skills

---

### Test 7: Incomplete Selection - Cannot Submit

**Objective:** Button disabled when skills not fully selected

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Modal opens
- [ ] Select "JavaScript" in first dropdown
- [ ] Leave second dropdown as "Select a skill..."
- [ ] Try to click "Create Exchange" button
- [ ] Button should be disabled (grayed out)
- [ ] Hover over, see tooltip: "Select both skills"
- [ ] Select "Python" in second dropdown
- [ ] Button becomes enabled

**Expected Result:** ✅ Button properly disables/enables based on selections

---

### Test 8: Close Modal and Reopen

**Objective:** Modal properly resets when closed and reopened

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Select "JavaScript" and "Python"
- [ ] Click "Cancel" button
- [ ] Modal closes
- [ ] Click "Start Exchange" again with User B
- [ ] Modal opens
- [ ] Both dropdowns show "Select a skill..." (not previous selection)

**Expected Result:** ✅ Modal properly resets selections

---

### Test 9: Close Modal with X Button

**Objective:** X button properly closes modal

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Select skills
- [ ] Click X button (top right of modal)
- [ ] Modal closes
- [ ] Dropdowns should be reset next time modal opens

**Expected Result:** ✅ X button closes modal; state reset

---

### Test 10: Try Invalid API Bypass (Backend)

**Objective:** Backend prevents invalid exchanges even if frontend is bypassed

**Steps:**

- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Log in as User A
- [ ] Navigate to Search page
- [ ] Run this JavaScript:
  ```javascript
  fetch("/api/exchanges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantId: "USER_B_ID",
      offeredSkillId: "SKILL_NOT_IN_A_LIST", // Invalid
      requestedSkillId: "VALID_SKILL_ID",
    }),
  })
    .then((r) => r.json())
    .then(console.log);
  ```
- [ ] API response should be error with status 403
- [ ] Error message: "You can only teach skills you have defined in your profile"

**Expected Result:** ✅ Backend rejects invalid offer with 403

---

### Test 11: Self-Exchange Prevention

**Objective:** Cannot exchange with yourself

**Steps:**

- [ ] Log in as User A
- [ ] Go to Search page
- [ ] Search for own name/profile
- [ ] "Start Exchange" button should be disabled
- [ ] Button text says "Your Profile"
- [ ] Clicking shows alert: "You cannot start an exchange with yourself!"

**Expected Result:** ✅ Self-exchange prevented; clear message shown

---

### Test 12: Skill Updates Reflected in Modal

**Objective:** Adding new skills is reflected in dropdowns

**Steps:**

- [ ] Log in as User A
- [ ] Go to Search, start exchange with User B
- [ ] Note what skills appear in "Skill You Can Teach"
- [ ] Click "Cancel" to close modal
- [ ] Go to Profile page
- [ ] Add new skill "Spanish" to "Skills to Teach"
- [ ] Go back to Search
- [ ] Start exchange with User B again
- [ ] "Skill You Can Teach" now shows "Spanish" in dropdown

**Expected Result:** ✅ New skills immediately available in dropdowns

---

### Test 13: Error Handling - Network Failure

**Objective:** Graceful error when exchange creation fails

**Steps:**

- [ ] Open DevTools Network tab
- [ ] Log in as User A
- [ ] Start exchange creation with User B
- [ ] Throttle network to "Offline" in DevTools
- [ ] Click "Create Exchange"
- [ ] See error alert: "Failed to create exchange: [error message]"
- [ ] Modal stays open

**Expected Result:** ✅ Error handled gracefully; user can retry

---

### Test 14: Verify Helper Text

**Objective:** Helper text explains constraints to users

**Steps:**

- [ ] Log in as User A
- [ ] Click "Start Exchange" with User B
- [ ] Look for helper text:
  - [ ] Under first dropdown: "You can only teach skills you've defined in your profile"
  - [ ] Under second dropdown: "Choose from skills that [User B's name] can teach"
- [ ] Both should be visible and clear

**Expected Result:** ✅ Helper text properly explains constraints

---

### Test 15: Modal Responsive Design

**Objective:** Modal displays properly on mobile/tablet/desktop

**Steps:**

- [ ] Log in as User A
- [ ] Open browser DevTools
- [ ] Switch to mobile (375px width)
- [ ] Click "Start Exchange" with User B
- [ ] Modal should:
  - [ ] Fit within screen
  - [ ] Have readable text
  - [ ] Dropdown clickable with touch
  - [ ] Buttons full-width and tappable
- [ ] Resize to tablet (768px)
- [ ] Resize to desktop (1024px+)
- [ ] All views should work

**Expected Result:** ✅ Modal responsive on all device sizes

---

## Test Results Summary

### Critical Path Tests

- Test 1: Valid Exchange **\_** ✅ / ❌
- Test 5: Skill Validation (Frontend) **\_** ✅ / ❌
- Test 10: Skill Validation (Backend) **\_** ✅ / ❌

### Edge Case Tests

- Test 3: User No Skills **\_** ✅ / ❌
- Test 4: Partner No Skills **\_** ✅ / ❌
- Test 11: Self-Exchange Prevention **\_** ✅ / ❌

### UX Tests

- Test 2: Multiple Exchanges **\_** ✅ / ❌
- Test 8: Modal Reset **\_** ✅ / ❌
- Test 12: Skill Updates **\_** ✅ / ❌
- Test 14: Helper Text **\_** ✅ / ❌
- Test 15: Responsive Design **\_** ✅ / ❌

### Error Handling Tests

- Test 13: Network Error **\_** ✅ / ❌

---

## Sign Off

- [ ] All 15 tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive design verified
- [ ] Error messages clear and helpful
- [ ] Backend validation working
- [ ] Ready for staging deployment

**Tested By:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******  
**Notes:** **********************************\_\_\_\_**********************************

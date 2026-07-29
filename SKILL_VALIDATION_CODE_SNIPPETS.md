# Skill Validation - Code Snippets Reference

## Backend Validation (API)

### Location: `/src/app/api/exchanges/route.ts`

**Validation Code:**

```typescript
// Fetch current user and participant to validate skills
const User = (await import("@/models/User")).default;
const currentUser = await User.findById(session.user.id).populate(
  "skillsToTeach",
);
const participant =
  await User.findById(participantId).populate("skillsToTeach");

if (!currentUser || !participant) {
  return createApiErrorResponse("User not found", 404);
}

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

**How It Works:**

1. Fetches current user with populated `skillsToTeach`
2. Fetches participant with populated `skillsToTeach`
3. Checks if offered skill is in current user's list
4. Checks if requested skill is in participant's list
5. Returns 403 if either validation fails

---

## Frontend Modal (UI)

### Location: `/src/app/search/page.tsx`

**State Management:**

```typescript
const [selectedPartner, setSelectedPartner] = useState<UserType | null>(null);
const [showExchangeModal, setShowExchangeModal] = useState(false);
const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<string>("");
const [selectedRequestedSkill, setSelectedRequestedSkill] =
  useState<string>("");
const [currentUserSkills, setCurrentUserSkills] = useState<Skill[]>([]);
```

**Skills Fetching:**

```typescript
useEffect(() => {
  // Fetch current user's skills when modal is opened
  if (showExchangeModal && selectedPartner && session?.user?.email) {
    const fetchUserSkills = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const user = await response.json();
          setCurrentUserSkills(user.skillsToTeach || []);
        }
      } catch (error) {
        console.error("Error fetching user skills:", error);
      }
    };
    fetchUserSkills();
  }
}, [showExchangeModal, selectedPartner, session]);
```

**Modal Trigger:**

```typescript
<button
  onClick={() => {
    if (session?.user?.id === user._id) {
      alert('You cannot start an exchange with yourself!');
    } else {
      setSelectedPartner(user);
      setShowExchangeModal(true);
      setSelectedOfferedSkill('');
      setSelectedRequestedSkill('');
    }
  }}
  className="w-full btn-primary text-sm py-2"
>
  {session?.user?.id === user._id ? 'Your Profile' : 'Start Exchange'}
</button>
```

**"Skill You Can Teach" Dropdown:**

```typescript
<div>
  <label className="block text-sm font-medium text-secondary-700 mb-2">
    Skill You Can Teach
  </label>
  {currentUserSkills.length === 0 ? (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
      You haven't added any skills to teach yet. Please update your profile first.
    </div>
  ) : (
    <select
      value={selectedOfferedSkill}
      onChange={(e) => setSelectedOfferedSkill(e.target.value)}
      className="input-field w-full"
    >
      <option value="">Select a skill to teach</option>
      {currentUserSkills.map((skill: Skill) => (
        <option key={skill._id} value={skill._id}>
          {skill.name}
        </option>
      ))}
    </select>
  )}
  <p className="text-xs text-secondary-600 mt-1">
    You can only teach skills you've defined in your profile
  </p>
</div>
```

**"Skill You Want to Learn" Dropdown:**

```typescript
<div>
  <label className="block text-sm font-medium text-secondary-700 mb-2">
    Skill You Want to Learn
  </label>
  {!selectedPartner.skillsToTeach || selectedPartner.skillsToTeach.length === 0 ? (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
      This user hasn't added any skills they can teach.
    </div>
  ) : (
    <select
      value={selectedRequestedSkill}
      onChange={(e) => setSelectedRequestedSkill(e.target.value)}
      className="input-field w-full"
    >
      <option value="">Select a skill to learn</option>
      {selectedPartner.skillsToTeach.map((skill: Skill) => (
        <option key={skill._id} value={skill._id}>
          {skill.name}
        </option>
      ))}
    </select>
  )}
  <p className="text-xs text-secondary-600 mt-1">
    Choose from skills that {selectedPartner.name} can teach
  </p>
</div>
```

**Create Exchange Button:**

```typescript
<button
  onClick={handleStartExchange}
  disabled={
    isSubmittingExchange ||
    !selectedOfferedSkill ||
    !selectedRequestedSkill ||
    currentUserSkills.length === 0 ||
    !selectedPartner.skillsToTeach ||
    selectedPartner.skillsToTeach.length === 0
  }
  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
  title={
    currentUserSkills.length === 0 ? 'Add skills to your profile first' :
    !selectedPartner.skillsToTeach || selectedPartner.skillsToTeach.length === 0 ? 'This user has no skills to teach' :
    !selectedOfferedSkill || !selectedRequestedSkill ? 'Select both skills' : ''
  }
>
  {isSubmittingExchange ? 'Creating...' : 'Create Exchange'}
</button>
```

**Handle Exchange (Keeps Modal Open):**

```typescript
const handleStartExchange = async () => {
  if (!selectedPartner || !selectedOfferedSkill || !selectedRequestedSkill) {
    alert("Please select both skills to exchange");
    return;
  }

  setIsSubmittingExchange(true);
  try {
    const response = await fetch("/api/exchanges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: selectedPartner._id,
        offeredSkillId: selectedOfferedSkill,
        requestedSkillId: selectedRequestedSkill,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        "Exchange created successfully! You can now chat with " +
          selectedPartner.name,
      );
      // Reset skill selections but keep the modal open to allow more exchanges with same user
      setSelectedOfferedSkill("");
      setSelectedRequestedSkill("");
    } else {
      alert(result.error || "Failed to create exchange");
    }
  } catch (error) {
    console.error("Error creating exchange:", error);
    alert(
      "Failed to create exchange: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  } finally {
    setIsSubmittingExchange(false);
  }
};
```

**Modal JSX:**

```typescript
{selectedPartner && showExchangeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-secondary-900">
          Start Exchange with {selectedPartner.name}
        </h2>
        <button
          onClick={() => {
            setShowExchangeModal(false);
            setSelectedPartner(null);
            setSelectedOfferedSkill('');
            setSelectedRequestedSkill('');
          }}
          className="p-1 hover:bg-secondary-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Skill dropdowns here */}

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => {
            setShowExchangeModal(false);
            setSelectedPartner(null);
            setSelectedOfferedSkill('');
            setSelectedRequestedSkill('');
          }}
          className="flex-1 btn-outline"
        >
          Cancel
        </button>
        <button
          onClick={handleStartExchange}
          disabled={/* see above */}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmittingExchange ? 'Creating...' : 'Create Exchange'}
        </button>
      </div>
    </div>
  </div>
)}
```

---

## API Error Responses

**Successful Creation (201):**

```json
{
  "data": {
    "_id": "exchange123",
    "offeredBy": "user_a_id",
    "requestedBy": "user_b_id",
    "skills": {
      "offered": "skill_1_id",
      "requested": "skill_2_id"
    },
    "status": "pending",
    "messages": [],
    "createdAt": "2026-02-18T12:00:00Z"
  },
  "error": null
}
```

**Invalid Offered Skill (403):**

```json
{
  "data": null,
  "error": "You can only teach skills you have defined in your profile"
}
```

**Invalid Requested Skill (403):**

```json
{
  "data": null,
  "error": "The other user does not teach the skill you want to learn"
}
```

**User Not Found (404):**

```json
{
  "data": null,
  "error": "User not found"
}
```

---

## Testing API Directly (cURL)

**Valid Exchange:**

```bash
curl -X POST http://localhost:3000/api/exchanges \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "USER_B_ID",
    "offeredSkillId": "SKILL_A_HAS",
    "requestedSkillId": "SKILL_B_HAS"
  }'
```

**Invalid Offered Skill (Should Fail):**

```bash
curl -X POST http://localhost:3000/api/exchanges \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "USER_B_ID",
    "offeredSkillId": "SKILL_A_DOESNT_HAVE",
    "requestedSkillId": "SKILL_B_HAS"
  }'
```

---

## Type Definitions

```typescript
// From types/index.ts
interface User {
  _id: string;
  name: string;
  email: string;
  skillsToTeach: Skill[]; // ← Array of skills user can teach
  skillsToLearn: Skill[]; // ← Array of skills user wants to learn
  avatar?: string;
  bio?: string;
  location?: string;
  averageRating: number;
  totalReviews: number;
  // ... other fields
}

interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  description?: string;
  // ... other fields
}

interface Exchange {
  _id: string;
  offeredBy: string; // User ID
  requestedBy: string; // User ID
  skills: {
    offered: string; // Must be in offeredBy.skillsToTeach
    requested: string; // Must be in requestedBy.skillsToTeach
  };
  status: "pending" | "active" | "completed" | "cancelled";
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Troubleshooting Code Examples

**Check if skill validation is working:**

```typescript
// In API response
if (response.status === 403) {
  const error = await response.json();
  if (error.error.includes("skills you have defined")) {
    console.log("✅ Offered skill validation working");
  } else if (error.error.includes("does not teach")) {
    console.log("✅ Requested skill validation working");
  }
}
```

**Debug dropdown population:**

```typescript
// Log current user skills
console.log("User skills to teach:", currentUserSkills);
console.log("Partner skills to teach:", selectedPartner?.skillsToTeach);

// Check if arrays have items
if (currentUserSkills.length === 0) {
  console.log("⚠️ User has no skills to teach");
}
if (
  !selectedPartner?.skillsToTeach ||
  selectedPartner.skillsToTeach.length === 0
) {
  console.log("⚠️ Partner has no skills to teach");
}
```

# 🛡️ Security Specification - 北港溪沼氣發電眾包平台

## 1. Data Invariants
- **User Role**: Every user must have a role defined in `['individual', 'corporate', 'farmer']`.
- **Project Integrity**: Project total amount and targets are system-critical.
- **Investment Linkage**: An investment must always reference a valid `projectId` and `userId`.
- **Timestamp Integrity**: `createdAt` and `updatedAt` must be server-validated.

## 2. The "Dirty Dozen" (Attack Vectors)
1. **Identity Spoofing**: User A attempts to update User B's profile role.
2. **Role Escalation**: User attempts to set their own role to an unauthorized value.
3. **Ghost Project**: User attempts to create a project document without being a system admin.
4. **Funding Tamper**: User attempts to directly increment `currentAmount` on a project without a valid investment transaction.
5. **PII Leak**: Unauthorized user attempts to read the `users` collection to scrape emails.
6. **Negative Investment**: User attempts to "invest" -10,000 to drain funds.
7. **Orphaned Investment**: User creates an investment for a non-existent project ID.
8. **Immutable Violation**: User attempts to change the `userId` or `projectId` of an existing investment.
9. **IoT Forgery**: Non-owned farm attempts to submit IoT power logs for a different farm.
10. **Terminal State Bypass**: User attempts to update a project that is already marked as `completed`.
11. **Shadow Field Injection**: User attempts to add a `isVerified: true` field to their profile to bypass checks.
12. **Query Scraping**: User attempts to list all investments for every user in the platform.

## 3. Test Runner (Draft)
```typescript
// firestore.rules.test.ts (Conceptual)
// 1. FAIL: update /users/targetUid { role: 'farmer' } as different uid
// 2. FAIL: create /projects/newProject { ... } as standard user
// 3. FAIL: create /investments/newInv { amount: -100 }
// 4. PASS: create /users/myUid { role: 'individual' } as myUid
```

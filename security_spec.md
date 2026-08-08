# Security Spec for JanceD Feedback

## 1. Data Invariants
- Anyone can submit feedback anonymously.
- A feedback document MUST have exactly `message` and `createdAt`.
- `message` must be a string <= 5000 chars.
- `createdAt` must be a server timestamp.
- No one can read, update, or delete feedback directly from the client.

## 2. Dirty Dozen Payloads
1. Empty message
2. Message too long (> 5000 chars)
3. Wrong type for message (number, bool, etc.)
4. Missing message
5. Missing createdAt
6. createdAt is a client timestamp instead of server timestamp
7. Contains ghost field `authorId`
8. Contains ghost field `isAdmin`
9. Attempt to update an existing feedback
10. Attempt to delete a feedback
11. Attempt to read a feedback
12. Attempt to list feedbacks

## 3. Test Runner
(Omitted since we aren't using a test environment here, but the invariants are clear.)

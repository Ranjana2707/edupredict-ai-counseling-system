# Security Specification: Counseling Notes

## Data Invariants
1. **Authenticated Users Only**: Only authorized users with a valid UID can create, read, or update notes. Standard unauthenticated users or standard students should be barred from general access to others' notes.
2. **Identification Guard**: Every document ID must match standard regex patterns and be bounded in size to prevent resource exhaustion.
3. **No Self-Assigned Identity**: The `authorId` field must match the authenticated user's actual UID (`request.auth.uid`).
4. **Temporal Consistency**: `createdAt` and `updatedAt` must be synchronized with `request.time`.

## The "Dirty Dozen" Malicious Payloads
These payloads attempt to bypass authorization, inject corrupt data, or spoof identities. All of these must return `PERMISSION_DENIED`.

1. **Spoofed Author ID**: A user tries to create a note under someone else's UID.
2. **Missing Required Fields**: Creating a note without `studentId` or `notes`.
3. **Huge Text Content**: Attempting a Denial of Wallet attack with a 20MB text string in the notes field.
4. **Modified Creation Date**: Overriding `createdAt` with a static past date instead of `request.time`.
5. **No Auth token**: Attempting to query the database anonymously.
6. **Path Traversal / ID Poisoning**: Using a 10KB special-character sequence as `{noteId}`.
7. **Modifying Immortal Fields**: Attempting to update `createdAt` or `studentId` of an existing counseling note.
8. **Student Role Self-Promotion**: A user writing a counselor note but logging their role as `admin`.
9. **Blanket Collection Scrape**: Attempting to query the entire `/counseling_notes` collection without filtering by specific student (for privacy protection).
10. **State Corruption**: Inserting numbers or booleans into string-only text fields.
11. **Shadow Fields injection**: Injecting unmapped parameters like `isSystemAdmin: true` into the document body.
12. **Malicious Regex Injection**: Note IDs that try to inject SQL-like or rule-breaking characters.

## Test Cases Outline
The following test cases are validated against the security rules to ensure they fail with `PERMISSION_DENIED`:
- Writing notes without being signed in.
- Standard students trying to query other students' counseling records.
- Creating a note where `request.auth.uid` does not match the `authorId`.
- Updating a note with a mismatching `updatedAt` value.

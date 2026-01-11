# Username Field Missing from Database Schema

## Issue
The application is trying to use a `username` field in the User model, but this field does not exist in the current database schema. This causes errors when attempting to:
- Query users by username
- Create users with a username field
- Update users with a username field

## Root Cause
The `username` field exists in the Prisma schema definition but has not been applied to the actual database through migrations.

## Affected Areas
1. **API Routes**:
   - `src/app/api/guru/route.js` - POST route creates users with username
   - `src/app/api/guru/[id]/route.js` - PUT route updates users with username
   - Both routes had username functionality temporarily disabled

2. **Frontend Forms**:
   - `src/app/admin/guru/page.js` - Generates and displays auto-generated usernames (G001, G002, etc.)

## Solution Required
The username field needs to be added to the User model in the database. This requires:

1. **Schema Update**: Ensure the schema.prisma file has the username field:
   ```
   model User {
     // ... other fields
     username String? @unique
     // ... other fields
   }
   ```

2. **Database Migration**: Run the appropriate migration commands:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

3. **Re-enable API Functionality**: Uncomment the username-related code in the API routes

## Temporary Workaround
Currently, the username functionality has been commented out in the API routes to prevent errors, but this means:
- Teachers will not have usernames generated
- Login functionality may not work as expected
- Auto-generated username feature is not functional

## Next Steps
1. Run the appropriate Prisma migration commands to add the username field to the database
2. Uncomment the username-related code in both API routes
3. Test the teacher creation and editing functionality
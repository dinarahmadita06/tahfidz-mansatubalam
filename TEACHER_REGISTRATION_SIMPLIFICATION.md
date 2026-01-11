# SIMTAQ Guru Registration Form Simplification

## Overview
This document outlines the changes made to simplify the "Tambah Guru Baru" form in SIMTAQ, focusing on core credentials and auto-generated login information.

## Changes Made

### 1. Frontend Changes (`src/app/admin/guru/page.js`)

#### Form Structure
- **Row 1**: Nama Lengkap | NIP
- **Row 2**: Jenis Kelamin | Tanggal Lahir
- **Row 3**: Username Guru (Otomatis) | Password (Otomatis)
- **Row 4**: Kelas Binaan (Pembina) (optional multi-select)

#### Removed Fields
- Email field (no longer required for login)
- Nomor WhatsApp field
- Alamat field
- Old generate password button (based on name/email)

#### Added Features
- Auto-generate username functionality (G001, G002, etc.)
- Auto-generate password from DOB (YYYY-MM-DD format)
- Auto-update password when DOB changes
- Clear helper text for auto-generated credentials
- Simplified template export

#### Updated Validation
- Email no longer required for form submission
- Date of birth now triggers automatic password update
- Username and password fields are read-only

### 2. Backend Changes (`src/app/api/guru/route.js`)

#### POST Route
- Made email optional in validation
- Generate temporary internal email if none provided
- Maintain email uniqueness validation only when email is provided
- Keep username validation for uniqueness
- Preserve all other validation requirements

#### PUT Route (`src/app/api/guru/[id]/route.js`)
- Made email optional in updates
- Check email uniqueness only when email is provided in update
- Maintain existing email if no new email provided in update
- Keep all other update functionality intact

### 3. Data Export/Import Updates
- Removed email, phone, and address from export template
- Updated import template to match simplified form
- Updated search functionality to exclude email from search criteria

### 4. Table Display Updates
- Replaced email column with NIP column in the teacher listing table
- Updated table headers to match simplified form fields

## Technical Implementation Details

### Auto-Generated Username
- Format: G001, G002, G003, etc.
- Generated using `generateNextTeacherUsername` utility function
- Unique constraint handling with retry logic
- Read-only field in form

### Auto-Generated Password
- Format: YYYY-MM-DD (from date of birth)
- Auto-updates when date of birth changes
- Read-only field in form
- Reset button to restore DOB-based password

### Validation Rules
- Username must be unique (Gxxx format)
- Password must match DOB format (YYYY-MM-DD) when set
- Required fields: name, password, username, jenisKelamin
- Optional fields: nip, kelasIds

## Security Considerations
- Passwords are still properly hashed using bcrypt
- Username uniqueness maintained
- Email validation preserved for existing users
- Temporary internal emails generated when needed

## User Experience Improvements
- Cleaner, more focused form
- Reduced cognitive load
- Faster form completion
- Clearer instructions and helper text
- Consistent with login credential requirements

## Backwards Compatibility
- Existing teacher records remain unaffected
- Login flow continues to work as expected
- API endpoints maintain the same response structure
- Database schema unchanged

## Testing Points
- Verify auto-generated usernames follow G001, G002 pattern
- Confirm password auto-generation from DOB
- Test form submission without email
- Verify updates work correctly
- Ensure existing teachers still function properly
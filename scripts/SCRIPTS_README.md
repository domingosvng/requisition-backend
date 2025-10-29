Dev scripts

scripts/genToken.js
- Generates a JWT using the JWT_SECRET in .env (if present). For local testing only.
- Run: `node scripts/genToken.js`

scripts/testCreateSupplier.js
- Generates an ADMIN JWT using .env secret and POSTs a supplier to /api/suppliers.
- Run: `node scripts/testCreateSupplier.js`

scripts/createAdmin.js
- Uses TypeORM's compiled dist outputs to create/update a user with username 'admin' and role 'ADMIN'.
- Requires the backend to be build (dist) or running with ts-node-dev depending on setup.
- Run: `node scripts/createAdmin.js`

Security
- These scripts are for local development and testing only. Do not run or expose them in production.
- Ensure .env is not committed to version control.

PowerShell notes
- When redirecting output to a file in PowerShell (for example `node scripts/genToken.js > scripts\\last_test_token.txt`), PowerShell may create a UTF-16LE encoded file which can break HTTP headers. Use one of these commands to save as UTF-8 instead:

```powershell
# Write stdout to file as UTF-8
node scripts/genToken.js | Out-File -Encoding utf8 scripts\last_test_token.txt
# Or use Set-Content
node scripts/genToken.js | Set-Content -Encoding UTF8 scripts\last_test_token.txt
```

Admin script notes
- `scripts/createAdmin.js` and `scripts/createAdmin.ts` will now create an admin user with a default password ("admin" / "testadmin") and store a bcrypt hash in the database. Change these passwords after first login.

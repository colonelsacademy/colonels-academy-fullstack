# PowerShell script to make a user admin
# Usage: .\make-admin.ps1 "user@example.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

$env:PGPASSWORD = "postgres"

Write-Host "Checking if user exists..." -ForegroundColor Yellow
psql -h localhost -p 5434 -U postgres -d colonels_academy -c "SELECT id, email, \`"displayName\`", role FROM \`"User\`" WHERE email = '$Email';"

Write-Host "`nUpdating user to ADMIN role..." -ForegroundColor Yellow
psql -h localhost -p 5434 -U postgres -d colonels_academy -c "UPDATE \`"User\`" SET role = 'ADMIN' WHERE email = '$Email';"

Write-Host "`nVerifying the change..." -ForegroundColor Green
psql -h localhost -p 5434 -U postgres -d colonels_academy -c "SELECT id, email, \`"displayName\`", role FROM \`"User\`" WHERE email = '$Email';"

Write-Host "`nDone! User is now an ADMIN." -ForegroundColor Green

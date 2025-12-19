<#
.SYNOPSIS
    User & Group Audit Tool
.DESCRIPTION
    Lists all local users and members of the Administrators group.
    Useful for quick security audits on Windows Servers.
.AUTHOR
    Adrià Montero
#>

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "     WINDOWS USER AUDIT TOOL" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. LIST LOCAL USERS
Write-Host "[+] Local Users Found:" -ForegroundColor Yellow
$users = Get-LocalUser
foreach ($u in $users) {
    $status = if ($u.Enabled) { "Enabled" } else { "Disabled" }
    $color = if ($u.Enabled) { "Green" } else { "Gray" }
    Write-Host "    - $($u.Name) [$status]" -ForegroundColor $color
}

Write-Host ""

# 2. CHECK ADMINISTRATORS GROUP
Write-Host "[+] Members of 'Administrators' Group:" -ForegroundColor Yellow
try {
    $admins = Get-LocalGroupMember -Group "Administrators"
    foreach ($admin in $admins) {
        Write-Host "    - $($admin.Name) ($($admin.ObjectClass))" -ForegroundColor Red
    }
} catch {
    Write-Host "    Error retrieving group members. Run as Admin?" -ForegroundColor Red
}

Write-Host ""
Write-Host "Note: Script finished." -ForegroundColor Cyan

# PowerShell script to replace console.log with winston logger
# This script adds logger import and replaces console statements

$files = @(
    "src\shared\middlewares\checkLogin.js",
    "src\shared\middlewares\checkAdmin.js",
    "src\modules\user\controllers\AdminController.js",
    "src\modules\user\services\AdminService.js",
    "src\modules\user\controllers\AnnouncementController.js",
    "src\modules\user\services\AnnouncementService.js",
    "src\modules\user\services\UserSearchService.js",
    "src\modules\user\services\ProfileService.js",
    "src\modules\user\services\ThumbnailService.js",
    "src\modules\user\controllers\AvatarController.js",
    "src\modules\user\repositories\UserRepository.js",
    "src\shared\services\EmailService.js",
    "src\modules\auth\services\AuthRegisterService.js",
    "src\modules\auth\controllers\AuthRegisterController.js",
    "src\server.js",
    "src\shared\utils\formatDate.js",
    "src\shared\utils\cloudinaryUpload.js",
    "src\shared\database\DBConnection.js"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        # Add logger import if not present (skip for migration scripts and server.js)
        if ($file -notmatch "migrations|server.js") {
            if ($content -notmatch "const\s+logger\s*=\s*require.*logger") {
                # Find first require statement to add logger import after it
                $content = $content -replace '("use strict";[\r\n]+//[-]+[\r\n]+)', "`$1const logger = require('../../shared/utils/logger');`n"
                
                # Alternative: add after first const require
                if ($content -eq $originalContent) {
                    $content = $content -replace '(const\s+\w+\s*=\s*require[^;]+;[\r\n]+)', "`$1const logger = require('../../shared/utils/logger');`n"
                }
            }
        }
        
        # Replace console.error with logger.error
        $content = $content -replace 'console\.error\(', 'logger.error('
        
        # Replace console.log with logger.info
        $content = $content -replace 'console\.log\(', 'logger.info('
        
        # Replace console.warn with logger.warn
        $content = $content -replace 'console\.warn\(', 'logger.warn('
        
        # Only write if changes were made
        if ($content -ne $originalContent) {
            Set-Content $fullPath $content -NoNewline
            Write-Host "  ✓ Updated" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Console.log replacement completed!" -ForegroundColor Green
Write-Host "Note: Please manually verify the logger import path is correct for each file." -ForegroundColor Yellow

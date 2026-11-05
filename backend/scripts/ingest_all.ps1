# Indexes every URL in scripts/ingest_urls.tsv, carries on past failures, then
# prints what failed and the admin stats. Run from backend/ with the venv active
# and the API running. Set $env:API_BASE to use another host.
Set-Location (Join-Path $PSScriptRoot "..")

$Year = "2026-27"
$ApiBase = if ($env:API_BASE) { $env:API_BASE } else { "http://127.0.0.1:8000" }
$ok = 0
$failed = @()

foreach ($row in Get-Content "scripts/ingest_urls.tsv") {
    if (-not $row.Trim()) { continue }
    $category, $url = $row -split "`t"
    Write-Host "--> [$category] $url"
    $output = & { $ErrorActionPreference = "Continue"; python -m app.ingestion.cli --url $url --category $category --academic-year $Year 2>&1 }
    $last = ($output | Select-Object -Last 1).ToString()
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    $last"
        $ok++
    } else {
        Write-Host "    FAILED: $last"
        $failed += "$url  ->  $last"
    }
}

Write-Host ""
Write-Host "Indexed: $ok   Failed: $($failed.Count)"
$failed | ForEach-Object { Write-Host "  $_" }

$key = ((Select-String -Path ".env" -Pattern "^ADMIN_API_KEY=").Line -split "=", 2)[1]
Write-Host ""
Write-Host "GET /api/admin/stats"
try {
    Invoke-RestMethod -Uri "$ApiBase/api/admin/stats" -Headers @{ Authorization = "Bearer $key" } | ConvertTo-Json
} catch {
    Write-Host "API not reachable at $ApiBase"
}

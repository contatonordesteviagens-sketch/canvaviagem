$path = Join-Path $PSScriptRoot 'src\pages\fabrica\Phase4LandingBuilderES.tsx'
$content = [System.IO.File]::ReadAllText($path)
# Replace the literal 2-char sequence backslash+doublequote with just a doublequote
$fixed = $content.Replace('\\"', '"')
[System.IO.File]::WriteAllText($path, $fixed)
$diff = $content.Length - $fixed.Length
Write-Host "Done. Diff = $diff chars."

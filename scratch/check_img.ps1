
Add-Type -AssemblyName System.Drawing
$imagePath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\public\logo.png"
$img = [System.Drawing.Image]::FromFile($imagePath)
Write-Host "Width: $($img.Width)"
Write-Host "Height: $($img.Height)"
$img.Dispose()

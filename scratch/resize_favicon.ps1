
Add-Type -AssemblyName System.Drawing
$imagePath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\public\logo.png"
$outputPath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\public\favicon.png"
$iconPath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\public\icon.png"
$applePath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\app\apple-icon.png"
$appIconPath = "C:\Users\user\.gemini\antigravity\scratch\hicarz-clone\app\icon.png"

$img = [System.Drawing.Image]::FromFile($imagePath)

# Target a 300% zoom (approx 1/3 of the dimensions)
# Center of 1024x576 is (512, 288)
# We want a square crop for favicon
$cropSize = [int]($img.Height / 1.5) # Try roughly 1.5x zoom first to be safe, or 3x? 
# User said 300% larger. So 1/3 size.
$cropSize = [int]($img.Height / 2) # 576 / 2 = 288. 

$sourceRect = New-Object System.Drawing.Rectangle( [int](512 - $cropSize/2), [int](288 - $cropSize/2), $cropSize, $cropSize )
$destRect = New-Object System.Drawing.Rectangle( 0, 0, 512, 512 ) # Save as 512x512

$bmp = New-Object System.Drawing.Bitmap( 512, 512 )
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($applePath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($appIconPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Favicon updated with 300% zoom (cropped to center square)"

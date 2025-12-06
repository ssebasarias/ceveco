Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param (
        [string]$FilePath,
        [int]$Quality = 75
    )

    $image = [System.Drawing.Image]::FromFile($FilePath)
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)

    $newPath = [System.IO.Path]::ChangeExtension($FilePath, ".jpg")
    
    $image.Save($newPath, $encoder, $encoderParams)
    $image.Dispose()
    
    Write-Host "Optimized: $FilePath -> $newPath"
}

# Directories to process
$dirs = @(
    "frontend/assets/img/banner-hero",
    "frontend/assets/img/banner-category",
    "frontend/assets/img/categories"
)

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Filter *.png | ForEach-Object {
            Optimize-Image -FilePath $_.FullName
        }
    }
}

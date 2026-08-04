$content = Get-Content -Raw 'src/components/fabrica/F1CarouselBuilder.tsx'
$content = $content -replace '<Instagram\r?\n', "<Instagram strokeWidth={1.5}
"
$content = $content -replace '<Mail\r?\n', "<Mail strokeWidth={1.5}
"
Set-Content -Path 'src/components/fabrica/F1CarouselBuilder.tsx' -Value $content

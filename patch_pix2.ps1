$content = Get-Content -Raw 'src/components/fabrica/F1CarouselBuilder.tsx'
$content = $content -replace '<CarouselCanvas\r?\n\s*key=\{export', "<CarouselCanvas
              showPixBanner={(state as any).showPixBanner}
              pixBannerText={(state as any).pixBannerText}
              key={export"
Set-Content -Path 'src/components/fabrica/F1CarouselBuilder.tsx' -Value $content

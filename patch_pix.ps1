$content = Get-Content -Raw 'src/components/fabrica/F1CarouselBuilder.tsx'

$content = $content -replace 'exportMode = false,\r?\n\}: \{', "exportMode = false,
  showPixBanner = false,
  pixBannerText = "",
}: {"
$content = $content -replace 'exportMode\?: boolean;\r?\n\}\) \{', "exportMode?: boolean;
  showPixBanner?: boolean;
  pixBannerText?: string;
}) {"

$content = $content -replace 'width: number;\r?\n\} \{', "width: number;
  showPixBanner?: boolean;
  pixBannerText?: string;
} {"
$content = $content -replace 'function ScaledSlidePreview\(\{', "function ScaledSlidePreview({
  showPixBanner,
  pixBannerText,"
$content = $content -replace '<CarouselCanvas\r?\n\s*slide=\{slide\}', "<CarouselCanvas
        showPixBanner={showPixBanner}
        pixBannerText={pixBannerText}
        slide={slide}"

$content = $content -replace '<ScaledSlidePreview\r?\n', "<ScaledSlidePreview
                      showPixBanner={(state as any).showPixBanner}
                      pixBannerText={(state as any).pixBannerText}
"
$content = $content -replace '<CarouselCanvas\r?\n\s*key=\{export', "<CarouselCanvas
            showPixBanner={(state as any).showPixBanner}
            pixBannerText={(state as any).pixBannerText}
            key={export"

Set-Content -Path 'src/components/fabrica/F1CarouselBuilder.tsx' -Value $content

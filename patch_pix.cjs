const fs = require('fs');
let code = fs.readFileSync('src/components/fabrica/F1CarouselBuilder.tsx', 'utf8');

// 1. Add props to CarouselCanvas
code = code.replace(/exportMode = false,\n\}: \{/, 'exportMode = false,\n  showPixBanner = false,\n  pixBannerText = "",\n}: {');
code = code.replace(/exportMode\?: boolean;\n\}\) \{/, 'exportMode?: boolean;\n  showPixBanner?: boolean;\n  pixBannerText?: string;\n}) {');

// 2. Add props to ScaledSlidePreview
code = code.replace(/width: number;\n\} \{/g, 'width: number;\n  showPixBanner?: boolean;\n  pixBannerText?: string;\n} {');
code = code.replace(/function ScaledSlidePreview\(\{/g, 'function ScaledSlidePreview({\n  showPixBanner,\n  pixBannerText,');
code = code.replace(/<CarouselCanvas\n\s*slide=\{slide\}/g, '<CarouselCanvas\n        showPixBanner={showPixBanner}\n        pixBannerText={pixBannerText}\n        slide={slide}');

// 3. Render banner
const bannerStr =         {showPixBanner && slide.kind === "closing" && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: Math.round(30 * Z), background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(10 * Z), fontWeight: 900, zIndex: 50 }}>
            <span style={{ color: "#F5F906", marginRight: "4px" }}>PIX OU BOLETO:</span> {pixBannerText || "Consulte descontos"}
          </div>
        )}
      </div>
    );
  };

code = code.replace(/\{renderPositionedLogo\(\)\}\s*<\/div>\s*\);\s*\}/, '{renderPositionedLogo()}\n' + bannerStr);

// 4. Pass from F1CarouselBuilder to ScaledSlidePreview and CarouselCanvas instances
code = code.replace(/<ScaledSlidePreview\n/g, '<ScaledSlidePreview\n                      showPixBanner={(state as any).showPixBanner}\n                      pixBannerText={(state as any).pixBannerText}\n');
code = code.replace(/<CarouselCanvas\n\s*key=\{export/g, '<CarouselCanvas\n            showPixBanner={(state as any).showPixBanner}\n            pixBannerText={(state as any).pixBannerText}\n            key={export');

fs.writeFileSync('src/components/fabrica/F1CarouselBuilder.tsx', code);

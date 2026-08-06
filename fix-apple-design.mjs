import fs from "fs";
const applyAppleDesign = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  content = content.replace(/active:scale-\[0\.98\]/g, "active:scale-[0.97]");
  content = content.replace(/duration-200/g, "duration-150 ease-out");
  content = content.replace(/duration-300/g, "duration-150 ease-out");
  content = content.replace(/hover:scale-\[1\.02\]/g, "");
  fs.writeFileSync(filePath, content, "utf-8");
};
applyAppleDesign("src/components/fabrica/F1CarouselBuilder.tsx");

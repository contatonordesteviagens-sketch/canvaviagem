import fs from "fs";

function fixDoubleEncoding(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  // Check if it actually contains Ã to avoid corrupting a healthy file
  if (!text.includes("Ã")) {
    console.log("File does not appear to be double-encoded.", filePath);
    return;
  }
  const buffer = Buffer.from(text, "latin1");
  const fixedText = buffer.toString("utf-8");
  fs.writeFileSync(filePath, fixedText, "utf-8");
  console.log("Fixed encoding for", filePath);
}

fixDoubleEncoding("src/components/fabrica/F1CarouselBuilder.tsx");

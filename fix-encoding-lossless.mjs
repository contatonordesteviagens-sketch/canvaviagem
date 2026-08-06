import fs from "fs";

const cp1252 = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87,
  '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91,
  '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97, '\u02DC': 0x98,
  '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

function fixDoubleEncodingLossless(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  
  if (!text.includes("Ã")) {
    console.log("No Ã found in", filePath);
    return;
  }

  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    if (cp1252[char] !== undefined) {
      bytes.push(cp1252[char]);
    } else if (code < 256) {
      bytes.push(code);
    } else {
      // If there are native UTF-8 characters that were NOT double encoded (maybe typed later),
      // we need to preserve them. The easiest way is to convert them to UTF-8 bytes.
      // However, usually the entire file is just Windows-1252 bytes.
      // Let's assume the file was completely corrupted.
      const charBytes = Buffer.from(char, 'utf-8');
      for (let j = 0; j < charBytes.length; j++) {
        bytes.push(charBytes[j]);
      }
    }
  }

  const buffer = Buffer.from(bytes);
  const fixedText = buffer.toString("utf-8");
  fs.writeFileSync(filePath, fixedText, "utf-8");
  console.log("Fixed encoding losslessly for", filePath);
}

fixDoubleEncodingLossless("src/components/fabrica/F1CarouselBuilder.tsx");

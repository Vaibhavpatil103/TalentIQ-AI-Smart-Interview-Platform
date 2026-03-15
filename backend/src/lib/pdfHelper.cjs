const { getDocument } = require("pdfjs-dist/legacy/build/pdf.mjs");

async function extractPdfText(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const doc = await getDocument({ data: uint8Array }).promise;

  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

module.exports = { extractPdfText };

type PdfTextItem = {
  str?: string;
  hasEOL?: boolean;
};

export async function extractPdfText(file: File, maxPages = 80) {
  const [pdfjsLib, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
  ]);

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  const pagesToRead = Math.min(pdf.numPages, maxPages);
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => {
        const textItem = item as PdfTextItem;
        return `${textItem.str || ""}${textItem.hasEOL ? "\n" : " "}`;
      })
      .join("")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (text) {
      pageTexts.push(`--- Page ${pageNumber} ---\n${text}`);
    }
  }

  const suffix = pdf.numPages > pagesToRead
    ? `\n\n[PDF truncated after ${pagesToRead} of ${pdf.numPages} pages. Upload a smaller section for more focused citations.]`
    : "";

  return `${pageTexts.join("\n\n")}${suffix}`.trim();
}

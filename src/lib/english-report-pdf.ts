import "server-only";

import {
  PDFDocument,
  PDFPage,
  PDFFont,
  rgb,
  StandardFonts,
  type RGB,
} from "pdf-lib";
import type { buildEnglishReport } from "@/lib/english-report";

type Report = ReturnType<typeof buildEnglishReport>;
type PdfMeta = {
  generatedAt: Date;
  accessExpiresAt: Date;
  recoveryCode: string | null;
};

const PAGE = { width: 595.28, height: 841.89, margin: 48 };
const colors = {
  ink: rgb(0.15, 0.13, 0.12),
  muted: rgb(0.42, 0.39, 0.37),
  paper: rgb(0.985, 0.972, 0.94),
  white: rgb(1, 1, 1),
  coral: rgb(0.88, 0.35, 0.28),
  coralSoft: rgb(0.98, 0.87, 0.82),
  teal: rgb(0.12, 0.45, 0.44),
  tealSoft: rgb(0.84, 0.93, 0.91),
  sand: rgb(0.9, 0.84, 0.72),
  line: rgb(0.84, 0.8, 0.74),
};

function splitText(text: string, font: PDFFont, size: number, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    font: PDFFont;
    size: number;
    color?: RGB;
    lineHeight?: number;
  },
) {
  const lineHeight = options.lineHeight ?? options.size * 1.4;
  const lines = splitText(text, options.font, options.size, options.width);
  lines.forEach((line, index) =>
    page.drawText(line, {
      x: options.x,
      y: options.y - index * lineHeight,
      size: options.size,
      font: options.font,
      color: options.color ?? colors.ink,
    }),
  );
  return options.y - lines.length * lineHeight;
}

function drawFooter(page: PDFPage, pageNumber: number, regular: PDFFont) {
  page.drawLine({
    start: { x: PAGE.margin, y: 35 },
    end: { x: PAGE.width - PAGE.margin, y: 35 },
    thickness: 0.6,
    color: colors.line,
  });
  page.drawText("FutariShiru - Private connection report", {
    x: PAGE.margin,
    y: 20,
    size: 8,
    font: regular,
    color: colors.muted,
  });
  page.drawText(String(pageNumber), {
    x: PAGE.width - PAGE.margin - 8,
    y: 20,
    size: 8,
    font: regular,
    color: colors.muted,
  });
}

function addPage(pdf: PDFDocument, pageNumber: number, regular: PDFFont) {
  const page = pdf.addPage([PAGE.width, PAGE.height]);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: colors.paper,
  });
  drawFooter(page, pageNumber, regular);
  return page;
}

function drawSectionTitle(
  page: PDFPage,
  eyebrow: string,
  title: string,
  bold: PDFFont,
  regular: PDFFont,
) {
  page.drawText(eyebrow.toUpperCase(), {
    x: PAGE.margin,
    y: 784,
    size: 9,
    font: bold,
    color: colors.coral,
  });
  page.drawText(title, {
    x: PAGE.margin,
    y: 750,
    size: 25,
    font: bold,
    color: colors.ink,
  });
  page.drawLine({
    start: { x: PAGE.margin, y: 730 },
    end: { x: PAGE.width - PAGE.margin, y: 730 },
    thickness: 1,
    color: colors.line,
  });
  page.drawText("FutariShiru", {
    x: PAGE.width - PAGE.margin - 62,
    y: 784,
    size: 9,
    font: regular,
    color: colors.muted,
  });
}

function drawBar(
  page: PDFPage,
  label: string,
  value: number,
  y: number,
  regular: PDFFont,
  bold: PDFFont,
) {
  page.drawText(label, {
    x: PAGE.margin,
    y,
    size: 10,
    font: regular,
    color: colors.ink,
  });
  const barX = 205;
  const barWidth = 275;
  page.drawRectangle({
    x: barX,
    y: y - 2,
    width: barWidth,
    height: 10,
    color: colors.coralSoft,
  });
  page.drawRectangle({
    x: barX,
    y: y - 2,
    width: Math.max(3, (barWidth * value) / 100),
    height: 10,
    color: colors.coral,
  });
  page.drawText(`${value}%`, {
    x: 490,
    y,
    size: 10,
    font: bold,
    color: colors.ink,
  });
}

export async function createEnglishReportPdf(report: Report, meta: PdfMeta) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(`${report.creator} and ${report.partner} - FutariShiru Report`);
  pdf.setAuthor("FutariShiru");
  pdf.setSubject("A private two-person connection report");
  pdf.setCreator("FutariShiru");
  pdf.setCreationDate(meta.generatedAt);

  let pageNumber = 1;
  let page = addPage(pdf, pageNumber++, regular);
  page.drawCircle({
    x: 500,
    y: 750,
    size: 125,
    color: colors.coralSoft,
    opacity: 0.7,
  });
  page.drawCircle({
    x: 80,
    y: 90,
    size: 100,
    color: colors.tealSoft,
    opacity: 0.65,
  });
  page.drawText("FUTARISHIRU", {
    x: PAGE.margin,
    y: 786,
    size: 11,
    font: bold,
    color: colors.coral,
  });
  page.drawText("YOUR CONNECTION REPORT", {
    x: PAGE.margin,
    y: 755,
    size: 9,
    font: bold,
    color: colors.muted,
  });
  let y = drawWrapped(page, report.headline, {
    x: PAGE.margin,
    y: 690,
    width: 455,
    font: bold,
    size: 31,
    lineHeight: 37,
  });
  y -= 22;
  page.drawText(`${report.creator}  +  ${report.partner}`, {
    x: PAGE.margin,
    y,
    size: 16,
    font: bold,
    color: colors.teal,
  });
  y -= 60;
  page.drawText("VALUES ALIGNMENT", {
    x: PAGE.margin,
    y,
    size: 9,
    font: bold,
    color: colors.muted,
  });
  page.drawText(`${report.score}%`, {
    x: PAGE.margin,
    y: y - 74,
    size: 66,
    font: bold,
    color: colors.coral,
  });
  page.drawText(report.label, {
    x: 205,
    y: y - 52,
    size: 16,
    font: bold,
    color: colors.ink,
  });
  drawWrapped(page, report.summary, {
    x: 205,
    y: y - 78,
    width: 320,
    font: regular,
    size: 10.5,
    lineHeight: 15,
    color: colors.muted,
  });
  const cardY = 320;
  [
    {
      x: PAGE.margin,
      name: report.creator,
      style: report.creatorProfile.style.name,
      tagline: report.creatorProfile.style.tagline,
    },
    {
      x: 310,
      name: report.partner,
      style: report.partnerProfile.style.name,
      tagline: report.partnerProfile.style.tagline,
    },
  ].forEach((card) => {
    page.drawRectangle({
      x: card.x,
      y: cardY - 140,
      width: 237,
      height: 150,
      color: colors.white,
      borderColor: colors.line,
      borderWidth: 0.7,
    });
    page.drawText(card.name, {
      x: card.x + 18,
      y: cardY - 22,
      size: 10,
      font: bold,
      color: colors.teal,
    });
    drawWrapped(page, card.style, {
      x: card.x + 18,
      y: cardY - 50,
      width: 200,
      font: bold,
      size: 15,
      lineHeight: 18,
    });
    drawWrapped(page, card.tagline, {
      x: card.x + 18,
      y: cardY - 94,
      width: 200,
      font: regular,
      size: 9.5,
      lineHeight: 13,
      color: colors.muted,
    });
  });
  page.drawText(
    `Generated ${meta.generatedAt.toLocaleDateString("en-US")}  |  Web access through ${meta.accessExpiresAt.toLocaleDateString("en-US")}`,
    {
      x: PAGE.margin,
      y: 104,
      size: 9,
      font: regular,
      color: colors.muted,
    },
  );
  if (meta.recoveryCode) {
    page.drawText(`Recovery code: ${meta.recoveryCode}`, {
      x: PAGE.margin,
      y: 82,
      size: 9,
      font: bold,
      color: colors.ink,
    });
    page.drawText(
      "Keep this PDF private. Anyone with this code can reopen the report.",
      {
        x: PAGE.margin,
        y: 66,
        size: 8,
        font: regular,
        color: colors.muted,
      },
    );
  }

  page = addPage(pdf, pageNumber++, regular);
  drawSectionTitle(
    page,
    "Your relationship",
    "Four dimensions, side by side",
    bold,
    regular,
  );
  y = 680;
  report.creatorProfile.axes.forEach((creatorAxis) => {
    const partnerAxis = report.partnerProfile.axes.find(
      (axis) => axis.key === creatorAxis.key,
    )!;
    page.drawText(creatorAxis.name, {
      x: PAGE.margin,
      y,
      size: 12,
      font: bold,
      color: colors.ink,
    });
    page.drawText(`${creatorAxis.shortLabel}  /  ${partnerAxis.shortLabel}`, {
      x: 240,
      y,
      size: 9,
      font: regular,
      color: colors.muted,
    });
    const trackY = y - 24;
    page.drawLine({
      start: { x: 120, y: trackY },
      end: { x: 475, y: trackY },
      thickness: 3,
      color: colors.line,
    });
    page.drawCircle({
      x: 120 + ((creatorAxis.position + 100) / 200) * 355,
      y: trackY,
      size: 6,
      color: colors.coral,
    });
    page.drawCircle({
      x: 120 + ((partnerAxis.position + 100) / 200) * 355,
      y: trackY,
      size: 6,
      color: colors.teal,
    });
    page.drawText(report.creator, {
      x: 48,
      y: trackY - 3,
      size: 8,
      font: regular,
      color: colors.coral,
    });
    page.drawText(report.partner, {
      x: 488,
      y: trackY - 3,
      size: 8,
      font: regular,
      color: colors.teal,
    });
    y -= 92;
  });
  page.drawText("ALIGNMENT BY TOPIC", {
    x: PAGE.margin,
    y: 300,
    size: 9,
    font: bold,
    color: colors.coral,
  });
  y = 270;
  report.categoryScores.forEach((item) => {
    drawBar(page, item.category, item.score, y, regular, bold);
    y -= 27;
  });

  page = addPage(pdf, pageNumber++, regular);
  drawSectionTitle(
    page,
    "Full report",
    "Your relationship playbook",
    bold,
    regular,
  );
  y = 690;
  report.playbook.forEach((item, index) => {
    const boxHeight = 118;
    page.drawRectangle({
      x: PAGE.margin,
      y: y - boxHeight + 18,
      width: PAGE.width - PAGE.margin * 2,
      height: boxHeight,
      color: index % 2 ? colors.tealSoft : colors.coralSoft,
      opacity: 0.7,
    });
    page.drawText(item.title, {
      x: PAGE.margin + 18,
      y,
      size: 13,
      font: bold,
      color: colors.ink,
    });
    drawWrapped(page, item.text, {
      x: PAGE.margin + 18,
      y: y - 27,
      width: PAGE.width - PAGE.margin * 2 - 36,
      font: regular,
      size: 9.5,
      lineHeight: 14,
      color: colors.muted,
    });
    y -= 130;
  });
  page.drawText("YOUR NEXT 7 DAYS", {
    x: PAGE.margin,
    y: 172,
    size: 9,
    font: bold,
    color: colors.coral,
  });
  y = 145;
  report.actions.forEach((action, index) => {
    page.drawCircle({ x: 58, y: y + 2, size: 10, color: colors.coral });
    page.drawText(String(index + 1), {
      x: 55,
      y: y - 1,
      size: 8,
      font: bold,
      color: colors.white,
    });
    drawWrapped(page, action, {
      x: 78,
      y: y + 6,
      width: 450,
      font: regular,
      size: 9.5,
      lineHeight: 13,
    });
    y -= 38;
  });

  const groups = Array.from({ length: 4 }, (_, index) =>
    report.comparison.slice(index * 6, index * 6 + 6),
  );
  groups.forEach((items, groupIndex) => {
    page = addPage(pdf, pageNumber++, regular);
    drawSectionTitle(
      page,
      `All 24 answers - ${groupIndex + 1} of 4`,
      "Compare every answer",
      bold,
      regular,
    );
    y = 690;
    items.forEach((item) => {
      page.drawText(`${item.id.toUpperCase()}  ${item.category}`, {
        x: PAGE.margin,
        y,
        size: 8,
        font: bold,
        color: item.same ? colors.teal : colors.coral,
      });
      y = drawWrapped(page, item.question, {
        x: PAGE.margin,
        y: y - 22,
        width: 485,
        font: bold,
        size: 11,
        lineHeight: 14,
      });
      y -= 4;
      y = drawWrapped(page, `${report.creator}: ${item.creatorAnswer}`, {
        x: PAGE.margin + 10,
        y,
        width: 475,
        font: regular,
        size: 9,
        lineHeight: 12,
        color: colors.muted,
      });
      y = drawWrapped(page, `${report.partner}: ${item.partnerAnswer}`, {
        x: PAGE.margin + 10,
        y: y - 2,
        width: 475,
        font: regular,
        size: 9,
        lineHeight: 12,
        color: colors.muted,
      });
      page.drawLine({
        start: { x: PAGE.margin, y: y - 8 },
        end: { x: PAGE.width - PAGE.margin, y: y - 8 },
        thickness: 0.5,
        color: colors.line,
      });
      y -= 29;
    });
  });

  page = addPage(pdf, pageNumber++, regular);
  drawSectionTitle(
    page,
    "A note for both of you",
    "Use this as a conversation starter",
    bold,
    regular,
  );
  y = drawWrapped(
    page,
    "A match percentage is not a grade. Similar answers can create ease, while different answers can create insight. What matters most is whether you can stay curious about the reason behind each choice.",
    {
      x: PAGE.margin,
      y: 680,
      width: 490,
      font: regular,
      size: 15,
      lineHeight: 23,
      color: colors.ink,
    },
  );
  y -= 36;
  page.drawRectangle({
    x: PAGE.margin,
    y: y - 190,
    width: PAGE.width - PAGE.margin * 2,
    height: 190,
    color: colors.white,
    borderColor: colors.line,
    borderWidth: 0.7,
  });
  page.drawText("THREE QUESTIONS TO KEEP TALKING", {
    x: PAGE.margin + 22,
    y: y - 30,
    size: 9,
    font: bold,
    color: colors.coral,
  });
  [
    "If you could design your ideal free day, what would it look like?",
    "When do you feel most noticed or cared for?",
    "What is one new thing you would like to try together?",
  ].forEach((question, index) => {
    drawWrapped(page, `${index + 1}. ${question}`, {
      x: PAGE.margin + 22,
      y: y - 68 - index * 42,
      width: 445,
      font: bold,
      size: 11,
      lineHeight: 15,
    });
  });
  drawWrapped(
    page,
    "This report is designed for entertainment and conversation. It is not a psychological or medical diagnosis and does not evaluate the quality of your relationship.",
    {
      x: PAGE.margin,
      y: 300,
      width: 490,
      font: regular,
      size: 10,
      lineHeight: 15,
      color: colors.muted,
    },
  );
  page.drawText("playfutarishiru.com", {
    x: PAGE.margin,
    y: 205,
    size: 16,
    font: bold,
    color: colors.teal,
  });

  return pdf.save();
}

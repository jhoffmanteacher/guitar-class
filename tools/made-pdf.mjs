/* made-pdf.mjs — the smallest real pdf pdf.js reads text from (2026-11-18): one page, these lines in Courier 11, one
   under the other. For the tools that need a MADE-UP chord sheet (chord lines, [headers], made-up words; never a real
   lyric): tools/sheet-align-test.mjs, tools/song-builder-sim.mjs, tools/console-layout-smoke.mjs.
   madePdf([]) is a pdf with no text at all (a scan, as far as the readers can tell). */
export function madePdf(lines){
  const esc = t => t.replace(/[\\()]/g, m => '\\' + m);
  const body = 'BT /F1 11 Tf 13 TL 72 740 Td ' + lines.map(l => `(${esc(l)}) Tj T*`).join(' ') + ' ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>', `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
  let out = '%PDF-1.4\n'; const at = [];
  objs.forEach((o, i) => { at.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + at.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(out, 'latin1'));
}

import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { TEMPLATES_DIR } from './paths';

export function createSampleDocxTemplate(): string {
  const samplePath = path.join(TEMPLATES_DIR, 'sample_template.docx');

  if (fs.existsSync(samplePath)) {
    return samplePath;
  }

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="2B6CB0"/>
        </w:rPr>
        <w:t>OFFER LETTER / EMPLOYMENT AGREEMENT</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t>Date: {{date}}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t>To,</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:b/><w:t>{{name}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Email: {{email}} | Phone: {{phone}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Address: {{address}}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t>Dear {{name}},</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:t>We are pleased to offer you the position of </w:t>
      </w:r>
      <w:r>
        <w:b/><w:t>{{designation}}</w:t>
      </w:r>
      <w:r>
        <w:t> at </w:t>
      </w:r>
      <w:r>
        <w:b/><w:t>{{company}}</w:t>
      </w:r>
      <w:r>
        <w:t>. We were extremely impressed with your experience and qualifications.</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:t>Your compensation package for this role will be </w:t>
      </w:r>
      <w:r>
        <w:b/><w:t>{{salary}}</w:t>
      </w:r>
      <w:r>
        <w:t> per annum. We look forward to welcoming you to our team on {{date}}.</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t>Sincerely,</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:b/><w:t>{{company}} Human Resources</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

  const zip = new PizZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', relsXml);
  zip.file('word/_rels/document.xml.rels', docRelsXml);
  zip.file('word/document.xml', documentXml);

  const buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(samplePath, buffer);
  console.log(`✅ Sample docx template generated at ${samplePath}`);
  return samplePath;
}

if (require.main === module || process.argv[1]?.includes('createSampleDocx')) {
  createSampleDocxTemplate();
}

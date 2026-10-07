// Generates src/assets/pdfs/xfa-form-example.pdf: a self-made XFA form with
// every kind of field, for the showcase's forms demo and the e2e tests. We
// wrote every byte of it, so there are no copyright issues - this script is the
// proof.
//
//   node pdf-creator/make-xfa-form.mjs
//
// pdf.js renders a PDF as a "pure XFA" form when its catalog says
// /NeedsRendering true and its AcroForm has an /XFA entry but no /Fields.
//
// Page 2 has a second field called FamilyName on purpose: the forms demo shows
// what happens when an unqualified field name is ambiguous.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, PDFName, PDFBool } from 'pdf-lib';

const font = '<font typeface="Helvetica" size="11pt"/>';
/** pdf.js draws no frame around a field unless the template asks for one. */
const frame = '<border><edge thickness="0.5pt"/></border>';
const caption = (text, reserve = '2.2in') => `<caption reserve="${reserve}"><value><text>${text}</text></value></caption>`;

// For debugging: OMIT=Color,Photo leaves these fields out; OUT=path writes elsewhere.
const omitted = new Set((process.env.OMIT ?? '').split(',').filter(Boolean));

/** A labeled field with the given <ui> element. */
const field = (name, label, ui, { w = '5.5in', h = '0.4in', extra = '' } = {}) => omitted.has(name) ? '' : `
      <field name="${name}" w="${w}" h="${h}">
        <margin bottomInset="0.06in"/>
        ${caption(label)}
        <ui>${ui}</ui>
        ${extra}
        ${font}
      </field>`;

/** A list of choices: `display` is what the user sees, `save` what's stored. */
const items = (display, save) => `
        <items>${display.map((d) => `<text>${d}</text>`).join('')}</items>
        <items save="1" presence="hidden">${save.map((s) => `<text>${s}</text>`).join('')}</items>`;

const heading = (name, text, size = '15pt') => `
      <draw name="${name}" w="7.5in" h="0.5in">
        <value><text>${text}</text></value>
        <font typeface="Helvetica" size="${size}" weight="bold"/>
      </draw>`;

const radioButton = (name, label, value) => `
        <field name="${name}" w="1.3in" h="0.4in">
          <caption reserve="0.8in" placement="right"><value><text>${label}</text></value></caption>
          <ui><checkButton shape="round" size="12pt">${frame}</checkButton></ui>
          <items><text>${value}</text></items>
          ${font}
        </field>`;

const XDP = `<?xml version="1.0" encoding="UTF-8"?>
<xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/">
<template xmlns="http://www.xfa.org/schema/xfa-template/3.3/">
  <subform name="form1" layout="tb" locale="en_US">
    <pageSet>
      <pageArea name="Page" id="Page">
        <occur min="1" max="-1"/>
        <contentArea x="0.5in" y="0.5in" w="7.5in" h="10in"/>
        <medium stock="letter" short="8.5in" long="11in"/>
      </pageArea>
    </pageSet>
    <subform name="applicant" w="7.5in" layout="tb">
      ${heading('title', 'Membership application (an XFA form)', '18pt')}
      <draw name="intro" w="7.5in" h="0.45in">
        <value><text>A demo form for ngx-extended-pdf-viewer with every kind of XFA field.</text></value>
        ${font}
      </draw>
      ${heading('textHeading', 'Text and numbers')}
      ${field('FamilyName', 'Family name', `<textEdit>${frame}</textEdit>`)}
      ${field('GivenName', 'Given name', `<textEdit>${frame}</textEdit>`)}
      ${field('Comments', 'Comments (several lines)', `<textEdit multiLine="1">${frame}</textEdit>`, { h: '0.9in' })}
      ${field('BirthYear', 'Year of birth (a number)', `<numericEdit>${frame}</numericEdit>`, { w: '3.5in' })}
      ${field('MemberSince', 'Member since (a date)', `<dateTimeEdit>${frame}</dateTimeEdit>`, { w: '3.5in', extra: '<value><date/></value>' })}
      ${field('Password', 'Password', `<passwordEdit passwordChar="*">${frame}</passwordEdit>`, { w: '4in' })}
      ${field('PostalCode', 'Postal code (one box per digit)', `<textEdit><comb numberOfCells="5"/>${frame}</textEdit>`, { w: '3.7in', extra: '<value><text maxChars="5"/></value>' })}
    </subform>
    <subform name="choices" w="7.5in" layout="tb">
      <!-- pdf.js can't break an overflowing page on its own here, so every page starts explicitly -->
      <breakBefore targetType="pageArea" target="#Page"/>
      ${heading('choiceHeading', 'Choices', '18pt')}
      ${field('Language', 'Language (a dropdown)', `<choiceList open="onEntry">${frame}</choiceList>`, { w: '4.2in', extra: items(['English', 'French', 'German'], ['en', 'fr', 'de']) })}
      ${field('Size', 'T-shirt size (a list)', `<choiceList open="always">${frame}</choiceList>`, { w: '4.2in', h: '0.9in', extra: items(['Small', 'Medium', 'Large'], ['S', 'M', 'L']) })}
      ${field('Topics', 'Topics (several choices)', `<choiceList open="multiSelect">${frame}</choiceList>`, { w: '4.2in', h: '1in', extra: items(['News', 'Releases', 'Security', 'Events'], ['news', 'releases', 'security', 'events']) })}
      ${field('Color', 'Favorite color (pick or type)', `<choiceList open="onEntry" textEntry="1">${frame}</choiceList>`, { w: '4.2in', extra: items(['Red', 'Green', 'Blue'], ['red', 'green', 'blue']) })}
      ${field('Newsletter', 'Send me the newsletter', `<checkButton size="12pt">${frame}</checkButton>`, { w: '2.6in', extra: '<items><text>1</text><text>0</text></items>' })}
      <draw name="contactQuestion" w="7.5in" h="0.35in">
        <value><text>How may we contact you?</text></value>
        ${font}
      </draw>
      <exclGroup name="ContactBy" w="7.5in" h="0.45in" layout="lr-tb">
        ${radioButton('Email', 'E-mail', 'email')}
        ${radioButton('Phone', 'Phone', 'phone')}
        ${radioButton('Mail', 'Letter', 'mail')}
      </exclGroup>
    </subform>
    <subform name="contact" w="7.5in" layout="tb">
      <breakBefore targetType="pageArea" target="#Page"/>
      ${heading('contactTitle', 'Emergency contact', '18pt')}
      <draw name="contactIntro" w="7.5in" h="0.6in">
        <value><text>This page has a second field called FamilyName - the forms demo shows what happens with ambiguous field names.</text></value>
        ${font}
      </draw>
      ${field('FamilyName', 'Family name of the contact', `<textEdit>${frame}</textEdit>`)}
      ${heading('otherHeading', 'Fields without a typed value')}
      ${field('Photo', 'Photo (an image field)', `<imageEdit>${frame}</imageEdit>`, { w: '4.2in', h: '1.2in' })}
      ${field('Signature', 'Signature (a signature field)', `<signature>${frame}</signature>`, { w: '5.5in', h: '0.8in' })}
      <field name="Submit" w="2in" h="0.45in">
        <ui><button/></ui>
        <!-- Every caption needs a reserve: without one, pdf.js measures the text and needs embedded fonts for that. -->
        <caption reserve="2in"><value><text>Submit (a push button)</text></value></caption>
        <border><edge thickness="0.5pt"/><fill><color value="230,230,230"/></fill></border>
        ${font}
      </field>
    </subform>
  </subform>
</template>
<xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">
  <xfa:data>
    <form1>
      <applicant>
        <FamilyName>Lovelace</FamilyName>
        <GivenName></GivenName>
        <Comments></Comments>
        <BirthYear></BirthYear>
        <MemberSince></MemberSince>
        <Password></Password>
        <PostalCode></PostalCode>
      </applicant>
      <choices>
        <Language>en</Language>
        <Size>M</Size>
        <Topics></Topics>
        <Color></Color>
        <Newsletter>0</Newsletter>
        <ContactBy>email</ContactBy>
      </choices>
      <contact>
        <FamilyName></FamilyName>
      </contact>
    </form1>
  </xfa:data>
</xfa:datasets>
</xdp:xdp>
`;

const doc = await PDFDocument.create();
doc.setTitle('XFA form example');
doc.setAuthor('extended-pdf-viewer-showcase');
doc.setCreator('extended-pdf-viewer-showcase pdf-creator/make-xfa-form.mjs');
// A placeholder page for viewers without XFA support.
const page = doc.addPage([612, 792]);
page.drawText('This PDF file is an XFA form. Your PDF viewer does not support XFA.', { x: 50, y: 700, size: 12 });

const { context, catalog } = doc;
const xfa = context.register(context.stream(XDP));
const acroForm = context.register(context.obj({ Fields: [], XFA: xfa }));
catalog.set(PDFName.of('AcroForm'), acroForm);
catalog.set(PDFName.of('NeedsRendering'), PDFBool.True);

const target = process.env.OUT ?? join(dirname(fileURLToPath(import.meta.url)), '../src/assets/pdfs/xfa-form-example.pdf');
writeFileSync(target, await doc.save({ useObjectStreams: false }));
console.log(`wrote ${target}`);

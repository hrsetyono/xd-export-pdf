const application = require("application");
const { localFileSystem, formats } = require("uxp").storage;
const { PDFDocument } = require('pdf-lib');

// const localFileSystem = require("uxp").storage.localFileSystem;
// const formats = require("uxp").storage.formats;
// const PDFDocument = require('pdf-lib').PDFDocument;

module.exports = async function exportAssets(selection) {
  if (selection.items.length <= 0) {
    return;
  }

  // set up file I/O
  const folder = await localFileSystem.getFolder();

  // Order results by coordinate
  selection.items.sort((item1, item2) => {
    return item1.globalBounds.x == item2.globalBounds.x
      ? item1.globalBounds.y - item2.globalBounds.y
      : item1.globalBounds.x - item2.globalBounds.x;
  });

  const files = [];
  for (let i = 0; i < selection.items.length; i++) {
    const filename = selection.items[i].name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    selection.items[i].filename = `${filename}.pdf`;
    const file = await folder.createFile(
      selection.items[i].filename,
      { overwrite: true }
    );
    files.push(file);
  }

  // set up renditions array
  const renditions = [];
  for (let k = 0; k < selection.items.length; k++) {
    renditions.push({
      node: selection.items[k],
      outputFile: files[k],
      type: application.RenditionType.PDF,
      scale: null,
      quality: null,
      minify: null,
      embedImages: null,
    });
  }

  // use application class to print out assets,
  // return render result.
  try {
    const results = await application.createRenditions(renditions);

    const mergedPDF = await folder.createFile(
      selection.items[0].filename,
      { overwrite: true }
    );

    const buffers = [];
    for (const r of results) {
      const buffer = await r.outputFile.read({
        format: formats.binary
      });
      buffers.push(buffer);
    }

    // PDFLib
    const tempPDF = await PDFDocument.create();
    for (const b of buffers) {
      const pdf = await PDFDocument.load(b);
      const copiedPages = await tempPDF.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        tempPDF.addPage(page); 
      });
    }

    const mergedBuffer = await tempPDF.save();
    await mergedPDF.write(mergedBuffer);

    // TODO: delete the other files
  } catch (error) {
    console.log(error);
  }
};

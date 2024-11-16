import PDFDocument from 'pdfkit'

export function buildPDF(dataCallback, endCallback) {

    const doc = new PDFDocument()

    doc.on('data', dataCallback)

    doc.on('end', endCallback)

    doc.fontSize(25).text('Hello World')

    doc.end()
}
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const RECEIPTS_DIR = path.join(UPLOADS_DIR, 'receipts');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

/**
 * Generates a styled PDF payment receipt.
 * @param {Object} payment - Prisma Payment record
 * @param {Object} policy - Prisma Policy record with policyType loaded
 * @param {Object} customer - Prisma User record of the customer
 * @returns {Promise<string>} - Resolves with the relative file path of the receipt
 */
export function generatePremiumReceipt(payment, policy, customer) {
  return new Promise((resolve, reject) => {
    try {
      const filename = `receipt-${payment.id}.pdf`;
      const relativePath = path.join('uploads', 'receipts', filename);
      const destPath = path.join(RECEIPTS_DIR, filename);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(destPath);
      doc.pipe(writeStream);

      // Color Palette
      const primaryColor = '#4f46e5'; // Indigo-600
      const textColor = '#1f2937'; // Gray-800
      const lightTextColor = '#6b7280'; // Gray-500
      const dividerColor = '#e5e7eb'; // Gray-200

      // ================= HEADER =================
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('INSURASHIELD', 50, 50);

      doc
        .fillColor(lightTextColor)
        .fontSize(8)
        .font('Helvetica')
        .text('INNOVATIVE INSURANCE SOLUTIONS', 50, 75);

      doc
        .fillColor(textColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PREMIUM PAYMENT RECEIPT', 300, 50, { align: 'right' });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(lightTextColor)
        .text(`Receipt ID: ${payment.transactionId || 'N/A'}`, 300, 68, { align: 'right' })
        .text(`Date Issued: ${new Date(payment.paymentDate || Date.now()).toLocaleDateString()}`, 300, 80, { align: 'right' });

      // Draw a line
      doc.moveTo(50, 105).lineTo(550, 105).strokeColor(dividerColor).lineWidth(1).stroke();

      // ================= BILLING INFO =================
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('CUSTOMER DETAILS', 50, 120);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(customer.name, 50, 135)
        .font('Helvetica')
        .fillColor(lightTextColor)
        .text(`Email: ${customer.email}`, 50, 150)
        .text(`Phone: ${customer.phone || 'N/A'}`, 50, 162);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('POLICY DETAILS', 300, 120);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(policy.policyType.name, 300, 135)
        .font('Helvetica')
        .fillColor(lightTextColor)
        .text(`Policy Number: ${policy.policyNumber}`, 300, 150)
        .text(`Coverage Amount: $${policy.coverageAmount.toLocaleString()}`, 300, 162);

      // Draw a line
      doc.moveTo(50, 185).lineTo(550, 185).strokeColor(dividerColor).lineWidth(1).stroke();

      // ================= TRANSACTION DETAILS =================
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TRANSACTION SUMMARY', 50, 205);

      // Table headers
      doc
        .fillColor(lightTextColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Item Description', 50, 230)
        .text('Due Date', 280, 230, { width: 100, align: 'center' })
        .text('Payment Method', 380, 230, { width: 90, align: 'center' })
        .text('Amount', 470, 230, { width: 80, align: 'right' });

      // Table row line
      doc.moveTo(50, 245).lineTo(550, 245).strokeColor(dividerColor).lineWidth(0.5).stroke();

      // Table row details
      doc
        .fillColor(textColor)
        .fontSize(9)
        .font('Helvetica')
        .text(`Insurance Premium Payment for ${policy.policyType.name}`, 50, 260, { width: 220 })
        .text(new Date(payment.dueDate).toLocaleDateString(), 280, 260, { width: 100, align: 'center' })
        .text(payment.paymentMethod || 'Credit Card', 380, 260, { width: 90, align: 'center' })
        .text(`$${payment.amount.toFixed(2)}`, 470, 260, { width: 80, align: 'right' });

      // Table row line
      doc.moveTo(50, 285).lineTo(550, 285).strokeColor(dividerColor).lineWidth(0.5).stroke();

      // Calculations
      const subtotal = payment.amount;
      const gst = subtotal * 0.18; // 18% dummy tax
      const total = subtotal + gst;

      doc
        .fillColor(lightTextColor)
        .text('Premium Subtotal:', 350, 305, { width: 110, align: 'right' })
        .text(`$${subtotal.toFixed(2)}`, 470, 305, { width: 80, align: 'right' });

      doc
        .text('GST / Service Tax (18%):', 350, 320, { width: 110, align: 'right' })
        .text(`$${gst.toFixed(2)}`, 470, 320, { width: 80, align: 'right' });

      // Final Total highlight box
      doc.rect(340, 338, 210, 30).fill('#f3f4f6');
      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Total Paid:', 350, 348, { width: 110, align: 'right' })
        .text(`$${total.toFixed(2)}`, 470, 348, { width: 80, align: 'right' });

      // ================= FOOTER / SIGNATURE =================
      doc
        .fillColor(lightTextColor)
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text('This is a computer-generated document and does not require a physical signature.', 50, 480, { align: 'center' });

      doc
        .fillColor(primaryColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Thank you for choosing InsuraShield!', 50, 500, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(relativePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

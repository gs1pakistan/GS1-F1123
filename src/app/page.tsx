import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const Page = () => {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signatureCanvasRef = useRef<any>(null);

  // Handle drawing clear/reset
  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setSignatureData(null);
    }
  };

  // Handle generating the PDF
  const generatePDF = async () => {
    if (!signatureData) {
      alert("Please provide a signature!");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Add Signature Image to PDF
    const signatureImage = await pdfDoc.embedPng(signatureData);
    const signatureDims = signatureImage.scale(0.5);
    page.drawImage(signatureImage, {
      x: width / 2 - signatureDims.width / 2,
      y: height / 2 - signatureDims.height / 2,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(pdfBlob, "signed_document.pdf");
  };

  // Convert the canvas signature to data URL
  const onSignatureEnd = () => {
    if (signatureCanvasRef.current) {
      setSignatureData(signatureCanvasRef.current.toDataURL("image/png"));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sign Below</h2>
      <div style={{ border: "1px solid #000", marginBottom: "10px" }}>
        <SignatureCanvas
          ref={signatureCanvasRef}
          onEnd={onSignatureEnd}
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas",
            style: { border: "1px solid #000", marginBottom: "10px" },
          }}
        />
      </div>
      <button onClick={clearSignature}>Clear Signature</button>
      <br />
      <button onClick={generatePDF}>Generate PDF with Signature</button>
    </div>
  );
};

export default Page;

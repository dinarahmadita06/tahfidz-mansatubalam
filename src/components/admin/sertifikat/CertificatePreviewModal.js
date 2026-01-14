'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

export default function CertificatePreviewModal({ data, htmlTemplate, onClose }) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef(null);
  
  // Replace placeholders in HTML template
  const renderedHTML = Object.keys(data).reduce((acc, key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    return acc.replace(regex, data[key]);
  }, htmlTemplate);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });

      // Render the HTML element to PDF
      await doc.html(previewRef.current, {
        callback: function (doc) {
          doc.save(`Sertifikat_${data.nama.replace(/\s+/g, '_')}_${data.certificateNumber.replace(/\//g, '-')}.pdf`);
          setLoading(false);
        },
        x: 0,
        y: 0,
        width: 794, // A4 width in px at 96dpi (842px for landscape) - doc.internal.pageSize.getWidth()
        windowWidth: 794,
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Gagal membuat PDF. Pastikan browser Anda mendukung fitur ini.');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Sertifikat - ${data.nama}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; padding: 0; }
            .cert-container { 
              width: 297mm; 
              height: 210mm; 
              overflow: hidden;
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="cert-container">
            ${renderedHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Preview Sertifikat</h3>
            <p className="text-xs text-gray-500">Pratinjau sebelum cetak atau unduh</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium text-sm"
            >
              <Printer size={18} />
              Cetak
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Unduh PDF
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2" />
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable area for preview */}
        <div className="flex-1 overflow-auto bg-gray-200/50 p-8 flex justify-center">
          {/* This is the element jspdf will capture */}
          <div 
            className="shadow-2xl bg-white origin-top"
            style={{ 
              width: '794px', // A4 Landscape ratio (approximated in px)
              height: '561px',
              minWidth: '794px',
              minHeight: '561px'
            }}
          >
            <div 
              ref={previewRef}
              style={{ 
                width: '794px', 
                height: '561px',
                transform: 'scale(1)',
                transformOrigin: 'top left'
              }}
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>
        </div>
        
        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400">
          Template Sertifikat &bull; Ukuran A4 Landscape &bull; SIMTAQ Digital System
        </div>
      </div>
    </div>
  );
}

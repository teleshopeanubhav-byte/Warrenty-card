import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Printer, Download, Share2, ArrowLeft, CheckCircle2, MessageCircle, MapPin, Smartphone } from 'lucide-react';
import { Warranty } from '../types';
import { formatDate } from '../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function WarrantyCard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const whatsappUrl = location.state?.whatsappUrl;

  useEffect(() => {
    const fetchWarranty = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'warranties', id));
        if (docSnap.exists()) {
          setWarranty({ id: docSnap.id, ...docSnap.data() } as Warranty);
        }
      } catch (error) {
        console.error('Error fetching warranty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarranty();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#0a0a0a',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Warranty_${warranty?.customerName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-dark-bg text-gold">Loading...</div>;
  if (!warranty) return <div className="h-screen flex items-center justify-center bg-dark-bg text-red-500">Warranty not found.</div>;

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Actions - Hidden on print */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 print:hidden">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted hover:text-gold transition-colors"
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div className="flex gap-3">
            {whatsappUrl && (
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-lg"
              >
                <MessageCircle size={18} /> Share on WhatsApp
              </a>
            )}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-dark-surface border border-dark-border text-white px-4 py-2 rounded-lg hover:border-gold transition-all shadow-lg"
            >
              <Printer size={18} /> Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 gold-gradient text-dark-bg font-bold px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-lg"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

        {/* Success Message - Hidden on print */}
        {location.state?.whatsappUrl && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl mb-8 flex items-center gap-3 text-green-500 print:hidden"
          >
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">Registration Successful!</p>
              <p className="text-sm opacity-80">Your warranty has been registered. You can now download or print your certificate.</p>
            </div>
          </motion.div>
        )}

        {/* Warranty Card Content */}
        <div 
          ref={cardRef}
          className="bg-dark-surface border-4 border-gold p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black print:shadow-none print:rounded-none"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -mr-32 -mt-32 print:hidden"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full -ml-32 -mb-32 print:hidden"></div>

          {/* Header */}
          <div className="text-center mb-12 relative">
            <h1 className="text-4xl md:text-5xl font-bold gold-text mb-2 print:text-black print:bg-none print:text-fill-current">BUNTY ELECTRONICS</h1>
            <p className="text-xl text-muted tracking-widest print:text-black">& BHAGWAN TRADERS</p>
            <div className="h-1 w-32 bg-gold mx-auto mt-6 rounded-full print:bg-black"></div>
            <h2 className="text-2xl font-semibold mt-8 uppercase tracking-widest">Official Warranty Certificate</h2>
          </div>

          {/* Card Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Customer Name</p>
                <p className="text-2xl font-semibold">{warranty.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Contact Number</p>
                <p className="text-xl">{warranty.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Address</p>
                <p className="text-muted print:text-black">{warranty.address}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Product</p>
                  <p className="text-lg font-semibold">{warranty.product}</p>
                </div>
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Brand</p>
                  <p className="text-lg font-semibold">{warranty.brand}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Serial Number</p>
                <p className="text-xl font-mono">{warranty.serialNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Purchase Date</p>
                  <p className="text-lg">{formatDate(warranty.purchaseDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Warranty Period</p>
                  <p className="text-lg font-bold text-gold print:text-black">{warranty.warrantyPeriod}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1 print:text-black">Warranty Expiry Date</p>
                <p className="text-xl font-bold text-gold print:text-black">
                  {warranty.expiryDate === 'Lifetime' ? 'LIFETIME' : formatDate(warranty.expiryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-16 pt-8 border-t border-dark-border grid grid-cols-1 md:grid-cols-3 gap-8 text-sm print:border-black">
            <div>
              <p className="text-muted uppercase tracking-widest mb-2 print:text-black">Authorized Signature</p>
              <div className="h-12 border-b border-dark-border mb-2 print:border-black"></div>
              <p className="font-bold">Anubhav Maheshwari</p>
              <p className="text-xs text-muted print:text-black">Proprietor</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <p className="text-muted uppercase tracking-widest mb-2 print:text-black">Shop Details</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-gold print:text-black" /> Near Police Station Road, Jain Market, Bilsi - 243633</p>
              <p className="flex items-center gap-2"><Smartphone size={14} className="text-gold print:text-black" /> +91 7455969640</p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-12 p-4 bg-dark-bg/50 rounded-xl border border-dark-border text-[10px] text-muted leading-relaxed print:bg-white print:border-black print:text-black">
            <p className="font-bold mb-1 uppercase">Terms & Conditions:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Warranty is valid only on manufacturing defects.</li>
              <li>Physical damage, water damage, or unauthorized repair will void the warranty.</li>
              <li>Please keep this certificate and original invoice for any service claims.</li>
              <li>Warranty period starts from the date of purchase mentioned above.</li>
            </ul>
          </div>

          <div className="mt-8 text-center text-[10px] text-muted uppercase tracking-[0.3em] print:text-black">
            Powered by BUNTY ELECTRONICS
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

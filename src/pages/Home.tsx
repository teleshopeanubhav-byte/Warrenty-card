import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Smartphone, User, MapPin, Package, Tag, Hash, Calendar, FileText, IndianRupee, Clock, ShieldCheck } from 'lucide-react';
import { cn, calculateExpiryDate } from '../lib/utils';

const schema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  product: z.string().min(2, 'Product name is required'),
  price: z.number().min(1, 'Price is required'),
  brand: z.string().min(1, 'Brand is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  warrantyPeriod: z.string().min(1, 'Warranty period is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyPeriod: '1 Year',
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const expiryDate = calculateExpiryDate(data.purchaseDate, data.warrantyPeriod);
      const docRef = await addDoc(collection(db, 'warranties'), {
        ...data,
        expiryDate,
        createdAt: Date.now(),
      });

      // WhatsApp Integration
      const message = `*New Warranty Registration*%0A%0A` +
        `*Customer:* ${data.customerName}%0A` +
        `*Phone:* ${data.phoneNumber}%0A` +
        `*Product:* ${data.product}%0A` +
        `*Brand:* ${data.brand}%0A` +
        `*Serial No:* ${data.serialNumber}%0A` +
        `*Warranty:* ${data.warrantyPeriod}%0A` +
        `*Purchase Date:* ${data.purchaseDate}%0A` +
        `*Expiry Date:* ${expiryDate}`;
      
      const whatsappUrl = `https://wa.me/917455969640?text=${message}`;
      
      // Navigate to warranty card
      navigate(`/warranty/${docRef.id}`, { state: { whatsappUrl } });
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to register warranty. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gold-text mb-2">BUNTY ELECTRONICS</h1>
          <p className="text-muted text-lg">& BHAGWAN TRADERS</p>
          <div className="h-1 w-24 bg-gold mx-auto mt-4 rounded-full"></div>
          <h2 className="text-2xl font-semibold mt-8 text-white">Warranty Registration</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-gold font-medium flex items-center gap-2 border-b border-dark-border pb-2">
                <User size={18} /> Customer Details
              </h3>
              
              <div className="space-y-1">
                <label className="text-sm text-muted">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-muted" size={18} />
                  <input 
                    {...register('customerName')}
                    className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.customerName && "border-red-500")}
                    placeholder="Full Name"
                  />
                </div>
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 text-muted" size={18} />
                  <input 
                    {...register('phoneNumber')}
                    className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.phoneNumber && "border-red-500")}
                    placeholder="10-digit number"
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted" size={18} />
                  <textarea 
                    {...register('address')}
                    className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all min-h-[100px]", errors.address && "border-red-500")}
                    placeholder="Full Address"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <h3 className="text-gold font-medium flex items-center gap-2 border-b border-dark-border pb-2">
                <Package size={18} /> Product Details
              </h3>

              <div className="space-y-1">
                <label className="text-sm text-muted">Product Name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 text-muted" size={18} />
                  <input 
                    {...register('product')}
                    className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.product && "border-red-500")}
                    placeholder="e.g. LED TV, Refrigerator"
                  />
                </div>
                {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted">Brand</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 text-muted" size={18} />
                    <input 
                      {...register('brand')}
                      className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.brand && "border-red-500")}
                      placeholder="Brand"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted">Price</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 text-muted" size={18} />
                    <input 
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.price && "border-red-500")}
                      placeholder="Amount"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted">Serial Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 text-muted" size={18} />
                  <input 
                    {...register('serialNumber')}
                    className={cn("w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all", errors.serialNumber && "border-red-500")}
                    placeholder="S/N or Model No"
                  />
                </div>
                {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted">Warranty Period</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-muted" size={18} />
                    <select 
                      {...register('warrantyPeriod')}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all"
                    >
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="5 Years">5 Years</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted">Purchase Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-muted" size={18} />
                    <input 
                      type="date"
                      {...register('purchaseDate')}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted">Warranty Expiry Date (Auto-calculated)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 text-gold" size={18} />
                  <input 
                    type="text"
                    readOnly
                    value={(() => {
                      const { purchaseDate, warrantyPeriod } = watch();
                      if (purchaseDate && warrantyPeriod) {
                        return calculateExpiryDate(purchaseDate, warrantyPeriod);
                      }
                      return '';
                    })()}
                    className="w-full bg-dark-bg/50 border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-gold font-medium outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted">Additional Note (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-muted" size={18} />
              <input 
                {...register('note')}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all"
                placeholder="Any extra details..."
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full gold-gradient text-dark-bg font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-4"
          >
            {isSubmitting ? 'REGISTERING...' : 'REGISTER WARRANTY'}
          </button>
        </form>

        <footer className="mt-12 text-center text-muted text-sm">
          <p>© 2026 Bunty Electronics & Bhagwan Traders. All rights reserved.</p>
          <p className="mt-1">Powered by BUNTY ELECTRONICS</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/admin/login')}
              className="text-xs text-muted hover:text-gold transition-colors"
            >
              Admin Login
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

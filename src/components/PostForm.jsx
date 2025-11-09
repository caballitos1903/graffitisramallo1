import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Image, DollarSign, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import PaymentModal from '@/components/PaymentModal';
import { useToast } from '@/components/ui/use-toast';
import { getSettings } from '@/lib/api';

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [extraDonation, setExtraDonation] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [settings, setSettings] = useState({ priceSimple: 200, priceWithImage: 1000 });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      const data = await getSettings();
      setSettings({
        priceSimple: data.price_simple,
        priceWithImage: data.price_with_image,
      });
      setLoadingSettings(false);
    };
    fetchSettings();
  }, []);

  const basePrice = hasImage ? settings.priceWithImage : settings.priceSimple;
  const totalAmount = basePrice + (extraDonation || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "⚠️ Contenido vacío",
        description: "Escribí algo antes de publicar",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 500) {
      toast({
        title: "⚠️ Texto muy largo",
        description: "Máximo 500 caracteres permitidos",
        variant: "destructive",
      });
      return;
    }
    
    if(hasImage && !imageFile) {
      toast({
        title: "⚠️ Falta la imagen",
        description: "Por favor, subí una imagen",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    setContent('');
    setHasImage(false);
    setImageFile(null);
    setExtraDonation(0);
    setShowPayment(false);
    onPostCreated();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 md:p-8 neon-glow"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-violet-400" />
          Publicar en el Muro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="content">Tu mensaje anónimo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribí lo que quieras... (máx. 500 caracteres)"
              className="mt-2 bg-gray-800 border-gray-700 min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {content.length}/500 caracteres
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasImage"
              checked={hasImage}
              onChange={(e) => {
                setHasImage(e.target.checked);
                if (!e.target.checked) setImageFile(null);
              }}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800"
            />
            <Label htmlFor="hasImage" className="cursor-pointer flex items-center gap-2">
              <Image className="w-5 h-5 text-violet-400" />
              Incluir foto (requiere aprobación)
            </Label>
          </div>

          {hasImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Label htmlFor="image">Subir imagen</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="mt-2 bg-gray-800 border-gray-700"
              />
            </motion.div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-violet-400">💰 Precios:</p>
            {loadingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> :
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>💬 Comentario simple: <span className="font-bold">${settings.priceSimple} ARS</span></p>
                <p>🖼️ Comentario con foto: <span className="font-bold">${settings.priceWithImage} ARS</span></p>
              </div>
            }
          </div>

          <div>
            <Label htmlFor="donation">💰 Donar más (opcional)</Label>
            <Input
              id="donation"
              type="number"
              min="0"
              value={extraDonation}
              onChange={(e) => setExtraDonation(Number(e.target.value))}
              placeholder="0"
              className="mt-2 bg-gray-800 border-gray-700"
            />
          </div>

          <div className="bg-violet-900/30 border border-violet-700 rounded-lg p-4">
            <p className="text-lg font-bold text-center">
              Total a pagar: <span className="text-violet-400">${totalAmount} ARS</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">
              <CreditCard className="w-5 h-5 mr-2" />
              Pagar con Mercado Pago
            </Button>
            
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 w-full">
              <Wallet className="w-5 h-5 mr-2" />
              Pagar con Cripto
            </Button>
          </div>
        </form>
      </motion.div>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          content={content}
          hasImage={hasImage}
          imageFile={imageFile}
          amount={totalAmount}
          onComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default PostForm;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createGraffiti, uploadImage, createPreference } from '@/lib/api';
import { getSettings } from '@/lib/api';
import { supabase } from '@/lib/customSupabaseClient'; // Import supabase here

const PaymentModal = ({ isOpen, onClose, content, hasImage, imageFile, amount, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [cryptoNetwork, setCryptoNetwork] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [mpPublicKey, setMpPublicKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMpKey = async () => {
        const settings = await getSettings();
        if(settings && settings.mp_public_key) {
          setMpPublicKey(settings.mp_public_key);
        }
    };
    fetchMpKey();

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
        // MP SDK is loaded
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const brickDiv = document.getElementById('wallet_container');
      if (brickDiv) brickDiv.innerHTML = '';
    };
  }, []);


  useEffect(() => {
    if (preferenceId && mpPublicKey) {
      // Ensure the script is loaded before using window.MercadoPago
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(mpPublicKey, {
          locale: 'es-AR',
        });
        
        const bricksBuilder = mp.bricks();
        
        bricksBuilder.create('wallet', 'wallet_container', {
          initialization: {
            preferenceId: preferenceId,
          },
          callbacks: {
            onReady: () => {
              setIsProcessing(false);
            },
            onSubmit: () => {},
            onError: (error) => console.error(error),
          },
        });
      } else {
        console.warn('MercadoPago SDK not loaded yet.');
      }
    }
  }, [preferenceId, mpPublicKey]);


  const handleCreatePost = async (method, isMp = false) => {
    setIsProcessing(true);
    let imageUrl = null;
    
    // First, upload image if present
    if (hasImage && imageFile) {
      imageUrl = await uploadImage(imageFile);
      if(!imageUrl) {
        toast({
          title: "❌ Error al subir la imagen",
          description: "Intentalo de nuevo o probá con otra imagen.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    // Create graffiti entry in DB
    const newGraffiti = await createGraffiti({
      content,
      image_url: imageUrl, // Use the uploaded image URL or null
      payment_method: method,
      amount,
      approved: false // Start as not approved
    });

    if(!newGraffiti){
      toast({ title: "❌ Error", description: "No se pudo crear la publicación.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }
    
    if(isMp) {
      // Create MP preference
      const prefData = await createPreference(amount, `Graffiti: ${content.substring(0, 20)}...`, newGraffiti.id);
      if (prefData && prefData.preferenceId) {
        setPreferenceId(prefData.preferenceId);
        // The useEffect will handle rendering the button, isProcessing will be set to false onReady
      } else {
        toast({ title: "❌ Error", description: "No se pudo conectar con Mercado Pago.", variant: "destructive" });
        setIsProcessing(false);
      }
    } else {
       toast({ title: "✅ Publicación creada", description: "Tu mensaje está pendiente de aprobación." });
       setIsProcessing(false);
       onComplete();
    }
  }

  const handleMercadoPagoPayment = () => {
    setPreferenceId(null); // Reset preference
    const container = document.getElementById('wallet_container');
    if (container) container.innerHTML = '';
    handleCreatePost('mercadopago', true);
  };

  const handleCryptoPayment = () => {
    if (!cryptoNetwork) {
      toast({ title: "⚠️ Seleccioná una red", description: "Elegí la red de cripto para continuar", variant: "destructive" });
      return;
    }
    handleCreatePost('web3');
  };
  
    const cryptoAddresses = {
    'USDT-TRC20': 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'TRX': 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'BUSD-BSC': '0xXxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  };

  const copyAddress = () => {
    const address = cryptoAddresses[cryptoNetwork];
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "📋 Dirección copiada",
      description: "Pegala en tu wallet para enviar el pago",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg neon-glow"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Método de Pago</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isProcessing}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <Button
                  onClick={() => { setPaymentMethod('mercadopago'); setPreferenceId(null); }}
                  variant={paymentMethod === 'mercadopago' ? 'default' : 'outline'}
                  className={`flex-1 ${paymentMethod === 'mercadopago' ? 'bg-blue-600' : 'border-gray-700'}`}
                  disabled={isProcessing}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Mercado Pago
                </Button>
                
                <Button
                  onClick={() => setPaymentMethod('crypto')}
                  variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                  className={`flex-1 ${paymentMethod === 'crypto' ? 'bg-violet-600' : 'border-gray-700'}`}
                  disabled={isProcessing}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Cripto
                </Button>
              </div>

              {paymentMethod === 'mercadopago' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {!preferenceId &&
                    <>
                      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                        <p className="text-center font-bold text-lg mb-2">Total: ${amount} ARS</p>
                        <p className="text-sm text-gray-400 text-center">Serás redirigido a Mercado Pago para completar el pago</p>
                      </div>
                      <Button onClick={handleMercadoPagoPayment} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isProcessing}>
                        {isProcessing && !preferenceId ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Continuar con Mercado Pago'}
                      </Button>
                    </>
                  }
                  <div id="wallet_container" className={isProcessing && !preferenceId ? 'hidden' : ''}>
                    {isProcessing && !preferenceId && <div className="flex justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-blue-400"/></div>}
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'crypto' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Seleccioná la red</Label>
                    <Select value={cryptoNetwork} onValueChange={setCryptoNetwork} disabled={isProcessing}>
                      <SelectTrigger className="mt-2 bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Elegí una red..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT-TRC20">USDT (TRC20)</SelectItem>
                        <SelectItem value="TRX">TRX</SelectItem>
                        <SelectItem value="BUSD-BSC">BUSD (BSC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {cryptoNetwork && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-violet-900/30 border border-violet-700 rounded-lg p-4 space-y-3"
                    >
                      <p className="text-sm text-gray-400">Enviá el equivalente a <span className="font-bold text-white">${amount} ARS</span> en {cryptoNetwork}</p>
                      <div className="bg-gray-800 rounded p-3 break-all text-sm font-mono">{cryptoAddresses[cryptoNetwork]}</div>
                      <Button onClick={copyAddress} variant="outline" className="w-full border-gray-700" disabled={isProcessing}>
                        {copied ? <><Check className="w-4 h-4 mr-2" />Copiado</> : <><Copy className="w-4 h-4 mr-2" />Copiar dirección</>}
                      </Button>
                    </motion.div>
                  )}

                  <Button onClick={handleCryptoPayment} disabled={!cryptoNetwork || isProcessing} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50">
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Confirmar y Crear Publicación'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">Mínimo: 5 USD equivalentes. El saldo sobrante quedará como crédito.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, DollarSign, Wallet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { getSettings, updateSettings } from '@/lib/api'

const AdminSettings = () => {
  const [priceSimple, setPriceSimple] = useState(0)
  const [priceWithImage, setPriceWithImage] = useState(0)
  const [walletTRX, setWalletTRX] = useState('')
  const [walletTRC20, setWalletTRC20] = useState('')
  const [walletBSC, setWalletBSC] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      const settings = await getSettings()

      // Cargar precios
      setPriceSimple(settings.price_simple || 200)
      setPriceWithImage(settings.price_with_image || 1000)

      // Cargar direcciones (si existen)
      setWalletTRX(settings.wallet_trx || '')
      setWalletTRC20(settings.wallet_trc20 || '')
      setWalletBSC(settings.wallet_bsc || '')

      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const success = await updateSettings({
      price_simple: Number(priceSimple),
      price_with_image: Number(priceWithImage),
      wallet_trx: walletTRX,
      wallet_trc20: walletTRC20,
      wallet_bsc: walletBSC,
    })

    if (success) {
      toast({
        title: '✅ Configuración guardada',
        description: 'Los nuevos precios y direcciones ya están activos',
      })
    } else {
      toast({
        title: '❌ Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/80 border border-gray-800 rounded-lg p-6 max-w-2xl"
    >
      {/* ----- Sección de precios ----- */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-violet-400" />
        Configuración de Precios
      </h2>

      <div className="space-y-6 mb-10">
        <div>
          <Label htmlFor="priceSimple">💬 Precio comentario simple (ARS)</Label>
          <Input
            id="priceSimple"
            type="number"
            value={priceSimple}
            onChange={(e) => setPriceSimple(e.target.value)}
            className="mt-2 bg-gray-800 border-gray-700"
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="priceWithImage">🖼️ Precio comentario con foto (ARS)</Label>
          <Input
            id="priceWithImage"
            type="number"
            value={priceWithImage}
            onChange={(e) => setPriceWithImage(e.target.value)}
            className="mt-2 bg-gray-800 border-gray-700"
            min="0"
          />
        </div>
      </div>

      {/* ----- Sección de direcciones ----- */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-violet-400" />
        Direcciones de Cobro Cripto
      </h2>

      <div className="space-y-6">
        <div>
          <Label htmlFor="walletTRX">🔴 Dirección TRX</Label>
          <Input
            id="walletTRX"
            value={walletTRX}
            onChange={(e) => setWalletTRX(e.target.value)}
            className="mt-2 bg-gray-800 border-gray-700"
            placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="walletTRC20">🟣 Dirección USDT (TRC20)</Label>
          <Input
            id="walletTRC20"
            value={walletTRC20}
            onChange={(e) => setWalletTRC20(e.target.value)}
            className="mt-2 bg-gray-800 border-gray-700"
            placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="walletBSC">🟡 Dirección BUSD (BSC)</Label>
          <Input
            id="walletBSC"
            value={walletBSC}
            onChange={(e) => setWalletBSC(e.target.value)}
            className="mt-2 bg-gray-800 border-gray-700"
            placeholder="0xYourBSCWalletAddress"
          />
        </div>

        <Button
          onClick={handleSave}
          className="bg-violet-600 hover:bg-violet-700 w-full mt-8"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default AdminSettings

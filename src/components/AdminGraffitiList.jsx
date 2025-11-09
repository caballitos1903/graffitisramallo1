import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { approveGraffiti, deleteGraffiti } from '@/lib/api';

const AdminGraffitiList = ({ graffittis, onUpdate, title }) => {
  const { toast } = useToast();

  const handleApprove = async (id) => {
    const success = await approveGraffiti(id);
    if (success) {
      toast({
        title: "✅ Publicación aprobada",
        description: "El mensaje ya es visible en el muro",
      });
      onUpdate();
    } else {
      toast({ title: "❌ Error", description: "No se pudo aprobar", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteGraffiti(id);
    if (success) {
      toast({
        title: "🗑️ Publicación eliminada",
        description: "El mensaje fue borrado permanentemente",
      });
      onUpdate();
    } else {
      toast({ title: "❌ Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {graffittis.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-gray-400">No hay publicaciones en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-4">
          {graffittis.map((graffiti, index) => (
            <motion.div
              key={graffiti.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900/80 border border-gray-800 rounded-lg p-5"
            >
              <div className="space-y-3">
                <p className="text-white leading-relaxed break-words">
                  {graffiti.content}
                </p>

                {graffiti.image_url && (
                  <div className="rounded-lg overflow-hidden max-w-xs">
                    <img 
                      src={graffiti.image_url} 
                      alt="Graffiti" 
                      className="w-full h-auto"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(graffiti.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{graffiti.amount} ARS</span>
                  </div>

                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                    {graffiti.payment_method === 'mercadopago' ? '💳 MP' : '🪙 Cripto'}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  {!graffiti.approved && (
                    <Button
                      onClick={() => handleApprove(graffiti.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleDelete(graffiti.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGraffitiList;
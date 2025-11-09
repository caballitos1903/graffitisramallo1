import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign } from 'lucide-react';

const GraffitiCard = ({ graffiti }) => {
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 hover:border-violet-500 transition-all duration-300 neon-glow"
    >
      {graffiti.image_url && graffiti.image_url !== 'pending_upload' && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={graffiti.image_url} 
            alt="Graffiti" 
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <p className="text-white mb-4 leading-relaxed break-words">
        {graffiti.content}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(graffiti.created_at)}</span>
        </div>
        
        <div className="flex items-center gap-1 text-violet-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">{graffiti.amount}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GraffitiCard;
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GraffitiCard from '@/components/GraffitiCard';

const GraffitiWall = ({ graffittis, filter, onFilterChange, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-violet-400">🎨</span>
          El Muro
        </h2>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => onFilterChange('recent')}
            variant={filter === 'recent' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'recent' ? 'bg-violet-600' : 'border-gray-700'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Recientes
          </Button>
          
          <Button
            onClick={() => onFilterChange('withImage')}
            variant={filter === 'withImage' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'withImage' ? 'bg-violet-600' : 'border-gray-700'}
          >
            <Image className="w-4 h-4 mr-2" />
            Con Imagen
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : graffittis.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-lg">
            Todavía no hay publicaciones aprobadas. ¡Sé el primero! 🚀
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {graffittis.map((graffiti, index) => (
            <motion.div
              key={graffiti.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GraffitiCard graffiti={graffiti} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraffitiWall;
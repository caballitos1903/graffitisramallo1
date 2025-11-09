import React from 'react';
import { motion } from 'framer-motion';
import { SprayCan as Spray } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Spray className="w-8 h-8 text-violet-400" />
            <h1 className="text-4xl md:text-5xl font-black graffiti-shadow bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Graffittis en Ramallo
            </h1>
            <Spray className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-gray-400 text-lg">
            Publicá lo que quieras de forma anónima en el muro
          </p>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
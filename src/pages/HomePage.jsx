import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import PostForm from '@/components/PostForm';
import GraffitiWall from '@/components/GraffitiWall';
import { getApprovedGraffittis } from '@/lib/api';

const HomePage = () => {
  const [graffittis, setGraffittis] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [loading, setLoading] = useState(true);

  const loadGraffittis = useCallback(async () => {
    setLoading(true);
    const data = await getApprovedGraffittis();
    setGraffittis(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGraffittis();
  }, [loadGraffittis]);

  const handleNewPost = () => {
    // Optionally, we can show a message that it's pending approval
    // For now, we don't need to reload as it won't be approved yet.
  };

  const getFilteredGraffittis = () => {
    let filtered = [...graffittis];
    
    switch(filter) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'withImage':
        return filtered.filter(g => g.image_url);
      default:
        return filtered;
    }
  };

  return (
    <>
      <Helmet>
        <title>Graffittis en Ramallo - Muro Anónimo</title>
        <meta name="description" content="Publicá lo que quieras de forma anónima en el muro de Ramallo. Pagá con Mercado Pago o cripto." />
      </Helmet>
      
      <div className="min-h-screen pb-20">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PostForm onPostCreated={handleNewPost} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12"
          >
            <GraffitiWall 
              graffittis={getFilteredGraffittis()} 
              filter={filter}
              onFilterChange={setFilter}
              loading={loading}
            />
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
const STORAGE_KEYS = {
  GRAFFITTIS: 'graffittis_ramallo',
  SETTINGS: 'graffittis_settings',
  WALLETS: 'anonymous_wallets',
};

const DEFAULT_SETTINGS = {
  priceSimple: 200,
  priceWithImage: 1000,
};

export const getGraffittis = () => {
  const data = localStorage.getItem(STORAGE_KEYS.GRAFFITTIS);
  return data ? JSON.parse(data) : [];
};

export const createGraffiti = (graffiti) => {
  const graffittis = getGraffittis();
  const newGraffiti = {
    id: Date.now().toString(),
    ...graffiti,
    approved: false,
    created_at: new Date().toISOString(),
  };
  graffittis.push(newGraffiti);
  localStorage.setItem(STORAGE_KEYS.GRAFFITTIS, JSON.stringify(graffittis));
  return newGraffiti;
};

export const approveGraffiti = (id) => {
  const graffittis = getGraffittis();
  const updated = graffittis.map(g => 
    g.id === id ? { ...g, approved: true } : g
  );
  localStorage.setItem(STORAGE_KEYS.GRAFFITTIS, JSON.stringify(updated));
};

export const deleteGraffiti = (id) => {
  const graffittis = getGraffittis();
  const filtered = graffittis.filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.GRAFFITTIS, JSON.stringify(filtered));
};

export const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const updateSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getWallets = () => {
  const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
  return data ? JSON.parse(data) : [];
};

export const createWallet = (wallet) => {
  const wallets = getWallets();
  const newWallet = {
    id: Date.now().toString(),
    ...wallet,
    created_at: new Date().toISOString(),
  };
  wallets.push(newWallet);
  localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  return newWallet;
};
import { supabase } from './customSupabaseClient'

export const getAdminWallets = async () => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('key, value')
  if (error) {
    console.error('Error loading wallet settings:', error)
    return {}
  }
  const wallets = {}
  for (const row of data) wallets[row.key] = row.value
  return wallets
}

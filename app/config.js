/* =====================================================================
   HANKX Finanças — configuração
   Preencha os 2 campos do Supabase (Project Settings → API) e publique.
   Enquanto estiverem vazios, o app funciona no modo antigo (login único,
   dados só no aparelho/GitHub).
   ===================================================================== */
window.HANKX_CONFIG = {
  supabaseUrl: 'https://ffpahcsofmjpcqpmpmxp.supabase.co',        // ex.: 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: 'sb_publishable_XKM7v7yDP7usIAAyguQskw_RjUUn46Q',    // a chave "anon public" (pode ficar no site, é pública)
  playPackage: 'br.com.hankx.financas',
  playSkus: { mensal: 'premium_mensal', anual: 'premium_anual', vitalicio: 'premium_vitalicio' } // IDs das assinaturas no Play Console
};

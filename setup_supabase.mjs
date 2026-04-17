import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqkedarvwofqturhtebc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxa2VkYXJ2d29mcXR1cmh0ZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIxODc3NywiZXhwIjoyMDkxNzk0Nzc3fQ.DCkhOoeAA4ezGyThIO96jndkLlOd0f0sKGE2y85tl7g';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setup() {
  console.log('Criando usuário master...');
  
  // 1. Criar o usuário Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'brtreino@gmail.com',
    password: 'Escroto12.',
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('Usuário brtreino@gmail.com já existe no auth.');
    } else {
      console.error('Erro ao criar user:', authError);
      return;
    }
  } else {
    console.log('Usuário auth criado com sucesso:', authData.user.id);
  }

  // Pegar o ID do user pra garantir
  const { data: users } = await supabase.auth.admin.listUsers();
  const masterUser = users.users.find(u => u.email === 'brtreino@gmail.com');

  if (masterUser) {
    // 2. Inserir na tabela app_users
    console.log('Inserindo admin na tabela app_users...');
    const { data, error: insertError } = await supabase
      .from('app_users')
      .upsert({
        id: masterUser.id,
        email: 'brtreino@gmail.com',
        role: 'admin',
        nome: 'Admin Master'
      });

    if (insertError) {
      console.error('Erro ao inserir em app_users:', insertError);
    } else {
      console.log('Admin master gravado com sucesso na app_users!');
    }
  }
}

setup();

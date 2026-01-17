import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET single account
export async function GET({ params }) {
  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(account);
}

// PUT update account
export async function PUT({ params, request }) {
  const body = await request.json();
  const { name, type, currency, balance, description, tags } = body;

  // Update account with tags as simple array
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .update({
      name,
      type,
      currency,
      balance,
      description,
      tags: tags || [],
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single();

  if (accountError) {
    return json({ error: accountError.message }, { status: 500 });
  }

  return json(account);
}

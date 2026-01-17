import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET all accounts with their tags
export async function GET() {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(accounts);
}

// POST create new account
export async function POST({ request }) {
  const body = await request.json();
  const { name, type, currency, balance, description, tags } = body;

  // Insert account with tags as simple array
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      name,
      type,
      currency: currency || 'USD',
      balance: balance || 0,
      description,
      tags: tags || []
    })
    .select()
    .single();

  if (accountError) {
    return json({ error: accountError.message }, { status: 500 });
  }

  return json(account, { status: 201 });
}

// DELETE an account
export async function DELETE({ url }) {
  const id = url.searchParams.get('id');

  if (!id) {
    return json({ error: 'Account ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true });
}

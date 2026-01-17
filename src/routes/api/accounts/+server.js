import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET all accounts with their tags
export async function GET() {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select(`
      *,
      account_tags (
        tag_id,
        tags (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  // Transform the data to have a cleaner structure
  const transformedAccounts = accounts.map(account => ({
    ...account,
    tags: account.account_tags.map(at => at.tags)
  }));

  return json(transformedAccounts);
}

// POST create new account
export async function POST({ request }) {
  const body = await request.json();
  const { name, type, currency, description, tagIds } = body;

  // Insert account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      name,
      type,
      currency: currency || 'USD',
      description
    })
    .select()
    .single();

  if (accountError) {
    return json({ error: accountError.message }, { status: 500 });
  }

  // Add tags if provided
  if (tagIds && tagIds.length > 0) {
    const accountTags = tagIds.map(tagId => ({
      account_id: account.id,
      tag_id: tagId
    }));

    const { error: tagsError } = await supabase
      .from('account_tags')
      .insert(accountTags);

    if (tagsError) {
      return json({ error: tagsError.message }, { status: 500 });
    }
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

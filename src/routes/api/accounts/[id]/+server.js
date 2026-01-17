import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET single account
export async function GET({ params }) {
  const { data: account, error } = await supabase
    .from('accounts')
    .select(`
      *,
      account_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  const transformedAccount = {
    ...account,
    tags: account.account_tags.map(at => at.tags)
  };

  return json(transformedAccount);
}

// PUT update account
export async function PUT({ params, request }) {
  const body = await request.json();
  const { name, type, currency, description, tagIds } = body;

  // Update account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .update({
      name,
      type,
      currency,
      description,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single();

  if (accountError) {
    return json({ error: accountError.message }, { status: 500 });
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    // Delete existing tags
    await supabase
      .from('account_tags')
      .delete()
      .eq('account_id', params.id);

    // Add new tags
    if (tagIds.length > 0) {
      const accountTags = tagIds.map(tagId => ({
        account_id: params.id,
        tag_id: tagId
      }));

      const { error: tagsError } = await supabase
        .from('account_tags')
        .insert(accountTags);

      if (tagsError) {
        return json({ error: tagsError.message }, { status: 500 });
      }
    }
  }

  return json(account);
}

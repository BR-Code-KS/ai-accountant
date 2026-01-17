import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET all transactions with account and tag details
export async function GET({ url }) {
  const accountId = url.searchParams.get('accountId');
  const type = url.searchParams.get('type');

  let query = supabase
    .from('transactions')
    .select(`
      *,
      from_account:from_account_id (id, name, currency),
      to_account:to_account_id (id, name, currency),
      transaction_tags (
        tag_id,
        tags (*)
      )
    `)
    .order('transaction_date', { ascending: false });

  // Filter by account if provided
  if (accountId) {
    query = query.or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`);
  }

  // Filter by type if provided
  if (type) {
    query = query.eq('type', type);
  }

  const { data: transactions, error } = await query;

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  // Transform the data
  const transformedTransactions = transactions.map(transaction => ({
    ...transaction,
    tags: transaction.transaction_tags.map(tt => tt.tags)
  }));

  return json(transformedTransactions);
}

// POST create new transaction
export async function POST({ request }) {
  const body = await request.json();
  const { type, amount, fromAccountId, toAccountId, description, transactionDate, tagIds } = body;

  // Validate transaction type and required fields
  if (type === 'deposit' && !toAccountId) {
    return json({ error: 'Deposit requires to_account_id' }, { status: 400 });
  }
  if (type === 'expense' && !fromAccountId) {
    return json({ error: 'Expense requires from_account_id' }, { status: 400 });
  }
  if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
    return json({ error: 'Transfer requires both from_account_id and to_account_id' }, { status: 400 });
  }

  // Insert transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      type,
      amount,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      description,
      transaction_date: transactionDate
    })
    .select()
    .single();

  if (transactionError) {
    return json({ error: transactionError.message }, { status: 500 });
  }

  // Add tags if provided
  if (tagIds && tagIds.length > 0) {
    const transactionTags = tagIds.map(tagId => ({
      transaction_id: transaction.id,
      tag_id: tagId
    }));

    const { error: tagsError } = await supabase
      .from('transaction_tags')
      .insert(transactionTags);

    if (tagsError) {
      return json({ error: tagsError.message }, { status: 500 });
    }
  }

  return json(transaction, { status: 201 });
}

// DELETE a transaction
export async function DELETE({ url }) {
  const id = url.searchParams.get('id');

  if (!id) {
    return json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true });
}

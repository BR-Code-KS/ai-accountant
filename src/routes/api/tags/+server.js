import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

// GET all tags
export async function GET() {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(tags);
}

// POST create new tag
export async function POST({ request }) {
  const body = await request.json();
  const { name, color } = body;

  if (!name) {
    return json({ error: 'Tag name is required' }, { status: 400 });
  }

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({
      name,
      color: color || '#3B82F6'
    })
    .select()
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(tag, { status: 201 });
}

// DELETE a tag
export async function DELETE({ url }) {
  const id = url.searchParams.get('id');

  if (!id) {
    return json({ error: 'Tag ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true });
}

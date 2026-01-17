<script>
	import { onMount } from 'svelte';

	let tags = $state([]);
	let loading = $state(true);
	let showModal = $state(false);

	let formData = $state({
		name: '',
		color: '#3B82F6'
	});

	const colorPresets = [
		'#3B82F6', // Blue
		'#10B981', // Green
		'#EF4444', // Red
		'#F59E0B', // Amber
		'#8B5CF6', // Purple
		'#EC4899', // Pink
		'#06B6D4', // Cyan
		'#F97316'  // Orange
	];

	onMount(async () => {
		await loadTags();
	});

	async function loadTags() {
		loading = true;
		try {
			const res = await fetch('/api/tags');
			if (res.ok) {
				tags = await res.json();
			}
		} catch (error) {
			console.error('Error loading tags:', error);
		} finally {
			loading = false;
		}
	}

	function openModal() {
		formData = {
			name: '',
			color: '#3B82F6'
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	async function saveTag() {
		if (!formData.name.trim()) {
			alert('Tag name is required');
			return;
		}

		try {
			const res = await fetch('/api/tags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (res.ok) {
				closeModal();
				await loadTags();
			} else {
				const error = await res.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			console.error('Error saving tag:', error);
			alert('Error saving tag');
		}
	}

	async function deleteTag(id) {
		if (!confirm('Are you sure you want to delete this tag? It will be removed from all accounts and transactions.')) {
			return;
		}

		try {
			const res = await fetch(`/api/tags?id=${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				await loadTags();
			} else {
				const error = await res.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			console.error('Error deleting tag:', error);
			alert('Error deleting tag');
		}
	}
</script>

<div class="container">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
		<h1>Tags</h1>
		<button onclick={openModal}>Add Tag</button>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else if tags.length === 0}
		<div class="card">
			<p>No tags yet. Click "Add Tag" to create your first tag.</p>
		</div>
	{:else}
		<div class="card">
			<div style="display: grid; gap: 1rem;">
				{#each tags as tag}
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: #f9fafb; border-radius: 8px;">
						<div style="display: flex; align-items: center; gap: 1rem;">
							<div style="width: 40px; height: 40px; border-radius: 50%; background-color: {tag.color};"></div>
							<div>
								<div style="font-weight: 600; font-size: 1.125rem;">{tag.name}</div>
								<div style="font-size: 0.875rem; color: #6b7280;">{tag.color}</div>
							</div>
						</div>
						<button class="danger" style="padding: 0.5rem 1rem;" onclick={() => deleteTag(tag.id)}>
							Delete
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal" onclick={closeModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Add Tag</h2>
				<button class="close-button" onclick={closeModal}>&times;</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); saveTag(); }}>
				<div class="form-group">
					<label for="name">Tag Name *</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						required
						placeholder="e.g., Personal, Business, Groceries"
					/>
				</div>

				<div class="form-group">
					<label for="color">Color *</label>
					<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
						{#each colorPresets as color}
							<button
								type="button"
								style="width: 40px; height: 40px; border-radius: 50%; background-color: {color}; border: 3px solid {formData.color === color ? '#1f2937' : 'transparent'}; cursor: pointer;"
								onclick={() => formData.color = color}
							></button>
						{/each}
					</div>
					<input
						type="color"
						id="color"
						bind:value={formData.color}
						style="width: 100%; height: 50px; cursor: pointer;"
					/>
				</div>

				<div class="form-group">
					<label>Preview</label>
					<div style="display: inline-block;">
						<span class="tag" style="background-color: {formData.color}20; color: {formData.color}; font-size: 1rem; padding: 0.5rem 1rem;">
							{formData.name || 'Tag Name'}
						</span>
					</div>
				</div>

				<div class="button-group">
					<button type="submit">Create Tag</button>
					<button type="button" class="secondary" onclick={closeModal}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

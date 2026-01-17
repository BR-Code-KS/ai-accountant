<script>
	let {
		tags = [],
		onTagsChange
	} = $props();

	let newTagInput = $state('');

	function addTag() {
		const tagName = newTagInput.trim();
		if (tagName && !tags.includes(tagName)) {
			onTagsChange?.([...tags, tagName]);
			newTagInput = '';
		}
	}

	function removeTag(tagToRemove) {
		onTagsChange?.(tags.filter(tag => tag !== tagToRemove));
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addTag();
		}
	}
</script>

<div class="tag-selector">
	<div class="form-group">
		<label>Tags</label>

		<!-- Existing tags -->
		<div class="tag-list">
			{#each tags as tag}
				<span class="tag-badge">
					{tag}
					<button
						type="button"
						class="remove-tag"
						onclick={() => removeTag(tag)}
						title="Remove tag"
					>
						×
					</button>
				</span>
			{/each}
		</div>

		<!-- Add new tag input -->
		<div class="add-tag-input">
			<input
				type="text"
				bind:value={newTagInput}
				onkeypress={handleKeyPress}
				placeholder="Add a tag..."
			/>
			<button
				type="button"
				class="button-add"
				onclick={addTag}
				disabled={!newTagInput.trim()}
			>
				Add
			</button>
		</div>
	</div>
</div>

<style>
	.tag-selector {
		width: 100%;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #374151;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		min-height: 2rem;
	}

	.tag-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background-color: #3b82f6;
		color: white;
		border-radius: 9999px;
		font-size: 0.875rem;
	}

	.remove-tag {
		background: none;
		border: none;
		color: white;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		margin: 0;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.remove-tag:hover {
		background-color: rgba(0, 0, 0, 0.2);
	}

	.add-tag-input {
		display: flex;
		gap: 0.5rem;
	}

	.add-tag-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.button-add {
		padding: 0.5rem 1rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.button-add:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.button-add:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
</style>

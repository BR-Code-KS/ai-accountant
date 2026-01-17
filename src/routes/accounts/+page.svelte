<script>
	import { onMount } from 'svelte';
	import TagSelector from '$lib/components/TagSelector.svelte';

	let accounts = $state([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingAccount = $state(null);

	let formData = $state({
		name: '',
		type: 'income',
		currency: 'USD',
		balance: 0,
		description: '',
		tags: []
	});

	const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD'];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const accountsRes = await fetch('/api/accounts');
			if (accountsRes.ok) {
				accounts = await accountsRes.json();
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function openModal(account = null) {
		if (account) {
			editingAccount = account;
			formData = {
				name: account.name,
				type: account.type,
				currency: account.currency,
				balance: account.balance || 0,
				description: account.description || '',
				tags: account.tags || []
			};
		} else {
			editingAccount = null;
			formData = {
				name: '',
				type: 'income',
				currency: 'USD',
				balance: 0,
				description: '',
				tags: []
			};
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingAccount = null;
	}

	async function saveAccount() {
		try {
			const url = editingAccount
				? `/api/accounts/${editingAccount.id}`
				: '/api/accounts';

			const method = editingAccount ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (res.ok) {
				closeModal();
				await loadData();
			} else {
				const error = await res.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			console.error('Error saving account:', error);
			alert('Error saving account');
		}
	}

	async function deleteAccount(id) {
		if (!confirm('Are you sure you want to delete this account?')) {
			return;
		}

		try {
			const res = await fetch(`/api/accounts?id=${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				await loadData();
			} else {
				const error = await res.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			console.error('Error deleting account:', error);
			alert('Error deleting account');
		}
	}

	function handleTagsChange(newTags) {
		formData.tags = newTags;
	}

	function formatCurrency(amount, currency = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}
</script>

<div class="container">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
		<h1>Accounts</h1>
		<button onclick={() => openModal()}>Add Account</button>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else if accounts.length === 0}
		<div class="card">
			<p>No accounts yet. Click "Add Account" to create your first account.</p>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Currency</th>
							<th style="text-align: right;">Balance</th>
							<th>Tags</th>
							<th style="text-align: right;">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each accounts as account}
							<tr>
								<td>
									<div style="font-weight: 500;">{account.name}</div>
									{#if account.description}
										<div style="font-size: 0.875rem; color: #6b7280;">{account.description}</div>
									{/if}
								</td>
								<td style="text-transform: capitalize;">{account.type}</td>
								<td>{account.currency}</td>
								<td style="text-align: right; font-weight: 600;">
									{formatCurrency(account.balance, account.currency)}
								</td>
								<td>
									{#if account.tags && account.tags.length > 0}
										{#each account.tags as tag}
											<span class="tag" style="background-color: #3b82f620; color: #3b82f6;">
												{tag}
											</span>
										{/each}
									{/if}
								</td>
								<td style="text-align: right;">
									<button class="secondary" style="padding: 0.5rem 1rem; margin-right: 0.5rem;" onclick={() => openModal(account)}>
										Edit
									</button>
									<button class="danger" style="padding: 0.5rem 1rem;" onclick={() => deleteAccount(account.id)}>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal" onclick={closeModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{editingAccount ? 'Edit Account' : 'Add Account'}</h2>
				<button class="close-button" onclick={closeModal}>&times;</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); saveAccount(); }}>
				<div class="form-group">
					<label for="name">Account Name *</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						required
					/>
				</div>

				<div class="form-group">
					<label for="type">Account Type *</label>
					<select id="type" bind:value={formData.type} required>
						<option value="income">Income</option>
						<option value="expense">Expense</option>
					</select>
				</div>

				<div class="form-group">
					<label for="currency">Currency *</label>
					<select id="currency" bind:value={formData.currency} required>
						{#each currencies as currency}
							<option value={currency}>{currency}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="balance">Initial Amount *</label>
					<input
						type="number"
						id="balance"
						bind:value={formData.balance}
						step="0.01"
						required
					/>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={formData.description}
					></textarea>
				</div>

				<TagSelector
					tags={formData.tags}
					onTagsChange={handleTagsChange}
				/>

				<div class="button-group">
					<button type="submit">
						{editingAccount ? 'Update' : 'Create'} Account
					</button>
					<button type="button" class="secondary" onclick={closeModal}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

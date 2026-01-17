<script>
	import { onMount } from 'svelte';

	let transactions = $state([]);
	let accounts = $state([]);
	let tags = $state([]);
	let loading = $state(true);
	let showModal = $state(false);

	let formData = $state({
		type: 'deposit',
		amount: '',
		fromAccountId: '',
		toAccountId: '',
		description: '',
		transactionDate: new Date().toISOString().split('T')[0],
		tagIds: []
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [transactionsRes, accountsRes, tagsRes] = await Promise.all([
				fetch('/api/transactions'),
				fetch('/api/accounts'),
				fetch('/api/tags')
			]);

			if (transactionsRes.ok) {
				transactions = await transactionsRes.json();
			}
			if (accountsRes.ok) {
				accounts = await accountsRes.json();
			}
			if (tagsRes.ok) {
				tags = await tagsRes.json();
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function openModal() {
		formData = {
			type: 'deposit',
			amount: '',
			fromAccountId: '',
			toAccountId: '',
			description: '',
			transactionDate: new Date().toISOString().split('T')[0],
			tagIds: []
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	async function saveTransaction() {
		try {
			const res = await fetch('/api/transactions', {
				method: 'POST',
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
			console.error('Error saving transaction:', error);
			alert('Error saving transaction');
		}
	}

	async function deleteTransaction(id) {
		if (!confirm('Are you sure you want to delete this transaction?')) {
			return;
		}

		try {
			const res = await fetch(`/api/transactions?id=${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				await loadData();
			} else {
				const error = await res.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			console.error('Error deleting transaction:', error);
			alert('Error deleting transaction');
		}
	}

	function toggleTag(tagId) {
		if (formData.tagIds.includes(tagId)) {
			formData.tagIds = formData.tagIds.filter(id => id !== tagId);
		} else {
			formData.tagIds = [...formData.tagIds, tagId];
		}
	}

	function formatCurrency(amount, currency = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString();
	}

	// Get filtered accounts based on transaction type
	function getAvailableAccounts(type, field) {
		if (type === 'deposit' && field === 'to') {
			return accounts.filter(a => a.type === 'asset');
		}
		if (type === 'expense' && field === 'from') {
			return accounts.filter(a => a.type === 'asset');
		}
		if (type === 'transfer') {
			return accounts.filter(a => a.type === 'asset');
		}
		return accounts;
	}
</script>

<div class="container">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
		<h1>Transactions</h1>
		<button onclick={openModal}>Add Transaction</button>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else if transactions.length === 0}
		<div class="card">
			<p>No transactions yet. Click "Add Transaction" to create your first transaction.</p>
		</div>
	{:else}
		<div class="card">
			<ul class="transaction-list">
				{#each transactions as transaction}
					<li class="transaction-item">
						<div class="transaction-info" style="flex: 1;">
							<h4>
								{#if transaction.type === 'deposit'}
									Deposit to {transaction.to_account?.name || 'Unknown'}
								{:else if transaction.type === 'transfer'}
									Transfer: {transaction.from_account?.name} → {transaction.to_account?.name}
								{:else}
									Expense from {transaction.from_account?.name || 'Unknown'}
								{/if}
							</h4>
							<p>{transaction.description || 'No description'} • {formatDate(transaction.transaction_date)}</p>
							{#if transaction.tags && transaction.tags.length > 0}
								<div style="margin-top: 0.5rem;">
									{#each transaction.tags as tag}
										<span class="tag" style="background-color: {tag.color}20; color: {tag.color};">
											{tag.name}
										</span>
									{/each}
								</div>
							{/if}
						</div>
						<div style="display: flex; align-items: center; gap: 1rem;">
							<div class="transaction-amount {transaction.type === 'deposit' ? 'positive' : 'negative'}">
								{transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.to_account?.currency || transaction.from_account?.currency)}
							</div>
							<button class="danger" style="padding: 0.5rem 1rem;" onclick={() => deleteTransaction(transaction.id)}>
								Delete
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal" onclick={closeModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Add Transaction</h2>
				<button class="close-button" onclick={closeModal}>&times;</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); saveTransaction(); }}>
				<div class="form-group">
					<label for="type">Transaction Type *</label>
					<select id="type" bind:value={formData.type} required>
						<option value="deposit">Deposit (Add money to account)</option>
						<option value="transfer">Transfer (Between accounts)</option>
						<option value="expense">Expense (Remove money from account)</option>
					</select>
				</div>

				{#if formData.type === 'deposit'}
					<div class="form-group">
						<label for="toAccount">To Account (Asset) *</label>
						<select id="toAccount" bind:value={formData.toAccountId} required>
							<option value="">Select account</option>
							{#each getAvailableAccounts('deposit', 'to') as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
					</div>
				{:else if formData.type === 'expense'}
					<div class="form-group">
						<label for="fromAccount">From Account (Asset) *</label>
						<select id="fromAccount" bind:value={formData.fromAccountId} required>
							<option value="">Select account</option>
							{#each getAvailableAccounts('expense', 'from') as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
					</div>
				{:else if formData.type === 'transfer'}
					<div class="form-group">
						<label for="fromAccount">From Account *</label>
						<select id="fromAccount" bind:value={formData.fromAccountId} required>
							<option value="">Select account</option>
							{#each getAvailableAccounts('transfer', 'from') as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="toAccount">To Account *</label>
						<select id="toAccount" bind:value={formData.toAccountId} required>
							<option value="">Select account</option>
							{#each getAvailableAccounts('transfer', 'to').filter(a => a.id !== formData.fromAccountId) as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="form-group">
					<label for="amount">Amount *</label>
					<input
						type="number"
						id="amount"
						bind:value={formData.amount}
						step="0.01"
						min="0.01"
						required
					/>
				</div>

				<div class="form-group">
					<label for="transactionDate">Date *</label>
					<input
						type="date"
						id="transactionDate"
						bind:value={formData.transactionDate}
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

				{#if tags.length > 0}
					<div class="form-group">
						<label>Tags</label>
						<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
							{#each tags as tag}
								<button
									type="button"
									class="tag"
									style="background-color: {formData.tagIds.includes(tag.id) ? tag.color : tag.color + '20'}; color: {formData.tagIds.includes(tag.id) ? 'white' : tag.color}; cursor: pointer; border: none;"
									onclick={() => toggleTag(tag.id)}
								>
									{tag.name}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<div class="button-group">
					<button type="submit">Create Transaction</button>
					<button type="button" class="secondary" onclick={closeModal}>Cancel</button>
				</div>
			</form>
		</div>
	</div>
{/if}

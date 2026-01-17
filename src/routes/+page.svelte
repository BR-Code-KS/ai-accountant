<script>
	import { onMount } from 'svelte';

	let accounts = $state([]);
	let recentTransactions = $state([]);
	let loading = $state(true);
	let stats = $state({
		totalAssets: 0,
		totalIncome: 0,
		totalExpenses: 0
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			// Load accounts
			const accountsRes = await fetch('/api/accounts');
			if (accountsRes.ok) {
				accounts = await accountsRes.json();
				calculateStats();
			}

			// Load recent transactions
			const transactionsRes = await fetch('/api/transactions');
			if (transactionsRes.ok) {
				const allTransactions = await transactionsRes.json();
				recentTransactions = allTransactions.slice(0, 5);
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function calculateStats() {
		stats.totalAssets = accounts
			.filter(a => a.type === 'asset')
			.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

		stats.totalIncome = accounts
			.filter(a => a.type === 'income')
			.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

		stats.totalExpenses = accounts
			.filter(a => a.type === 'expense')
			.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
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
</script>

<div class="container">
	<h1 style="margin-bottom: 2rem;">Dashboard</h1>

	{#if loading}
		<p>Loading...</p>
	{:else}
		<!-- Statistics Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<h3>Total Assets</h3>
				<div class="value">{formatCurrency(stats.totalAssets)}</div>
			</div>
			<div class="stat-card">
				<h3>Total Income</h3>
				<div class="value" style="color: #10b981;">{formatCurrency(stats.totalIncome)}</div>
			</div>
			<div class="stat-card">
				<h3>Total Expenses</h3>
				<div class="value" style="color: #ef4444;">{formatCurrency(stats.totalExpenses)}</div>
			</div>
		</div>

		<!-- Accounts Overview -->
		<div class="card">
			<h2>Accounts Overview</h2>
			{#if accounts.length === 0}
				<p>No accounts yet. <a href="/accounts">Create your first account</a></p>
			{:else}
				<div class="grid">
					{#each accounts as account}
						<div class="account-card">
							<h3>{account.name}</h3>
							<div class="balance">{formatCurrency(account.balance, account.currency)}</div>
							<div class="type">{account.type}</div>
							{#if account.tags && account.tags.length > 0}
								<div style="margin-top: 0.75rem;">
									{#each account.tags as tag}
										<span class="tag" style="background-color: {tag.color}20; color: {tag.color};">
											{tag.name}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Recent Transactions -->
		<div class="card">
			<h2>Recent Transactions</h2>
			{#if recentTransactions.length === 0}
				<p>No transactions yet. <a href="/transactions">Create your first transaction</a></p>
			{:else}
				<ul class="transaction-list">
					{#each recentTransactions as transaction}
						<li class="transaction-item">
							<div class="transaction-info">
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
							</div>
							<div class="transaction-amount {transaction.type === 'deposit' ? 'positive' : 'negative'}">
								{transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.to_account?.currency || transaction.from_account?.currency)}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

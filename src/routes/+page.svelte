<script>
	import { onMount } from 'svelte';

	let accounts = $state([]);
	let recentTransactions = $state([]);
	let loading = $state(true);
	let statsByCurrency = $state({});

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
		const currencyGroups = {};

		// Group accounts by currency and calculate totals
		accounts.forEach(account => {
			const currency = account.currency || 'USD';
			if (!currencyGroups[currency]) {
				currencyGroups[currency] = {
					totalIncome: 0,
					totalExpenses: 0
				};
			}

			const balance = parseFloat(account.balance || 0);
			if (account.type === 'income') {
				currencyGroups[currency].totalIncome += balance;
			} else if (account.type === 'expense') {
				currencyGroups[currency].totalExpenses += balance;
			}
		});

		// Filter out currencies with zero balances across all categories
		statsByCurrency = Object.fromEntries(
			Object.entries(currencyGroups).filter(([_, stats]) =>
				stats.totalIncome !== 0 || stats.totalExpenses !== 0
			)
		);
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
		<!-- Statistics Cards by Currency -->
		{#if Object.keys(statsByCurrency).length === 0}
			<p>No account data available. <a href="/accounts">Create your first account</a></p>
		{:else}
			{#each Object.entries(statsByCurrency) as [currency, stats]}
				<div class="card" style="margin-bottom: 2rem;">
					<h2>{currency} Summary</h2>
					<div class="stats-grid">
						<div class="stat-card">
							<h3>Total Income</h3>
							<div class="value" style="color: #10b981;">{formatCurrency(stats.totalIncome, currency)}</div>
						</div>
						<div class="stat-card">
							<h3>Total Expenses</h3>
							<div class="value" style="color: #ef4444;">{formatCurrency(stats.totalExpenses, currency)}</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}

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
										<span class="tag" style="background-color: #3b82f620; color: #3b82f6;">
											{tag}
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

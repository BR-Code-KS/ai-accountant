<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<div class="nav-content">
		<h1>AI Accountant</h1>
		<ul>
			<li><a href="/">Dashboard</a></li>
			<li><a href="/accounts">Accounts</a></li>
			<li><a href="/transactions">Transactions</a></li>
			<li><a href="/tags">Tags</a></li>
		</ul>
	</div>
</nav>

{@render children()}

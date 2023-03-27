<script lang="ts">
	import '../app.css';
	import CircularLoader from '../components/utils/CircularLoader.svelte';
	import SideBar from './sidebar/SideBar.svelte';
	import Products from './products/Products.svelte';
	import OptionsBar from './optionsbar/OptionsBar.svelte';
	import Control from './control/Control.svelte';
	import { getProducts, loadEmployees } from '../services/db.service';
	import { onMount } from 'svelte';
	import { authUser, cashier } from '../services/stores.service';
	import { getAuth } from '../services/auth.service';
	import type Product from '../models/product.model';

	let prods: Product[] = [];

	onMount(() => {
		loadEmployees();
		getProducts().then((ps) => (prods = ps));
		if (!$authUser || !$authUser.username) $authUser = getAuth();
		if (!$authUser || !$authUser.username) {
			let modal = document.getElementById('modal-registro');
			modal!.classList.add('is-visible');
		}
	});
</script>

<main>
	<div id="layout">
		<SideBar />
		{#if !prods}
			<CircularLoader />
		{:else}
			<Products {prods} />
			<OptionsBar {prods} />
		{/if}
		<Control />
	</div>
</main>

<style global>
</style>

<script lang="ts">
	import { scale, slide } from 'svelte/transition';
	import { afterUpdate } from 'svelte/internal';
	import { formatValue, lrslide } from '../../services/utils.service';

	import { bill, products, valor } from '../../services/stores.service';
	import type { Complement } from '../../models/product.model';
	import type Product from '../../models/product.model';

	let current: number = -1;
	let editable: number = -1;

	

	afterUpdate(() => {
		if ($bill.length) {
			if (current < 0 && editable < 0) {
				let lastElem = document.getElementById('list-end');
				lastElem?.scrollIntoView({
					behavior: 'smooth'
				});
			}
		} else if (!$bill.length) {
			editable = -1;
			current = -1;
		}
	});

	const addComplement = (comp: Product, index: number) => {
		let complement = comp as Complement;
		if ($bill[index].complementos === undefined) {
			$bill[index].complementos = [complement];
		} else {
			let compIndex = $bill[index].complementos?.findIndex((c) => c.id === comp.id) ?? -1;
			let ptemp = $bill[index];
			if (compIndex < 0) {
				ptemp.complementos?.push(complement);
			} else {
				ptemp.complementos?.splice(compIndex, 1);
			}
			$bill[index] = ptemp;
		}
	};

</script>

<div id="factura">
	{#each $bill as prod, index}
		<!-- Si el elemento actual es seleccionado se muestran las opciones -->
		<div class="item" in:lrslide out:slide>
			{#if current === index}
				<div class="options" transition:lrslide>
					<button
						on:click={() => {
							// Se elimina el elemento de la factura
							$bill.splice(index, 1);
							current = -1;
							editable = -1;
						}}
						class="option"
						style="background-color: white-smoke;">❌</button
					>
					<button
						class="option"
						style="background-color: orange;"
						on:click={() => {
							$bill[index].llevar = !$bill[index].llevar
							current = -1;
						}}> 🥡 </button>
				</div>
			{/if}
			<button
				class="element"
				transition:scale
				on:click={() => {
					if (editable >= 0) editable = -1;
					// current = (current - index)? index : -1;
					current = current === index ? -1 : index;
				}}
				on:dblclick|preventDefault={() => {
					if (current >= 0) current = -1;
					editable = editable >= 0 || editable === index ? -1 : index;
				}}
				on:contextmenu|preventDefault={() => {
					if (current >= 0) current = -1;
					editable = editable >= 0 || editable === index ? -1 : index;
				}}>
				<div class="element-cant">{prod.cantidad}</div>
				<div class="element-name">
					{prod.nombre}
					{#if prod.complementos?.length}
						<div class="element-comps">
							{#each prod.complementos as comp}
								{comp.abreviatura}
							{/each}
						</div>
					{/if}
				</div>

				<div class="element-val">
					{formatValue(
						((prod.cantidad ?? 1) *
							(prod.valor +
								(prod.complementos?.reduce((ac, cu) => (ac + cu.valor), 0)??0) +
								(prod.llevar ? (['sopa', 'bandeja'].includes(prod.categoria) ? 800 : 0) : 0))) /
							1000
					)}
				</div>
				{#if prod.llevar}
					<span class="delivery-indicator" transition:scale>⬤</span>
				{/if}
			</button>
			{#if editable === index && prod.categoria === 'bandeja'}
				<div />
				<!-- este div es para forzar el salto de linea jajaja  -->
				<div class="complementos" transition:slide>
					{#each $products.filter((p) => p.complemento) as comp}
						<button class="flat complemento" on:click={() => addComplement(comp, index)}
							>{comp.abreviatura}</button
						>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
	<div id="list-end" />
</div>

<style>
	/* Identificador de la factura, elemento que lista los productos y us opciones */
	#factura {
		box-shadow: var(--inset-shadow);
		overflow-y: scroll;
		width: 95%;
		margin: 2.5% 1%;
		height: 35%;
		display: flex;
		flex-direction: column;
		border-radius: var(--border-radius);
	}

	/* #factura > *{
        fon
    } */

	/* contenedor de los productos y sus opciones */
	.item {
		flex-shrink: 0;

		display: grid;
		grid-template-columns: minmax(80px, 1fr) auto;
		min-height: 21%;
		height: min-content;
		overflow: hidden;
		width: 100%;
	}

	/* Representa a un producto y muestra su info dentro del item */
	.element {
		border: none;
		display: flex;
		background-color: transparent;
		position: relative;
		border-bottom: 1px solid #bbb;
		border-bottom-right-radius: calc(1.2 * var(--border-radius));
		justify-content: space-between;
		align-items: center;
		text-align: center;
		padding: 10px;
		min-width: 150px;
		height: 100%;
	}

	.element-comps {
		width: 100%;
		display: flex;
		justify-content: space-evenly;
	}

	.delivery-indicator {
		position: absolute;
		color: orange;
		top: 55%;
		right: 8%;
	}

	.options {
		display: flex;
		align-items: center;
		justify-content: start;
		height: 100%;
		border-top-left-radius: calc(2 * var(--border-radius));
		border-bottom-left-radius: calc(2 * var(--border-radius));
		overflow: hidden;
	}

	.option {
		width: 50%;
		height: 100%;
		font-size: 20px;
		color: white;
	}

	.complementos {
		height: 80px;
		font-size: 18px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;
	}

	.complemento {
		width: 21%;
		height: 40%;
		text-align: center;
	}
</style>

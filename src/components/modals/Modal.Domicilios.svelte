<script lang="ts">
	import { scale } from 'svelte/transition';

	import CircularLoader from '../../components/utils/CircularLoader.svelte';
	import { formatDate, formatValue, showModal } from '../../services/utils.service';
	import {
		employees,
		products,
		bill,
		authUser,
		loadedDom,
		domiciliario
	} from '../../services/stores.service';
	import type Delivery from '../../models/delivery.model';
	import type { Complement, ProductBill } from '../../models/product.model';
	import { getActiveDoms } from '../../services/delivery.service';
	import { getDeliveryProdsByBillId, payDom } from '../../services/billing.service';
	import type Product from '../../models/product.model';
	
	function pay_dom(domId: string, domiId: string) {}

	let idDelete: string = '';

	let selectedDomiciliario: string = '';

	export let active: boolean;

	let selectedDoms: Delivery[] = [];
	let markedDoms: Delivery[] = [];

	$: total = selectedDoms.reduce((acc, dom) => acc + dom.valor, 0);

	function clear() {
		selectedDoms = [];
		markedDoms = [];
		idDelete = '';
		active = false;
	}

	function setDoms(dom: Delivery) {
		if ($authUser.role === 'register' && selectedDomiciliario !== '') {
			selectedDoms = [...selectedDoms, dom];
		} else {
			selectedDoms = [dom];
		}
	}

    const loadProds = (ps: ProductBill[], b: Product[]) => {
		ps.forEach((prod: ProductBill) => {
			let ptp = $products.find((p) => p.id === prod.productoId);
			if (ptp) {
				let ptemp = { ...ptp, llevar: true, cantidad: prod.cantidad };

				let comps: Complement[] = [];
				prod.complementos?.forEach((c: string) => {
					let ct: Product | undefined = $products.find((p) => p.id === c);
					if (ct)
						comps.push({
							id: ct.id,
							valor: ct.valor,
							abreviatura: ct.abreviatura ?? 'cmp'
						} as Complement);
				});
				if (comps) ptemp.complementos = comps;
				b.push(ptemp);
			}
		});
		bill.set(b);
	};

    function displayProd(p: ProductBill): string[]{
        if (!p)
            return ['There is not product']
        return [p.cantidad?.toString()??'0', $products.find((prod) => prod.id === p.productoId)?.nombre??'', p.complementos?.reduce((ac, cu)=> ac+=$products.find(prod=>prod.id==cu)?.abreviatura, '')??'']
    }
</script>

<div class="modal-domicilios">
	{#await getActiveDoms()}
		<CircularLoader />
	{:then domicilios}
		<div class="domiciliarios">
			{#each $employees.filter((e) => e.cargos.includes('domiciliario')) as emp}
				<button
					class="flat domiciliario"
					on:click={() => {
						selectedDoms = [];
						selectedDomiciliario = emp.id;
					}}
				>
					{emp.nombre}
				</button>
			{/each}
		</div>
		<div class="domicilios">
			<div class="domicilios-header">
				{selectedDomiciliario != ''
					? $employees.find((e) => e.id === selectedDomiciliario)?.nombre
					: 'Domiciliario no seleccionado.'}
			</div>
			<div class="domicilios-list">
				{#each domicilios
					.filter((d) => !selectedDoms.includes(d) && d.domiciliario === selectedDomiciliario)
					.sort((a, b) => a.estado?.localeCompare(b.estado)) as dom}
					<button
						class="flat domicilio"
						disabled={dom.estado === 'pendiente'}
						class:marked={markedDoms.includes(dom)}
						on:click={() => {
							if (dom.estado !== 'pendiente') {
								markedDoms = markedDoms.filter((m) => m.id !== dom.id);
								setDoms(dom);
							}
						}}
						on:contextmenu|preventDefault={() => {
							if (markedDoms.includes(dom)) {
								markedDoms = markedDoms.filter((m) => m.id !== dom.id);
							} else {
								markedDoms = [...markedDoms, dom];
							}
						}}
					>
						<p>
							..{dom.id?.substring(8)}
						</p>
						<p>
							{formatDate(new Date(dom.created))}
						</p>
						<p>
							{$employees.find((e) => e.id === dom.domiciliario)?.nombre ?? 'sin asignar'}
						</p>
						<span class={'dom-value ' + dom.metodo_pago}>
							{formatValue(dom.valor)}
						</span>
					</button>
				{/each}
			</div>
		</div>
		{#if selectedDoms.length}
			<div class="control-container">
				{#if total}
					<div
						style="width: 95%; display: flex; justify-content: space-evenly; align-items:center;"
					>
						<span>{selectedDoms.length}:</span>
						<h2>
							{formatValue(total)}
						</h2>
					</div>
				{/if}
				<div class="control" transition:scale>
					{#if $authUser.role === 'register'}
						{#each selectedDoms as sdom}
							<button
								transition:scale
								class="flat domicilio"
								on:click={() => (selectedDoms = selectedDoms.filter((sd) => sd.id != sdom.id))}
							>
								{sdom.id}
							</button>
						{/each}
					{:else if selectedDoms.length}
						{#await getDeliveryProdsByBillId(selectedDoms[0].id) then prods}
							<div class="info-dom">
								<span>
									fecha: 
                                    {formatDate(new Date(selectedDoms[0].created))}
								</span>
								<span>
									Asigna: {selectedDoms[0].cajero
										? $employees.find((e) => e.id === selectedDoms[0].cajero)?.nombre
										: 'sin asignar'}
								</span>
								<span>
									Envío: {formatValue(selectedDoms[0].envio)}
								</span>
							</div>
							{#each prods as prod}
								<div class="producto-domicilio">
                                    {displayProd(prod)}
								</div>
							{/each}
						{/await}
					{/if}
				</div>
				{#if $authUser.role && $authUser?.role === 'register'}
					<div class="options">
						<button
							class="cerrar"
							on:click={() => {
								clear();
								document.getElementById('modal-domicilios')?.classList?.remove('is-visible');
							}}
						>
							❌
						</button>
						<button
							class="aceptar"
							on:click={async () => {
								document.getElementById('modal-domicilios')?.classList?.remove('is-visible');
                                if (selectedDomiciliario === '') {
									getDeliveryProdsByBillId(selectedDoms[0].id).then((ps) => {
                                        loadProds(ps, [{
											id: '1000000072',
											nombre: 'Envío',
											categoria: 'envio',
											valor: selectedDoms[0].envio,
											llevar: true,
											cantidad: 1
										}]);
									});
                                    showModal('selector-domiciliario');
									$loadedDom = selectedDoms[0].id;
									active = false;
									return;
								}

								for (const dom of selectedDoms) {
									let prods = await getDeliveryProdsByBillId(dom.id);
                                    loadProds(prods, [{
										id: '1000000072',
										nombre: 'Envío',
										categoria: 'envio',
										valor: dom.envio,
										llevar: true,
										cantidad: 1
									}]);
                                    payDom(dom.id, dom.domiciliario??'');
									$domiciliario =
										$employees.find((e) => e.id === dom.domiciliario) ?? $domiciliario;
									if ($bill.length) {
										if (window.ELECTRON_API) await window.ELECTRON_API.printWebContent();
										else window.print();
									} else console.log('No hubo produtos :)');
								}
								clear();
							}}
						>
							ACEPTAR
						</button>
					</div>
				{/if}
			</div>
		{/if}
	{/await}
</div>

<style>
	.modal-domicilios {
		width: 70vw;
		height: 60vh;
		padding: 0.5rem;
		display: flex;
	}

	.domiciliarios {
		margin: 0.5%;
		border-radius: var(--border-radius);
		box-shadow: var(--inset-shadow);
		flex: 1;
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.domiciliario {
		width: 95%;
		margin: auto;
		height: 4rem;
	}

	.domicilios {
		margin: 0.5%;
		border-radius: var(--border-radius);
		box-shadow: var(--inset-shadow);

		flex: 2;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.domicilios-header {
		width: 100%;
		height: 10%;
	}
	.domicilios-list {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
		grid-template-rows: repeat(auto-fill, minmax(8rem, 1fr));
	}

	.domicilio {
		margin: 15px;
		min-height: 10%;
	}
	.domicilio:disabled {
		background-color: midnightblue;
		color: whitesmoke;
	}
	.marked {
		background-color: brown;
		color: whitesmoke;
	}
	.dom-value {
		background-color: #337233aa;
		border-radius: var(--border-radius);
		color: whitesmoke;
		padding: 0.2rem;
	}
	.nequi {
		background-color: #393372aa;
	}

	.control-container {
		margin: 0.5%;
		border-radius: var(--border-radius);

		flex: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.control {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: scroll;
		border-radius: var(--border-radius);
		box-shadow: var(--inset-shadow);
	}
	.info-dom {
		height: 20%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		background-color: #7774;
	}

	.producto-domicilio {
		height: 10%;
		max-height: 15%;
	}
	.options {
		width: 100%;
		height: 15%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: var(--border-radius);
		overflow: hidden;
	}
	.options > button {
		height: 100%;
		border: none;
		font-size: 1.2rem;
		color: whitesmoke;
		font-weight: bold;
		cursor: pointer;
	}
	.cerrar {
		width: 35%;
		background: linear-gradient(225deg, #f9cfc7, #e8beb6);
	}
	.aceptar {
		width: 65%;
		background: linear-gradient(225deg, #66aa66, #559955);
	}
</style>

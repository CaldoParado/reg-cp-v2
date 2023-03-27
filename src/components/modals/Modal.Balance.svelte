<script lang="ts">
	import { loadBalance, loadBalanceDoms } from '../../services/balance.service';
	import { formatValue } from '../../services/utils.service';

	let stats = {
		facturado: 0,
		cajeros: {} as any,
		metodos_pago: {} as any
	};
	let statsDoms = {
		domicilios: 0,
		cajeros: {} as any,
		metodos_pago: {} as any,
		domiciliarios: {} as any
	};
	// let statsInvoices = {
	// 	facturado: 0,
	// 	cajeros: {} as any,
	// 	metodos_pago: {} as any
	// };

	let d1: string = '';
	let msg: string = '';
</script>

<div id="dialog-balance">
	<div class="element filters">
		<div class="filter">f1</div>
		<div class="filter">f1</div>
		<div class="filter">f1</div>
		<div class="filter">f1</div>
	</div>
	<div class="element results">
		<span>{msg} facturado = {formatValue(stats.facturado)}</span>
		{#if stats.facturado}
			<span>{JSON.stringify(stats, null, 3)}</span>
		{/if}
		<hr />
		<hr />
		<span>Domicilios = {formatValue(statsDoms.domicilios)}</span>
		{#if statsDoms.domicilios}
			<span>{JSON.stringify(statsDoms, null, 3)}</span>
		{/if}
	</div>
	<div class="element load">
		<button
			class="load-button"
			on:click={() => {
				if (!d1) {
					msg = 'No hay fecha cargada';
				} else {
					let d = new Date(d1);
					const year = d.getFullYear();
					const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
					const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
					let d2 = `${year}-${month}-${day}`;
					loadBalanceDoms(d2 + ' 16:00:00.000', d1 + ' 16:00:00.000').then((recs) => {
						recs.forEach((b) => {
							statsDoms.domicilios += b.valor;
							statsDoms.metodos_pago[b.metodo_pago ?? 'efectivo'] =
								b.valor + (statsDoms.metodos_pago[b.metodo_pago] ?? 0);
							statsDoms.cajeros[b.cajero] = b.valor + (statsDoms.cajeros[b.cajero] ?? 0);
							statsDoms.domiciliarios[b.domiciliario?b.domiciliario:'No_asignado'] =
								b.valor + (statsDoms.domiciliarios[b.domiciliario?b.domiciliario:'No_asignado'] ?? 0);
						});
					});
					loadBalance(d2 + ' 16:00:00.000', d1 + ' 16:00:00.000').then((recs) => {
						recs.forEach((b) => {
							stats.facturado += b.valor;
							stats.metodos_pago[b.metodo_pago ?? 'efectivo'] =
								b.valor + (stats.metodos_pago[b.metodo_pago] ?? 0);
							stats.cajeros[b.cajero] = b.valor + (stats.cajeros[b.cajero] ?? 0);
						});
					});
				}
			}}>Cargar</button
		>
	</div>
	<div class="element calendar">
		<button
			on:click={() => {
				d1 = '';
			}}>Reset</button
		>
		<input type="date" name="date" id="date-picker" class="date-picker" bind:value={d1} />
	</div>
</div>

<style>
	.load-button {
		width: 90%;
		height: 90%;
	}
	.results {
		display: flex;
		flex-direction: column;
	}

	#dialog-balance {
		max-width: 60vw;
		width: 60vw;
		max-height: 80vh;
		height: 80vh;

		display: grid;
		gap: 6px;
		grid-template-columns: 1fr 3fr;
		grid-template-rows: 5fr 1fr;
	}

	.element {
		width: 100%;
		height: 100%;
		background-color: burlywood;
		border: 1px solid tomato;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.filters {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}
	.filter {
		background-color: aqua;
	}

	.date-picker {
		width: 35%;
		height: 35%;
		background-color: bisque;
	}
	.calendar {
		background-color: blue;
		display: flex;
		align-items: center;
		justify-content: space-around;
		/* grid-area: 2/1/2/3; */
	}
</style>

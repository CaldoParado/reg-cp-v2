<script lang="ts">
	import Icon from '../../components/Icon.svelte';

	import { authUser, bill, cashier, domiciliario } from '../../services/stores.service';
	import { formatValue } from '../../services/utils.service';

	export let total: number;
	export let billete: number = 0;
	export let metodoPago: { name: string; icon: string; background: string };

	$: shouldShowHeader = $authUser?.role !== 'kiosk' || ($bill[0]?.categoria !== 'envio')
</script>

<!-- Ticket header -->
<div id="ticket-header">
	{#if shouldShowHeader}
		<Icon name="logo" width="35%" color={'black'} />
		<p>
			<strong>Caldo Parado ⬤ 69</strong> <br />
			<small>NIT:</small> <i>79655.331 - 1</i> <br />
			<small>Tels:</small> <i>3142149395 - 3110614</i> <br />
			{new Date().toLocaleString('es-CO', {
				weekday: 'short',
				year: '2-digit',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			})}
			<br /> <strong>Caja:</strong> <i>{$cashier.nombre}</i>
			<strong>Mesa:</strong> <i>999</i>
		</p>
	{:else}
		<div>
			<h2>
				<strong
					>Domicilio - {$domiciliario.id !== '' ? $domiciliario.nombre : 'No asignado.'}</strong
				>
			</h2>
			<hr />
			<h3>
				Creado el {new Date().toLocaleString('es-CO', {
					weekday: 'short',
					year: '2-digit',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					hour12: true
				})}
			</h3>
			<strong>
				No es factura de cobro: {formatValue(total)}
			</strong>
		</div>
	{/if}
</div>
<!-- Products content -->
<table>
	<tr>
		<th>Uds.</th>
		<th>Producto.</th>
		{#if shouldShowHeader}
			<th>Valor.</th>
		{/if}
	</tr>
	{#each $bill as prod}
		<tr>
			<td>{prod.cantidad}</td>
			<td class:delivery-prod={prod.llevar}
				>{prod.nombre}{#if prod.complementos}
					{#each prod.complementos as comp}
						<span>{comp.abreviatura}</span>
					{/each}
				{/if}</td
			>
			{#if shouldShowHeader || prod.categoria === 'envio'}
				<td
					>{formatValue(
						(prod.cantidad ?? 1) *
							(prod.valor +
								(prod.complementos?.reduce((pr, cu) => pr + cu.valor, 0) ?? 0) +
								(prod.llevar ? (['sopa', 'bandeja'].includes(prod.categoria) ? 800 : 0) : 0))
					)}</td
				>
			{/if}
		</tr>
	{/each}
</table>
{#if shouldShowHeader}
	<table id="ticket-footer">
		<tr>
			<td class="ticket-footer-info">Total:</td>
			<td class="ticket-footer-detail">{formatValue(total)}</td>
		</tr>
		<tr>
			<td class="ticket-footer-info">Metodo de pago:</td>
			<td class="ticket-footer-detail">{metodoPago.name}</td>
		</tr>
		{#if billete}
			<tr>
				<td class="ticket-footer-info">Cambio:</td>
				<td class="ticket-footer-detail">{formatValue(billete - total)}</td>
			</tr>
		{/if}
		{#if $bill[0]?.categoria === 'envio'}
			<tr>
				<td class="ticket-footer-info">Responsable:</td>
				<td class="ticket-footer-detail">{$domiciliario.nombre}</td>
			</tr>
		{/if}
	</table>
	<div style="text-align: center; width:100%; font-size: 20px;">
		<strong>¡Muchas gracias por su compra!</strong>
	</div>
{/if}

<style>
	td {
		font-size: 24px;
	}

	.delivery-prod {
		border: 2px inset black;
		border-left-width: 8px;
	}
</style>

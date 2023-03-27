<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	//  Utilities  ---------------------------------------------------------------------------------------------------------------
	import { formatValue, lrslide, rlslide, showModal, showTime } from '../../services/utils.service';

	import Icon from '../../components/Icon.svelte';

	import JsBarcode from 'jsbarcode';

	//  Utilities  ---------------------------------------------------------------------------------------------------------------

	//  Stores ---------------------------------------------------------------------------------------------------------------
	import {
		cashier,
		domiciliario,
		employees,
		bill,
		cantidad,
		products,
		authUser,
		loadedDom,
		valor,
		loadedInv
	} from '../../services/stores.service';
	//  Stores  ---------------------------------------------------------------------------------------------------------------

	//  Models  ---------------------------------------------------------------------------------------------------------------
	import type Product from '../../models/product.model';
	import type Employee from '../../models/employee.model';
	//  Models  ---------------------------------------------------------------------------------------------------------------

	//  Modals  ---------------------------------------------------------------------------------------------------------------
	import Modal from '../../components/modals/Modal.svelte';
	import ModalRegistro from '../../components/modals/Modal.Registro.svelte';
	import ModalEmployeeSelection from '../../components/modals/Modal.EmployeeSelection.svelte';
	import ModalDomicilio from '../../components/modals/Modal.Domicilio.svelte';
	//  Modals  ---------------------------------------------------------------------------------------------------------------
	//  Components  ---------------------------------------------------------------------------------------------------------------
	import Factura from './Factura.svelte';
	import { getAuth } from '../../services/auth.service';
	import {
		addDelivery,
		assign_dom,
		getDeliveryById,
		getDeliveryProdsByBillId,
		getInvoiceById,
		payBill,
		payDom
	} from '../../services/billing.service';
	import Ticket from './Ticket.svelte';
	import type Delivery from '../../models/delivery.model';
	import type { Complement, ProductBill } from '../../models/product.model';
	import type Invoice from '../../models/invoice.model';
	//  Components  ---------------------------------------------------------------------------------------------------------------
	$: total = $bill.reduce(
		(acc, curr) =>
			acc +
			(curr.cantidad ?? 1) *
				(curr.valor +
					(curr.complementos?.reduce((ac, cu) => ac + cu.valor, 0) ?? 0) +
					(curr.llevar
						? ['sopa', 'bandeja'].includes(curr.categoria)
							? $products.find((p) => p.nombre === 'Para llevar' || p.abreviatura === '🥡')
									?.valor ?? 800
							: 0
						: 0)),
		0
	);

	let metodosPago = [
		{
			name: 'Daviplata',
			icon: 'daviplata',
			background: 'linear-gradient(225deg, #d55048, #b3443c);'
		},
		{
			name: 'Efectivo',
			icon: 'efectivo',
			background: 'linear-gradient(225deg, #58a838, #4a8d2f);'
		},
		{ name: 'Nequi', icon: 'nequi', background: 'linear-gradient(225deg, #5038a8, #442f8d);' }
	];
	let indice_pago: number = 1;
	let prevTotal: number = 0;

	let billete: number = 0;
	let qty_val: boolean = false;
	let discount: number = 0;

	let notificationMsg: string = '';
	let notificationSeverity: string = 'error';

	let codigo_pago: string = '';

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

	function setKeyListener(e: KeyboardEvent): void {
		if (e.repeat) return; //Avoid key repetition
		if (
			(e.key >= 'a' && e.key <= 'z') ||
			(e.key >= '0' && e.key <= '9') ||
			e.key === '-' ||
			e.key === "'"
		) {
			codigo_pago += e.key; //writing the id for an specific invoice
		} else if (e.isTrusted && !e.repeat && e.key === 'Enter') {
			if (!codigo_pago || codigo_pago.length !== 15) {
				codigo_pago = '';
				return;
			}
			if (codigo_pago[0] === 'd') {
				getDeliveryById(codigo_pago).then((d: Delivery) => {
					$loadedDom = d.id;
					if (!d.domiciliario) showModal('selector-domiciliario'); //Enables delivery man selection
					else $domiciliario = $employees.find((e) => e.id === d.domiciliario) || $domiciliario; //given a delivery man it loades it
					showNotification(`Se cargó: ${d.id}`, 'success', 950);
					getDeliveryProdsByBillId(d.id).then((ps: ProductBill[]) => {
						let btemp: Product[] = [
							{
								id: '1000000072',
								nombre: 'Envío',
								categoria: 'envio',
								valor: d.envio,
								llevar: true,
								cantidad: 1
							}
						];
						loadProds(ps, btemp);
					});
				});
			} else if (codigo_pago[0] === 'c') {
				getInvoiceById(codigo_pago).then((i: Invoice) => {
					$loadedInv = i.id;
					showNotification(`Se cargó: ${i.id}`, 'success', 950);
					// getInvoiceProdsByBillId(i.id);
				});
			} else {
				showNotification(
					'No es necesario cargar productos de una factura, contacte un administrador',
					'alert', 3500
				);
			}
			codigo_pago = '';
		}
	}

	onMount(() => {
		showTime();
		window.addEventListener('keydown', setKeyListener);
		window.onafterprint = (event) => {
			clear();
		};
		if (!$authUser) $authUser = getAuth();
	});

	afterUpdate(() => {
		if ($cashier.nombre === 'Cajero') {
			showModal('selector-cajero');
			// let modal = document.getElementById('selector-cajero');
			// modal!.classList.add('is-visible');
		}
	});

	function handleLlevar() {
		let btemp: Product[] = [...$bill];
		if (btemp.some((p) => !p.llevar)) {
			btemp.forEach((p) => (p.llevar = true));
			$bill = btemp;
			return;
		}
		if (btemp.length && btemp[0].id === '1000000072') {
			btemp[0].valor += 1000;
		} else {
			let p: Product = {
				id: '1000000072',
				nombre: 'Envío',
				categoria: 'envio',
				valor: $domiciliario?.id !== '' || $authUser?.role !== 'kiosk' ? 1000 : 0,
				abreviatura: 'envio',
				llevar: true,
				cantidad: 1
			};
			btemp.unshift(p);
		}
		$bill = btemp;
	}

	const setCashier = (cshr: Employee) => cashier.set(cshr);
	const setDomiciliario = (dom: Employee) => ($domiciliario = dom);

	const showNotification = (noti: string, severity: string, duration?: number): void => {
		notificationMsg = noti;
		notificationSeverity = severity;
		setTimeout(() => {
			notificationMsg = '';
			notificationSeverity = 'error';
		}, duration ?? 950);
	};

	async function handlePagar() {
		if (!$bill.length || ($bill.length === 1 && $bill[0].categoria === 'envio')) {
			showNotification('No hay productos a facturar!', 'alert');
			return;
		}
		if ($loadedDom && !$domiciliario && $bill[0].valor) {
			//un domicilio cargado sin domiciliario y cuyo valor de envío es mayor a cero
			showModal('selector-domiciliario');
			showNotification('No hay domiciliario seleccionado', 'alert');
			return;
		}
		if ($authUser.role === 'admin') {
			//Obliga al uso de cja interna o externa para la facturación
			showNotification('Salga del administrador', 'alert', 3000);
			setTimeout(() => showModal('modal-registro'), 2500);
			return;
		}
		let date: number = Date.now();
		//manejo la caja interna
		if ($authUser.role === 'register') {
			if ($loadedDom) {
				//paydom
                if (!$domiciliario.id){
                    showModal('selector-domiciliario');
                    return
                }
                payDom($loadedDom, $domiciliario.id)
                .then(()=>{
                    showNotification('Domicilio pago con exito', 'success');
                })
			} else if ($loadedInv) {
                showNotification('Funcion en desarrollo', 'alert');
                return
			} else {
				payBill($bill, total, metodosPago[indice_pago].name.toLowerCase(), $cashier, date)
					.then(() => showNotification('Registrado con exito!', 'success'))
					.catch((err) => showNotification(err, 'error'));
			}
			//maneja la caja externa (kiosko)
		} else {
			if ($loadedDom) {
				//check if it is assigned
				if (!$domiciliario.id)
					showNotification('Seleccionar un domiciliario para asignar', 'alert');
				else
					assign_dom($loadedDom, $domiciliario.id).then(() => {
						showNotification('Domicilio asignado!', 'success');
						clear();
					});
				return;
			}
			if ($bill[0].categoria === 'envio') {
				//Is a delivery on external register
				let rd = await addDelivery($bill, total, $domiciliario.id,$cashier, metodosPago[indice_pago].name.toLowerCase(), date)
                JsBarcode('#barcode', rd.id, {
                    format: 'CODE128',
                    lineColor: '#000',
                    width: 3,
                    height: 128,
                    displayValue: true,
                    fontSize: 30,
                    fontOptions: 'bold'
                });
                showNotification('Domicilio registrado!', 'success');
					// .catch((err) => showNotification(err, 'error'));
			} else {
				payBill($bill, total, metodosPago[indice_pago].name.toLowerCase(), $cashier, date)
					.then(() => showNotification('Registrado con exito!', 'success'))
					.catch((err) => showNotification(err, 'error'));
			}
		}
        prevTotal = total;
		if (window.ELECTRON_API) window.ELECTRON_API.printWebContent();
		else {
			window.print();
			clear();
		}
	}

	function clear() {
		billete = 0;
		discount = 0;
		indice_pago = 1;
		$bill = [];
		codigo_pago = '';
		$loadedDom = '';
		$loadedInv = '';
		qty_val = false;
		$domiciliario = {
			id: '',
			activo: true,
			nombre: 'Domiciliario',
			apellido: '',
			cargos: []
		};
	}
</script>

<div id="control">
	<div id="control-header">
		<div id="left-control-header">
			<div id="clock">HH:mm</div>
			<button style="">{discount}%</button>
		</div>
		<div id="display" style="width: 50%;">
			<div style="font-weight:bold; width: 100%; height: 50%; text-align:center;">
				{total > 0 ? formatValue(total) : formatValue(prevTotal)}
			</div>
			<div>{formatValue(billete / 1000)}K</div>
			<div>{formatValue(billete - total)}</div>
		</div>
		<button
			style="with: 25%; background: linear-gradient(225deg, #f57277, #ce6064);
            color: whitesmoke;"
			on:click={() => {
				clear();
				prevTotal = 0;
			}}
		>
			<Icon name="trash" color={'whitesmoke'} width={'30'} />
		</button>
	</div>
	{#if notificationMsg}
		<div id="notificaciones" class={notificationSeverity} transition:slide>
			{notificationMsg}
		</div>
	{/if}
	<Factura />
	<button id="btn-pay" on:click={handlePagar}>
		<div>
			{#if $authUser?.role === 'kiosk' && $loadedDom !== ''}
				ASIGNAR
			{:else}
				PAGAR
			{/if}
		</div>
		{#if codigo_pago}
			<p># {codigo_pago}</p>
		{/if}
	</button>
	<div id="pay-options">
		<div id="payment-method">
			{#each [1, 10, 20, 50] as note}
				<button
					class="note"
					on:click={() => {
						billete += note * 1000;
					}}
				>
					{note}K
					<span>💵</span>
				</button>
			{/each}
		</div>
		<div id="bills">
			<button
				id="swiper"
				on:click={() => {
					indice_pago = (indice_pago + 1) % metodosPago.length;
				}}
				style={`background: ${metodosPago[indice_pago].background}`}
			>
				{#each metodosPago as metodo, i}
					{#if indice_pago === i}
						<div in:lrslide out:rlslide>
							<Icon name={metodo.icon} width="48" />
						</div>
						<span>{metodo.name}</span>
					{/if}
				{/each}
			</button>
		</div>
	</div>
	<div id="delivery-options">
		<Modal id={'modal-opts-domicilio'} title={'Domicilio'} className={'flat opciones-domicilio'}>
			<ModalDomicilio
				modalId={'modal-opts-domicilio'}
				setDom={setDomiciliario}
				callback={handleLlevar}
			/>
		</Modal>
		<button id="btn-llevar" class="flat" on:click={handleLlevar}>Llevar</button>
	</div>
	<div id="factura-cantidad">
		<button
			id="cantidad"
			class="flat"
			on:click={() => {
				qty_val = false;
				$cantidad = 0;
			}}
		>
			{#if !qty_val}
				<span class="multiplier">❌</span>
				{$cantidad}
			{:else}
				<span class="multiplier">💲</span>
				{formatValue($valor / 1000)}
			{/if}
		</button>
		{#if !qty_val}
			{#each [1, 2, 5] as cant}
				<button
					on:click={() => {
						$cantidad += cant;
					}}
					class="cantidad">{cant}</button
				>
			{/each}
		{:else}
			{#each [0.5, 1, 2] as val}
				<button
					on:click={() => {
						$valor += val * 1000;
					}}
					class="valor">{val}</button
				>
			{/each}
		{/if}
		{#if $authUser?.role !== 'kiosk'}
			<button
				on:click={() => { 
					qty_val = !qty_val;
					$cantidad = 0;
					$valor = 0;
				}}
				class="cantidad"
				disabled={$authUser?.role === 'kiosk'}>🔄</button
			>
		{/if}
	</div>
	<div id="bill-options">
		<!-- Selector del cajero -->
		<Modal
			id={'selector-cajero'}
			title={$cashier.nombre}
			icon={'images/cashier.svg'}
			className={'bill-option'}
		>
			<ModalEmployeeSelection
				modalId={'selector-cajero'}
				emps={$employees.filter(
					(e) =>
						e.cargos.includes('cajero') &&
						($authUser?.role === 'kiosk' ? !e.cargos.includes('interno') : true)
				)}
				setter={setCashier}
			/>
		</Modal>
		<!-- Selector del domiciliario -->
		<Modal
			id={'selector-domiciliario'}
			title={$domiciliario.nombre}
			icon={'images/delivery-man.svg'}
			className={'bill-option'}
		>
			<ModalEmployeeSelection
				modalId={'selector-domiciliario'}
				emps={$employees.filter((e) => e.cargos.includes('domiciliario'))}
				setter={setDomiciliario}
			/>
		</Modal>
		<!-- Modal de registro -->
		<Modal
			id={'modal-registro'}
			title={$authUser?.username ?? 'Acceso'}
			icon={'images/user.svg'}
			className={'bill-option'}
		>
			<ModalRegistro />
		</Modal>
	</div>

	<span id="ticket">
		<Ticket {total} metodoPago={metodosPago[indice_pago]} {billete}/>
		{#if $authUser?.role == 'kiosk' && $bill[0]?.categoria === 'envio'}
			<svg id="barcode" />
		{/if}
	</span>
</div>

<style>
	#barcode {
		width: 100%;
		justify-content: center;
	}
	#control {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	#control > div {
		width: 95%;
		margin: 2.5% 1%;
		display: flex;
		border-radius: var(--border-radius);
	}

	#control-header {
		height: 7.5%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		box-shadow: var(--inset-shadow);
		border: var(--border);
		overflow: hidden;
	}

	#control-header > * {
		align-items: center;
		border: 1px solid #ccc5;
	}

	#left-control-header {
		width: 25%;
	}
	#left-control-header > * {
		height: 50%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#display {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-evenly;
	}

	#notificaciones {
		text-align: center;
	}

	#notificaciones.success {
		color: darkgreen;
	}
	#notificaciones.alert {
		color: darkorange;
	}
	#notificaciones.error {
		color: darkred;
	}

	#btn-pay {
		width: 95%;
		background: linear-gradient(225deg, #66aa66, #559955);
		color: white;
		font-weight: bold;
		font-size: 2.75em;
		box-shadow: var(--flat-shadow);
		border-radius: calc(var(--border-radius) * 3);
		height: 10%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}

	#btn-pay > p {
		font-size: 10px;
		width: 75%;
		border-bottom: 1px solid white;
	}

	#btn-pay:active {
		box-shadow: inset -5px 5px 5px #559955, inset 5px 5px 5px #66aa66;
	}

	#pay-options {
		height: 12%;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		overflow: hidden;
	}
	#bills {
		width: 42.5%;
	}
	#payment-method {
		width: 42.5%;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}

	.note {
		border: 1px solid grey;
		border-radius: var(--border-radius);
		color: whitesmoke;
		width: 45%;
		height: 40%;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: space-evenly;
		background: linear-gradient(225deg, #609951, #72b660);
	}

	.note:active {
		box-shadow: inset -4px 4px 5px #5f9750, inset 4px -4px 5px #77bd64;
	}

	#delivery-options {
		flex-grow: 1;
		display: flex;
		justify-content: space-between;
	}

	:global(.opciones-domicilio) {
		width: 47.5%;
	}

	#btn-llevar {
		width: 47.5%;
	}

	#bill-options {
		/* flex-grow: 1; */
		background-color: #ccc5;
		overflow: hidden;
	}

	:global(.bill-option) {
		background-color: transparent;
		max-width: 33%;
	}

	#factura-cantidad {
		flex-grow: 1;
		align-items: center;
		overflow: hidden;
		background-color: #cccc;
	}

	#cantidad {
		width: 17%;
		height: 90%;
		border: 3px solid grey;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.multiplier {
		position: absolute;
		top: 65%;
		left: 0px;
		color: grey;
	}

	.cantidad {
		height: 100%;
		flex-grow: 1;
		background-color: rgba(255, 235, 205, 0.5);
		border-right: 2px solid #ddd;
	}

	.valor {
		height: 100%;
		flex-grow: 1;
		background-color: rgba(165, 225, 165, 0.675);
		border-right: 2px solid #ddd;
	}

	#swiper {
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius);
		color: white;
	}
</style>

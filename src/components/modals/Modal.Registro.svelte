<script lang="ts">
	import { scale } from 'svelte/transition';
	import { credentials, login, logout } from '../../services/auth.service';
	import { authUser, cashier } from '../../services/stores.service';

	// export let action: Function;

	let val = '';

	let users = [
		{ holder: 'Admin', user: 'admin', image: 'images/admin.png' },
		{ holder: 'Registradora', user: 'register', image: 'images/caja-registradora.png' },
		{ holder: 'Quiosco', user: 'kiosk', image: 'images/quiosco.png' }
	];
	let user: string;

	let error: string | null;
</script>

<div class="modal-registro">
	<div class="registro-clases">
		{#each users as u}
			<button
				class="clase-registro flat"
				class:active={user === u.user}
				on:click={() => {
                    user = u.user;
                    val = '';
                }}
			>
				<img src={u.image} width="64px" alt={u.holder} />
				<span> {u.holder} </span>
			</button>
		{/each}
	</div>
	{#if user !== 'kiosk'}
		<input class="input-password" type="password" value={val} transition:scale />
		{#if error}
			<span class="error">
				{error}
			</span>
		{/if}
		<div class="registro-nums" transition:scale>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as num}
				<button
					class="btn-num flat"
					on:click={() => {
						val += num.toString();
					}}>
					{num}
				</button>
			{/each}
			<button class="btn-num flat" on:click={() => (val = '')}> <span> X </span> </button>
		</div>
	{/if}
	<div class="registro-actions">
		<button
			class="loggin-btn flat"
			on:click={() => {
				logout($authUser.role);
				document.getElementById('modal-registro')?.classList.remove('is-visible');
				// document.getElementById("username").textContent = "Not logged";
			}}
		>
			Salida
		</button>
		<button
			class="loggin-btn flat"
			on:click={() => {
				login(user, (val || credentials['kiosk']))
					.then(() => {
						document.getElementById('modal-registro')?.classList.remove('is-visible');
						if ($cashier.nombre === 'Cajero') {
							let modal = document.getElementById('selector-cajero');
							modal?.classList.add('is-visible');
						}
						error = null;
					})
					.catch((err) => (error = err));
			}}
		>
			Ingreso
		</button>
	</div>
</div>

<style>
	.modal-registro {
		width: 62vw;
		height: 75vh;
		background-color: var(--back-color);
		border-radius: var(--border-radius);

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		overflow: hidden;
	}
	.modal-registro > * {
		margin: 1.5%;
	}

	.active {
		border: 2px solid orange;
	}

	.registro-clases {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		width: 100%;
	}

	.clase-registro {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		width: 30%;
		aspect-ratio: 1;
	}

	.input-password {
		width: 50%;
		height: 5vh;
		border: none;
		border-radius: var(--border-radius);
		background-color: #fff8;
		font-size: 2rem;
		box-shadow: var(--inset-shadow);
	}

	.error {
		color: red;
		font-size: 1rem;
		text-align: center;
	}

	.registro-nums {
		height: 30%;
		border-radius: var(--border-radius);
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		width: 200px;
		justify-content: space-around;
		width: 55%;
	}

	.btn-num {
		width: 31%;
		height: 20%;
	}

	.btn-num:has(span) {
		background-color: tomato;
		color: azure;
	}

	.registro-actions {
		height: 10vh;
		width: 80%;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: space-evenly;
	}

	.loggin-btn {
		width: 45%;
	}
</style>

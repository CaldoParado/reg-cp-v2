<script lang="ts">
    import { slide } from "svelte/transition";
    import { elasticInOut } from "svelte/easing";

    import { bill, cantidad, valor } from "../../services/stores.service";
    import type Product from "../../models/product.model";

    // import { getLastBills } from "../services/app-service";
    // import CircularLoader from "../../components/utils/CircularLoader.svelte";

    export let prods: Product[] = [];

    let tab: number = 2;

    function handleProd(prod: Product): void {
        let i = $bill.findIndex(
            (p) => p.id === prod.id && (p.valor === $valor || $valor === 0) && p.complementos === prod.complementos
        );      
        if (i < 0) bill.set([...$bill, { ...prod, cantidad: Math.max($cantidad, 1), valor: $valor>0?$valor:prod.valor }]);
        else  $bill[i] = { ...$bill[i], cantidad: (($bill[i].cantidad??1) + Math.max($cantidad, 1))};
        cantidad.set(0);
        valor.set(0);
    }
</script>

<div id="options">
    <div id="elements">
        {#each prods.filter((p) => p.favorito) as prod (prod.id)}
            <button
                class="flat favorite-card"
                on:click={() => handleProd(prod)}
            >
                {prod.abreviatura
                    ? prod.abreviatura
                    : prod.nombre?.substring(0, 10)}
            </button>
        {/each}
    </div>
    <div id="selector">
        <button class="selector-btn flat" on:click={() => (tab = 0)}> 🧾️ </button>
        <button
            class="selector-btn  flat"
            on:click={() => {
                tab = 1;
            }}
        >
        ⚙️
        </button>
        <button class="selector-btn flat" on:click={() => (tab = 2)}> 🍱 </button>
    </div>
    <div id="opciones" transition:slide>
        {#if tab === 0}
            <div style="border: 1px solid tomato;">
                Working on it
                <!-- {#await getLastBills()}
                    <CircularLoader />
                {:then facs}
                    {#each facs as factura}
                        <div>
                            {factura.id?.substring(10, 14)}... - {factura.valor}
                        </div>
                    {/each}
                {/await} -->
            </div>
        {:else if tab === 1}
            <div style="border: 1px solid tomato;">
                <div>
                    running in {window.ELECTRON_API ? "electron" : "browser"}
                </div>
                <div>
                    status: {window.navigator.onLine
                        ? "Conectado"
                        : "Fuera de línea"}
                </div>
            </div>
        {:else}
            {#each prods.filter((p) => p.complemento) as prod (prod.id)}
                <button
                    class="flat favorite-card complemento"
                    on:click={() => handleProd(prod)}
                    transition:slide={{ easing: elasticInOut, duration: 150 }}
                >
                    {prod.abreviatura
                        ? prod.abreviatura
                        : prod.nombre?.substring(0, 10)}
                </button>
            {/each}
        {/if}
    </div>
</div>

<style>
    #options > div {
        width: 90%;
        margin: 2.5px;
        border-radius: var(--border-radius);
    }

    #elements {
        /* flex-grow: 1; */
        height: 60%;
        display: flex;
        text-overflow: ellipsis;
        justify-content: space-evenly;
        flex-wrap: wrap;
        overflow-y: scroll;
        box-shadow: var(--inset-shadow);
    }

    #selector {
        height: 5%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
    }

    #opciones {
        height: 32%;
        overflow-y: scroll;
    }

    .favorite-card {
        width: 45%;
        aspect-ratio: 1;
        margin: 2.5%;
        text-align: center;
        overflow: hidden;
        flex-direction: row;
    }

    .complemento{
        font-size: 1.5rem;
    }

    .selector-btn {
        height: 100%;
        width: 28%;
        aspect-ratio: 1;
        font-size: 1.2rem;
    }
</style>

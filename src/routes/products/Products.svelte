<script lang="ts">
    import type Product from "../../models/product.model";
    import { stringToColour } from "../../services/utils.service";
    import { bill, cantidad, valor } from "../../services/stores.service";
	// import Icon from "../../components/Icon.svelte";

    export let prods: Product[] = [];


    let category: string = "";

    function addProduct(prod: Product) {
        let i = $bill.findIndex(
            (p) => p.id === prod.id && ($valor>0?$valor:prod.valor) === p.valor
            && p.complementos === prod.complementos
        );
        if (i < 0) bill.set([...$bill, { ...prod, cantidad: Math.max($cantidad, 1), valor: (($valor>0)?$valor:prod.valor) }]);
        else $bill[i] = { ...$bill[i], cantidad: (($bill[i].cantidad??1) + Math.max($cantidad, 1))};
        cantidad.set(0);
        valor.set(0);
    }
</script>

<div id="products">
    <div id="product-list">
        {#each prods.filter( 
            (p) => (((!p.complemento && !p.favorito) || category !== "") && (p.categoria.includes(category) || (category === "")) )
        )
         as prod (prod.id)}
            <button class="flat prod-card" style={`border-bottom: 2px solid ${stringToColour(prod.categoria)};`} on:click={() => addProduct(prod)}>
                {(prod.abreviatura)?prod.abreviatura:(prod.nombre?.substring(0, 10))}
            </button>
        {/each}
    </div>
    <div id="product-tabs">
        {#each [
            {categoria:"", valor: "🍽️"},
            {categoria:"sopa", valor: "🍲"},
            {categoria:"bandeja", valor: "🍱"},
            {categoria:"bebida", valor: "🍹"},
            {categoria:"arepa", valor: '🫓'},
            {categoria:"adicional", valor: "🍟"},
        //  "sopa", "bandeja", "bebida", "arepa", "adicional"
         ]
          as newcat}
            <button
                class:active={category === newcat.categoria}
                class="tab"
                on:click={() => {
                    category = newcat.categoria;
                }}>{newcat.valor} <span>{newcat.categoria}</span></button
            >
        {/each}
    </div>
</div>

<style>
    #product-list {
        display: flex;
        /* flex-direction: row; */
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        overflow-y: scroll;
        height: calc(100% - 75px);
        width: 100%;

        border-radius: var(--border-radius);
        margin-top: 2.5px;
        padding-top: 5px;
        box-shadow: var(--inset-shadow);
    }

    #product-tabs {
        height: 65px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        overflow: hidden;
        align-items: center;
        border-radius: var(--border-radius);
    }

    .tab {
        width: 13%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: none;
        font-size: 2.5rem;
        background-color: #eee7;
        transition: 0.2s ease;
    }
    .tab>span{
        font-size: 1rem;

    }

    .active{
        background-color: rgba(255, 213, 136, 0.516);
        border-right: 1px solid orange;
        width: 20%;

        /* color: var(--primary-text); */
    }

    .prod-card {
        width: clamp(68px, 5.5vw, 86px);
        aspect-ratio: 1;
        overflow: hidden;
        margin: 5px;
    }
</style>

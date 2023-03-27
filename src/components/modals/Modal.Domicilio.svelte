<script lang="ts">
    import { bill, employees } from "../../services/stores.service";

    // import L from "leaflet";
    // import "leaflet/dist/leaflet.css";

    import { onMount } from "svelte";

    export let modalId: string;

    export let setDom: Function;
    // export let setLoc: Function;
    export let callback: Function;
    // export let setNum: Function;
    // export let setDir: Function;

    let barrios = ["barrio", "barrio", "barrio"];
    onMount(() => {
        // let latlng = [4.6736158, -74.097041];
        // let map = L.map("map").setView(latlng, 15);
        // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        //     attribution:
        //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // }).addTo(map);

        // L.marker(latlng)
        //     .addTo(map)
        //     // .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
        //     .openPopup();

        // map.on("click", (e) => {
        //     console.log(e.latlng);
        // });
    });
</script>

<div id="dialog-opciones-domicilio">
    <div id="dialog-opciones-domicilio-top">
        <div id="map" class="flat" />
        <div id="right-options">
            <div class="right-options-top">
                <div class="side-container">
                    {#each barrios as b}
                        <button class="item flat barrio">
                            {b}
                        </button>
                    {/each}
                </div>
                <div class="side-container">
                    {#each $employees.filter( (emp) => emp.cargos?.includes("domiciliario") ) as emp}
                        <button
                            class="item flat domiciliario"
                            on:click={() => {
                                setDom(emp);
                            }}
                        >
                            {emp.nombre}
                        </button>
                    {/each}
                </div>
            </div>
            <div class="right-options-bottom">
                {#each [1000, 2000, 3000, 4000, 5000] as value}
                    <button
                        class="domicilio-valor"
                        on:click={() => {
                            callback();
                            if($bill)
                                $bill[0].valor = value;
                        }}
                    >
                        {value}
                    </button>
                {/each}
            </div>
        </div>
    </div>
    <div id="dialog-opciones-domicilio-bottom">
        <div class="domicilio-direccion">
            <select name="cars" id="cars">
                <option value="AC">Av. Calle</option>
                <option value="AK">Av. Carrera</option>
                <option value="CL">Calle</option>
                <option value="KR">Carrera</option>
                <option value="DG">Diagonal</option>
                <option value="TV">Transv.</option>
            </select>
            <input type="number" name="#" id="" on:click={console.log}>
            <button>A</button>
            <span>#</span>
            <input type="number" name="#" id="">
            <button>A</button>
        </div>
        <div class="domicilio-numero">número</div>

        <button
            class="domicilio-aceptar"
            on:click={() => {
                document.getElementById(modalId)?.classList.remove("is-visible");
            }}
        >
            ACEPTAR
        </button>
    </div>
</div>

<style>
    #dialog-opciones-domicilio {
        width: 65vw;
        max-width: 98%;
        aspect-ratio: 3/2;
        /* background-color: #dddd; */
        padding: 1vmin;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-between;
    }

    #dialog-opciones-domicilio > * {
        border-radius: var(--border-radius);
        margin: 4px;
    }

    #dialog-opciones-domicilio-top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        max-height: 80%;
        flex-grow: 5;
    }

    #map {
        width: 50%;
        /* height: 100%; */
        /* height: 100%; */
        margin: 5px;
        border-radius: calc(2 * var(--border-radius));
    }

    /* #map {
        width: 50%;
        margin: 5px;
        border-radius: calc(2 * var(--border-radius));
        z-index: 999;
    } */
    #dialog-opciones-domicilio-bottom {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
    }

    .domicilio-aceptar {
        width: 20%;
        border-radius: var(--border-radius);
        background: linear-gradient(225deg, #66aa66, #559955);
        color: white;
        font-weight: bold;
    }

    #right-options {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    .right-options-top {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        flex-grow: 1;
        max-height: 80%;
    }

    .right-options-bottom {
        height: 15%;
        display: flex;
        justify-content: space-between;
        overflow: hidden;
        border-radius: calc(2 * var(--border-radius));
    }
    .right-options-bottom > * {
        background: linear-gradient(225deg, #9faa66, #8e9955);
        font-size: 18px;
        color: white;
        flex-grow: 1;
    }

    .side-container {
        width: 48%;
        box-shadow: var(--inset-shadow);
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow-y: scroll;
    }

    .item {
        width: 92.5%;
        min-height: 15%;
        margin: 3.5%;
    }
</style>

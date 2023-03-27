<script lang="ts">
    import type Employee from "../../models/employee.model";
    // import { authUser, loadedDom } from "../../utils/stores";

    export let modalId: string = "";
    export let emps: Array<Employee> = [];

    export let setter: Function = (e: Employee) => {
        console.log("emp", e, " pressed on", modalId);
    };

    function setEmp(emp: Employee) {
        // It sets the employee on the store
        setter(emp);
        // It closes the modal, based on the modalId provided
        let modal = document.getElementById(modalId)
        if (modal)
            modal.classList.remove("is-visible");
    }
</script>

<div class="modal-dialog-selector">
    {#each emps as emp}
        <button class="flat modal-employees-card" on:click={() => setEmp(emp)}>
            {emp.nombre}
        </button>
    {/each}
    <!-- {#if ($authUser?.role && $authUser.role === "kiosk" && $loadedDom !== "")}
        <button
            class="flat close-modal"
            on:click={() => {
                document.getElementById(modalId).classList.remove("is-visible");
            }}
        >
            ❌ cerrar
        </button>
    {/if} -->
</div>

<style>
    .modal-dialog-selector {
        display: flex;
        justify-content: space-evenly;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 1vmin;
        width: 65vw;
        max-width: 98%;
        aspect-ratio: 3/2;
        max-height: 65vmin;
        overflow-y: scroll;
        box-shadow: var(--flat-shadow);
        position: relative;
    }

    /* .close-modal {
        position: absolute;
        bottom: 1px;
        right: 1px;
        padding: 1vmin;
        font-size: 2vmin;
        cursor: pointer;
        background-color: rgb(255, 179, 166);
        color: white;
    } */

    .modal-employees-card {
        background-color: #dddd;
        width: 100px;
        aspect-ratio: 1/1;
        margin: 5px;
        border-radius: var(--border-radius);
    }
</style>

<script lang="ts">
	import Icon from "../../components/Icon.svelte";
    import { authUser } from "../../services/stores.service";
    // import ModalBalance from "./Modals/ModalBalance.svelte";
    import StatefulModal from "../../components/modals/StatefulModal.svelte";
    import ModalDomicilios from "../../components/modals/Modal.Domicilios.svelte";
    import ModalBalance from "../../components/modals/Modal.Balance.svelte";
	import Modal from "../../components/modals/Modal.svelte";

    let modalsState = {
        domicilios: false,
    };
</script>

<div id="side-bar">
    <Icon name="logo" width={"72"} color={"red"} />
     <StatefulModal
        id={"modal-domicilios"}
        title={"Domicilios"}
        className={"side-bar-item"}
        icon={"images/take-away.png"}
        bind:active={modalsState.domicilios}
    >
        <ModalDomicilios bind:active={modalsState.domicilios}/>
        
    </StatefulModal> 
    {#if $authUser?.role === 'admin'}
    <Modal
        id={"modal-balance"}
        title={"Balance"}
        className={"side-bar-item"}
        icon={"images/admin.png"}
    >
        <!-- <h1>Modal balance TODO: SideBar</h1> -->
        <ModalBalance />
</Modal>
    {/if}
    <!-- 

    <Modal
        id={"modal-prestamos"}
        title={"Prestamos"}
        className={"side-bar-item"}
        icon={"images/borrow.png"}
    >
        <ModalVale />
    </Modal> -->
    <button
        on:click={() => {
            if (window.ELECTRON_API) {
                window.ELECTRON_API.printText("Apertura de caja.", {fontSize: "18px", textAlign: "center"});
            } else {
                let mywindow = window.open(
                    "",
                    "PRINT",
                    "width=100, height=100"
                );
                if(mywindow !== null){
                    mywindow.document.write(
                        "<html><head><title>ticket</title><style>@media print{@page {margin: 0 0 0 0; padding: 0px;}}</style></head></html>");
                    mywindow.document.close();
                    mywindow.focus(); // necessary for IE >= 10*/

                    mywindow.print();
                    mywindow.close();
                }
            }
        }}
        class="side-bar-item">
        <img src="images/unlocked.png" width="50%" alt="abrir">
        <span>Abrir caja</span>
    </button>
</div>

<style>
    :global(.side-bar-item) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 90%;
        aspect-ratio: 1;
        margin: 5%;
        margin-top: 25%;
        border: 1px solid grey;
        background-color: transparent;
        flex-wrap: wrap;
        border-radius: var(--border-radius);
    }

    :global(.side-bar-item:hover) {
        background-color: #cccc;
    }
</style>

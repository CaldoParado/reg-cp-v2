<script lang="ts">
    export let id: string;  // id of the modal (must be unique)
    export let title: string;   // title of the modal (displayed on the button)
    export let className: string = "";  // class of the button  (default: empty, other wise a global specification of its class)

    export let icon: string | null = null;  // icon of the button (default: null, other wise an icon name from assets/icons/)
    let modal: HTMLElement | null = null;
</script>

<!-- State less modal, usefull for non active state managements, does not have lifecicle attached to itself so its loaded as page start
the id is the identifier, unique, and is used to manipulate Modal behaviour inside or out-side base on its id -->

<button
    class={className}
    on:click={() => {
        // get the modal by id and add the is-visible class to it, is-visible is used to show the modal 
        modal = document.getElementById(id);
        if(modal !== null)
            modal.classList.add("is-visible");
    }}
>
    {#if icon}
        <img src={icon ?? "/image.png"} alt="icon" style="width: 75%;" />
    {/if}
    <span>
        {title}
    </span>
</button>
<div
    {id}
    class="modal"
    on:click={(e) => {
        if (e.target === modal && modal !== null) {
            modal.classList.remove("is-visible");
        }
    }}
    on:keypress={(e) => {
        if (e.key === "Escape" && modal !== null) {
            modal.classList.remove("is-visible");
        }
    }}
>
    <div class="modal-dialog">
            <slot/>
    </div>
</div>

<style global>
    .modal {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* padding: 1rem; */
        background-color: #5555;
        backdrop-filter: blur(1px);
        cursor: pointer;

        visibility: hidden;
        opacity: 0;
        transition: all 0.15s ease-in;

        z-index: 9;
    }

    .modal.is-visible {
        visibility: visible;
        opacity: 1;
    }

    .modal-dialog {
        max-width: minmax(800px, 100%);
        max-height: 80vh;
        border-radius: var(--border-radius);
        background-color: var(--back-color);
        /* overflow: auto; */
        cursor: default;
        z-index: 9999;
        position: relative;
    }

    /* .modal-dialog > div {
        max-width: 100%;
        max-height: 100%;
    } */
</style>

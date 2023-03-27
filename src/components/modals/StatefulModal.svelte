<script lang="ts">
    export let id: string;
    export let title: string;
    export let className: string = "";

    export let icon: string | null = null;

    export let active: boolean;

</script>

{#if active}
<button
    {id}
    class="modal is-visible"
    on:click={(e) => {
        let modal = document.getElementById(id);
        if (e.target === modal && modal !== null) {
            modal.classList?.remove("is-visible");
            active = false;
        }
    }}
>
    <div class="modal-dialog">
            <slot/>
    </div>
</button>
{/if}
<button
    class={className}
    on:click={() => {
        let modal = document.getElementById(id);
        modal?.classList?.add("is-visible");
        active = true;
    }}
>
    {#if icon}
        <img src={icon ?? "public/image.png"} alt="icon" style="width: 75%;" />
    {/if}
    <span>
        {title}
    </span>
</button>



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
        cursor: default;
        z-index: 9999;
        position: relative;
    }

    .modal-dialog > * {
        max-width: 100%;
        max-height: 100%;
    }
</style>

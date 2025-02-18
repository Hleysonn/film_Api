<script lang="ts">
    export let message; 
    let isVisible = false;

    message = 'Favoris ajouté avec succès';

    function showToast() {
        isVisible = true;
        setTimeout(() => {
            isVisible = false;
        }, 3000);
    }
</script>

<div class="toast">
    {message}
</div>



<style>
    .toast {
        position: fixed;
        bottom: 20px;

        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
    }   
</style>
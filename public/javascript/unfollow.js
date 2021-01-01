document.querySelectorAll(".unf-btn").forEach(btn => {
    btn.onclick = () => {
        fetch(`/api/v1/unfollow/${btn.id.split('_')[1]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                $(`#flwing_${btn.id.split('_')[1]}`).remove()
                $("#followingNum").html(parseInt($("#followingNum").html()) - 1)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
})

document.querySelectorAll(".unf-btn-prof").forEach(btn => {
    btn.onclick = () => {
        fetch(`/api/v1/unfollow/${btn.id.split('_')[1]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                $(`#flwing_${btn.id.split('_')[1]}`).remove()
                window.location.reload()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
})
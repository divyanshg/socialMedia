document.querySelector(".cmt-btn").onclick = () => {
    fetch(`/api/v1/comment/${$("#pid").val()}/${$("#pauth").val()}?txt=${$('textarea#comm').val()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            console.log(response)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    $('#commentModal').hide()
}

function openCommentModal(postId, upp, aname, capt){
    $("#pid").val(postId)
    $("#pauth").val(aname)
    $(".rep-dp").attr("src", upp)
    $(".rep-uname").html(aname).attr("href", `/u/${aname}`)
    $(".rep-capt").html(capt)
    $('#commentModal').show()
}
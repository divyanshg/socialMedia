$(".heart").on('click touchstart', function () {
        if ($(this).data("liked")) {

            $(this).toggleClass('deanimate');
            $(this).css("background-position", "left")
            $(this).data("liked", false)
            removeLike($(this).attr('id').split('_')[1], $(this).attr('id').split('_')[2])
        } else {

            $(this).toggleClass('is_animating');
            $(this).data("liked", true)
            $(this).css("background-position", "right")
            addLike($(this).attr('id').split('_')[1], $(this).attr('id').split('_')[2])
        }
    });

    /*when the animation is over, remove the class*/
    $(".heart").on('animationend', function () {
        if ($(this).data("liked")) {
            $(this).toggleClass('deanimate');
        }else{
            $(this).toggleClass('is_animating');
        }
    });


    function removeLike(postId, uname) {
        fetch(`/api/v1/removelike/${postId}/${uname}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                $(`#${postId}_likesCount`).html(parseInt($(`#${postId}_likesCount`).html()) - 1)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    function addLike(postId, uname) {
        fetch(`/api/v1/like/${postId}/${uname}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                $(`#${postId}_likesCount`).html(parseInt($(`#${postId}_likesCount`).html()) + 1)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
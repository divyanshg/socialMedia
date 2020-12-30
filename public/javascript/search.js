function updateList(query) {
  $.ajax({
        method: 'GET',
        url: '/api/v1/search?q='+query,
    })
    .done(function(data){
        //show_notification('','success');
        console.log(data);
        $(".searchresults").text('');
        for (var i = 0; i < data.length; i++) {
          $(".searchresults").append(`<li class="w-full flex p-2 animate__animated animate__fadeIn animate__faster">
             <img src="${data[i].profile_pic}" class="rounded-full w-10 h-10 mx-2">
             <a href="/u/${data[i].username}" class="w-full -mt-1">
                <span class="font-semibold">${data[i].firstname + " " + data[i].lastname}</span>
                <br>
                <span class="text-sm text-gray-700" id="list-username">${data[i].username}</span>
             </a>
          </li>`)
        }


    })
    .fail(function(data){
      console.log("data")
    });
}

function score(div_id) {

    $('<span class="plus-one"/>', {
        style: 'display:none'
      })
      .html('+1')
      .appendTo($(div_id))
      .fadeIn('1000', function() {
        var el = $(this);
        setTimeout(function() {
          el.remove();
          var n = parseInt($(div_id + 's').text());
          $(div_id + 's').text(n+1);
        }, 2000);
      });
  
  }

function reset(div_id) {

    $('<span class="plus-one"/>', {
      style: 'display:none'
    })
    .html('-')
    .appendTo($(div_id))
    .fadeIn('1000', function() {
      var el = $(this);
      setTimeout(function() {
        el.remove();
        $(div_id + 's').text(0);
      }, 2000);
    });
}
$(document).ready(function() {
  $celebrations = $('.celebration');
  var zindex = 0;

  $celebrations.draggable();

  $celebrations.mousedown(function() {
    zindex = zindex + 10;
    $(this).css('z-index', zindex);
  });

  function showCelebrations() {
    console.log('showCelebrations');
    $celebrations.each(function(index) {
      $(this).delay(300*index).show(0);
    });
  }
  function resetCSS(param, callback) {
    console.log('resetCSS');
    $('.celebration#wedding').css({
      'bottom':'25vh',
      'right':'10vw',
      'left':'auto',
      'top':'auto',
      'z-index':'auto'
    });
    $('.celebration#story').css({
      'bottom':'20vh',
      'right':'25vw',
      'left':'auto',
      'top':'auto',
      'z-index':'auto'
    });
    $('.celebration#orlando').css({
      'bottom':'3vh',
      'left':'2vw',
      'right':'auto',
      'top':'auto',
      'z-index':'auto'
    });
    $('.celebration#york').css({
      'bottom':'5vh',
      'right':'30vw',
      'left':'auto',
      'top':'auto',
      'z-index':'auto'
    });
    $('.celebration#brooklyn').css({
      'bottom':'1vh',
      'right':'2vw',
      'left':'auto',
      'top':'auto',
      'z-index':'auto'
    });
  }
  showCelebrations();
  function reset(param, callback) {
    $celebrations.hide();
    resetCSS();
  }
  $('.reset').click(function() {
    $.when( reset() ).done(function() {
      showCelebrations();
    });
  });

});

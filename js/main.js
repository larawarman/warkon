$(document).ready(function() {
  $celebrations = $('.celebration');
  var zindex = 0

  function showCelebrations() {
    console.log('showCelebrations');
    $celebrations.each(function(index) {
      $(this).delay(300*index).show(0);
    });
  }
  function resetCSS(param, callback) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    $('.celebration#wedding').css({
      'left': (w * 0.5) + 'px',
      'top': (h * 0.05) + 'px',
      'z-index':'auto'
    });
    $('.celebration#story').css({
      'left': (w * 0.02) + 'px',
      'top': (h * 0.5) + 'px',
      'z-index':'auto'
    });
    $('.celebration#orlando').css({
      'left': (w * 0.3) + 'px',
      'top': (h * 0.2) + 'px',
      'z-index':'auto'
    });
    $('.celebration#york').css({
      'left': (w * 0.35) + 'px',
      'top': (h * 0.45) + 'px',
      'z-index':'auto'
    });
    $('.celebration#brooklyn').css({
      'left': (w * 0.7) + 'px',
      'top': (h * 0.53) + 'px',
      'z-index':'auto'
    });
  }

  function reset(param, callback) {
    $celebrations.hide();
    resetCSS();
  }

  showCelebrations();

  $celebrations.draggable();

  $celebrations.mousedown(function() {
    zindex = zindex + 10;
    $(this).css('z-index', zindex);
  });

  $('.reset').click(function() {
    $.when( reset() ).done(function() {
      showCelebrations();
    });
  });

});

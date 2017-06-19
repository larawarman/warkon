$(document).ready(function() {
  $celebrations = $('.celebration');
  var zindex = 0;

  $celebrations.draggable();

  $celebrations.mousedown(function() {
    zindex = zindex + 10;
    $(this).css('z-index', zindex);
  });

  function showCelebrations() {
    $celebrations.each(function(index) {
      $(this).delay(300*index).show(0);
    });
  }
  showCelebrations();
});

$(document).ready(function() {

  function showCelebrations() {
    console.log("hi lara");
    $celebrations = $('.celebration');

    $celebrations.each(function(index) {
      $(this).delay(3000*index).show();
    });
  }
  showCelebrations();

});

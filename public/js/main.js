$.fn.neighbors = function() {
  return this.each(function() {
    alert($(this).attr('id'));
  });
};




$(function() {
  $('#d02-02').css('background-color', '#228');
  $('#d02-02').neighbors();


});

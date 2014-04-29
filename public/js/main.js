// TODO: Determine these dynamically.
var MAX_X = 4;
var MAX_Y = 4;

// Adapted from http://stackoverflow.com/questions/5999209/jquery-how-to-get-the-background-color-code-of-an-element
function rgb_parts(colorval) {
  var match = colorval.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

var MASKS = [1, 2, 4, 8, 16, 32, 64, 128];
function is_bit_on(parts, idx) {
  var mask = MASKS[idx % 8];
  return ((idx < 8 && parts[2] & mask) ||
          (idx < 16 && parts[1] & mask) ||
          (idx < 24 && parts[0] & mask));
}

(function($) {

  $.fn.neighbors = function() {
    var arr = $.makeArray(this);
    return $($.map(arr, function(item, idx) {
      var parts = item.id.split('-');
      var x = Number(parts[0]);
      var y = Number(parts[1]);
      var ids = [];
      for (var i=x-1; i < x+2; i++) {
        if (i < 0 || i > MAX_X ) {
          continue;
        }
        for (var j=y-1; j < y+2; j++) {
          if (y < 0 || y > MAX_Y || ( i == x && j == y)) {
            continue;
          }
          ids.push(i + '-' + j);
        }
      }
      return $.makeArray($('#' + ids.join(',#')));
    }));
  };

  $.fn.numAlive = function(idx) {
    var count = 0;
    this.each(function() {
      var parts = rgb_parts($(this).css('background-color'));
      if (is_bit_on(parts, idx)) {
        count++;
      }
    });
    return count;
  };
})(jQuery);


function iterate() {
  var new_colors = {};
  for (var x=0; x<MAX_X; x++) {
    for (var y=0; y<MAX_Y; y++) {
      var cur_cell = $('#' + x + '-' + y);
      var bits = [];
      for (var i=0; i<24; i++) {
        var cur_alive = is_bit_on(
          rgb_parts(cur_cell.css('background-color')), i);
        var num_alive = cur_cell.neighbors().numAlive(i);
        if (num_alive == 3 || (cur_alive && num_alive == 2)) {
          bits[i] = '1';
        } else {
          bits[i] = '0';
        }
      }
      // TODO turn the bits into colors and store them in new_colors.
    }
  }
}

$(function() {
  $('#2-1').css('background-color', '#00f');
  $('#2-2').css('background-color', '#222');
  $('#2-3').css('background-color', '#0f0');
  $('#3-3').css('background-color', '#f00');
  iterate();
});

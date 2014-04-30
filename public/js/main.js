var COLS = 10;
var ROWS = 10;
var CELLS = new Array(COLS * ROWS);

// Adapted from http://stackoverflow.com/questions/5999209/jquery-how-to-get-the-background-color-code-of-an-element
function rgb_parts(colorval) {
  var match = colorval.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

var MASKS = [1, 2, 4, 8, 16, 32, 64, 128];
function is_bit_on(parts, idx) {
  var mask = MASKS[idx % 8];
  return ((idx < 8 && !(parts[2] & mask)) ||
      (idx < 16 && !(parts[1] & mask)) ||
      (idx < 24 && !(parts[0] & mask)));
}

(function($) {

  $.fn.neighbors = function() {
    var arr = $.makeArray(this);
    return $($.map(arr, function(item, idx) {
      item = $(item);
      var x = Number(item.attr('row'));
      var y = Number(item.attr('col'));
      var cells = [];
      for (var i=x-1; i < x+2; i++) {
        if (i < 0 || i > COLS - 1 ) {
          continue;
        }
        for (var j=y-1; j < y+2; j++) {
          if (j < 0 || j > ROWS - 1 || ( i == x && j == y)) {
            continue;
          }
          cells.push(CELLS[j * COLS + i]);
        }
      }
      return $.makeArray(cells);
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


function generate_board() {
  $('#container').prepend('<table id="board">')
  for (var i=0; i<ROWS; i++) {
    var tr = $('<tr>');
    $('#board').append(tr);
    for (var j=0; j<COLS; j++) {
      var td = $('<td style="background-color: #fff">');
      td.attr('row', i);
      td.attr('col', j);
      tr.append(td);
      CELLS[i * COLS + j] = td;
    }
  }
}

function clear_board() {
  for (var i = 0; i < CELLS.length; i++)
    CELLS[i].css('background-color', '#fff');
}

function randomize_colors() {
  for (var i = 0; i < CELLS.length; i++) {
    r = Math.round(Math.random() * 255);
    g = Math.round(Math.random() * 255);
    b = Math.round(Math.random() * 255);
    CELLS[i].css('background-color',
                 'rgb(' + r + ', ' + g + ', ' + b + ')');
  }
}

// Strangely, we use 0 bits as "alive" and 1 bits as "dead", because we want
// the fully dead state to be #fff, or white.
function iterate() {
  var new_colors = new Array(CELLS.length);
  for (var y=0; y<ROWS; y++) {
    for (var x=0; x<COLS; x++) {
      var cell_id = y * COLS + x;
      var cur_cell = CELLS[cell_id];
      var cur_bg_color = cur_cell.css('background-color')
      var bits = [];
      for (var i=0; i<24; i++) {

        var cur_alive = is_bit_on(rgb_parts(cur_bg_color), i);
        var num_alive = cur_cell.neighbors().numAlive(i);
        if (num_alive == 3 || (cur_alive && num_alive == 2)) {
          bits[i] = '0';
        } else {
          bits[i] = '1';
        }
      }
      r = parseInt(bits.slice(0,8).join(''), 2);
      g = parseInt(bits.slice(8,16).join(''), 2);
      b = parseInt(bits.slice(16,24).join(''), 2);
      new_colors[cell_id] = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }
  for (var i = 0; i < CELLS.length; i++)
    CELLS[i].css('background-color', new_colors[i]);
}

function preset(idx) {
  idx = idx || 0;
  function set_color(color) {
    return function(_, x) { CELLS[x[0] + x[1] * COLS].css('background-color', color) };
  }
  switch(idx) {
    case 2:
      $([[1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3],
        [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]]).map(
          set_color('#3663cc'));
    case 1:
    $([[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2],
      [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]]).map(
        set_color('#28bb82'));

    case 0:
    $([[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1],
      [1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8]]).map(
        set_color('#aa2525'));
  }
}

var interval_id;
var is_playing = false;
function playpause() {
  if (is_playing) {
    clearInterval(interval_id);
    is_playing = false;
    $('#playpause').text('Play');
  } else {
    interval_id = setInterval(iterate, 1000);
    is_playing = true;
    $('#playpause').text('Pause');
  }
}

$(function() {
  generate_board();
});

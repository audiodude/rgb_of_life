var COLS = 100;
var ROWS = 100;
// Add an extra row/column to the edges to simplify logic later.
var CELLS = new Array((COLS + 2) * (ROWS + 2));
var STATE_CUR = new Array(CELLS.length);
var STATE_NEXT = new Array(CELLS.length);
var canvas;

// Adapted from http://stackoverflow.com/questions/5999209/jquery-how-to-get-the-background-color-code-of-an-element
function rgb_parts(colorval) {
  var match = colorval.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function cell_index(col, row) { return row * (COLS + 2) + col + 1; }

var MASKS = [1, 2, 4, 8, 16, 32, 64, 128];
function is_bit_on(parts, idx) {
  var mask = MASKS[idx % 8];
  return ((idx < 8 && !(parts[2] & mask)) ||
      (idx < 16 && !(parts[1] & mask)) ||
      (idx < 24 && !(parts[0] & mask)));
}

function generate_board() {
  canvas = document.getElementById('display');
  clear_board();
}

function clear_board() {
  for (var i = 0; i < CELLS.length; i++) {
    STATE_CUR[i]  = Number(0);
  }
  update_colors();
}

function randomize_colors() {
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      r = Math.round(Math.random() * 255);
      g = Math.round(Math.random() * 255);
      b = Math.round(Math.random() * 255);
      set_cell_color(STATE_CUR, cell_index(col, row), r, g, b);
    }
  }
  update_colors();
}

function set_cell_color(state, cell_id, r, g, b) {
  // White = dead, black = alive, so invert colors.
  state[cell_id] = ~Number((r << 16) + (g << 8) + b) & 0xffffff;
}

function update_colors() {
  var ctx = canvas.getContext('2d');
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var boxsize =
    Math.max(Math.ceil(canvas.width / COLS), Math.ceil(canvas.height/ ROWS));
  var color;
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      color = ~STATE_CUR[cell_index(col, row)] & 0xffffff;
      ctx.fillStyle = '#' + ('000000' + color.toString(16)).substr(-6);
      ctx.fillRect(col * boxsize + .5, row * boxsize + .5, boxsize, boxsize);
    }
  }
}

function iterate() {
  var new_colors = new Array(CELLS.length);
  for (var row=0; row < ROWS; row++) {
    for (var col=0; col < COLS; col++) {
      var cell_id = cell_index(col, row);
      // Implement an adder so we can evaluate all games simultaneously.
      var s0 = 0;
      var s1 = 0;
      var s2 = 0;
      for (var nrow = row - 1; nrow <= row + 1; nrow++) {
        for (var ncol = col - 1; ncol <= col + 1; ncol++) {
          if (nrow == row && ncol == col) continue;
          var n = STATE_CUR[cell_index(ncol, nrow)];
          s2 ^= s1 & s0 & n;
          s1 ^= s0 & n;
          s0 ^= n;
        }
      }
      // Derived from the table (for all other bitstrings, c' = 0).
      // c   s2 s1 s0  c'
      // 0   0  1   1  1
      // 1   0  1   x  1
      STATE_NEXT[cell_id] = ~s2 & s1 & (STATE_CUR[cell_id] | s0) & 0xffffff;
    }
  }
  var t = STATE_CUR;
  STATE_CUR = STATE_NEXT;
  STATE_NEXT = t;
  update_colors();
}

function preset(idx) {
  idx = idx || 0;
  function set_color(r, g, b) {
    return function(_, x) {
      set_cell_color(STATE_CUR, cell_index(x[0], x[1]), r, g, b);
    };
  }
  switch(idx) {
    case 2:
      $([[1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3],
        [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]]).map(
          set_color(54, 99, 204));
    case 1:
    $([[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2],
      [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]]).map(
        set_color(40, 187, 130));

    case 0:
    $([[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1],
      [1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8]]).map(
        set_color(170, 37, 37));
      break;
    case 3:
      $([[0, 1],[1,2],[2,0],[2,1],[2,2]]).map(set_color(0,0,0));
  }
  update_colors();
}

var interval_id;
var is_playing = false;
function playpause() {
  if (is_playing) {
    clearInterval(interval_id);
    is_playing = false;
    $('#playpause').text('Play');
  } else {
    interval_id = setInterval(iterate, 100);
    is_playing = true;
    $('#playpause').text('Pause');
  }
}

$(function() {
  generate_board();
  preset(3);
  playpause();
});

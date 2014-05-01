var COLS = 100;
var ROWS = 100;
// Add an extra row/column to the edges to simplify logic later.
var num_cells = COLS * ROWS;
var STATE_CUR = new Array(num_cells);
var STATE_NEXT = new Array(num_cells);
var canvas;
var ctx;
var img_data;
var interval_id;

function cell_index(col, row) {
  return row * COLS + col;
}

function get_blocksize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  return Math.max(Math.ceil(width / COLS), Math.ceil(height / ROWS));
}

function clear_board() {
  for (var i = 0; i < num_cells; i++) {
    STATE_CUR[i]  = Number(0);
  }
  update_display();
}

function randomize_colors() {
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);
      set_cell_color(STATE_CUR, cell_index(col, row), r, g, b);
    }
  }
  update_display();
}

function set_cell_color(state, cell_id, r, g, b) {
  // White = dead, black = alive, so invert colors.
  state[cell_id] = ~Number((r << 16) + (g << 8) + b) & 0xffffff;
}

function update_display() {
  var color;
  var idx;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var blocksize = get_blocksize();
  if (!img_data || canvas.width != width || canvas.height != height) {
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    img_data = ctx.createImageData(blocksize * COLS, blocksize * ROWS);
  }
  var stride = blocksize * COLS;
  for (var row = 0; row < ROWS; row++) {
    if (row * blocksize > height) break;  // Skip drawing offscreen pixels.
    for (var col = 0; col < COLS; col++) {
      if (col * blocksize > width) break;  // Skip drawing offscreen pixels.
      color = ~STATE_CUR[cell_index(col, row)] & 0xffffff;
      for (var brow = 0; brow < blocksize; brow++) {
        for (var bcol = 0; bcol < blocksize; bcol++) {
          idx =
            ((row * blocksize + brow) * stride + (col * blocksize + bcol)) * 4;
          img_data.data[idx + 0] = (color >> 16) & 0xff;
          img_data.data[idx + 1] = (color >> 8) & 0xff;
          img_data.data[idx + 2] = (color >> 0) & 0xff;
          img_data.data[idx + 3] = 0xff;
        }
      }
    }
  }
  ctx.putImageData(img_data, 0, 0);
}

function iterate() {
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
          var ncolw = (ncol + COLS) % COLS;
          var nroww = (nrow + ROWS) % ROWS;
          var n = STATE_CUR[cell_index(ncolw, nroww)];
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
  update_display();
}

function preset(idx) {
  idx = idx || 0;
  function set_color(r, g, b) {
    return function(_, x) {
      set_cell_color(STATE_CUR, cell_index(x[0], x[1]), r, g, b);
    };
  }
  switch(idx) {
    case 0:
      $([[41,23], [42,23], [43,23], [44,23], [45,23], [46,23], [47,23], [48,23],
        [41,26], [42,26], [43,26], [44,26], [45,26], [46,26], [47,26], [48,26]]
      ).map(set_color(54, 99, 204));
      $([[41,22], [42,22], [43,22], [44,22], [45,22], [46,22], [47,22], [48,22],
        [41,27], [42,27], [43,27], [44,27], [45,27], [46,27], [47,27], [48,27]]
      ).map(set_color(40, 187, 130));
      $([[41,21], [42,21], [43,21], [44,21], [45,21], [46,21], [47,21], [48,21],
        [41,28], [42,28], [43,28], [44,28], [45,28], [46,28], [47,28], [48,28]]
      ).map(set_color(170, 37, 37));
      break;

    case 1:
      $([[25,25], [26,25], [27,25], [28,25], [29,25], [30,25], [31,25], [32,25],
         [34,25], [35,25], [36,25], [37,25], [38,25], [42,25], [43,25], [44,25],
         [51,25], [52,25], [53,25], [54,25], [55,25], [56,25], [57,25], [59,25],
         [60,25], [61,25], [62,25], [63,25]
      ]).map(set_color(25, 57, 150));
      $([[25,26], [26,26], [27,26], [28,26], [29,26], [30,26], [31,26], [32,26],
         [34,26], [35,26], [36,26], [37,26], [38,26], [42,26], [43,26], [44,26],
         [51,26], [52,26], [53,26], [54,26], [55,26], [56,26], [57,26], [59,26],
         [60,26], [61,26], [62,26], [63,26]
      ]).map(set_color(57, 150, 25));
      $([[25,27], [26,27], [27,27], [28,27], [29,27], [30,27], [31,27], [32,27],
         [34,27], [35,27], [36,27], [37,27], [38,27], [42,27], [43,27], [44,27],
         [51,27], [52,27], [53,27], [54,27], [55,27], [56,27], [57,27], [59,27],
         [60,27], [61,27], [62,27], [63,27]
      ]).map(set_color(150, 57, 25));
      break;

    case 3:
      $([[0, 1],[1,2],[2,0],[2,1],[2,2]]).map(set_color(0,0,0));
  }
  update_display();
}

function get_pencil_pos(evt) {
  var offset = $('#display').offset();
  var blocksize = get_blocksize();
  var col = Math.floor((evt.clientX - offset.left) / blocksize);
  var row = Math.floor((evt.clientY - offset.top) / blocksize);
  return {
    row: row,
    col: col
  }
}

var is_pencil_down = false;
function on_pencil_down(evt) {
  is_pencil_down = true;
}

function on_pencil_up(evt) {
  is_pencil_down = false;
}

var cur_pencil_col = null;
var cur_pencil_row = null;
function on_pencil_move(evt) {
  if (is_pencil_down) {
    pos = get_pencil_pos(evt);
    if (pos.row != cur_pencil_row || pos.col != cur_pencil_col) {
      set_cell_color(STATE_CUR, cell_index(pos.col, pos.row), 0, 0, 0);
      update_display();
    }
    cur_pencil_row = pos.row;
    cur_pencil_col = pos.col;
  }
}

var in_pencil = false;
function toggle_pencil() {
  in_pencil = !in_pencil;
  if (in_pencil) {
    pause();
    $('#display').on('mousedown.pencil', on_pencil_down);
    $('#display').on('mousemove.pencil', on_pencil_move);
    $('#display').on('mouseup.pencil', on_pencil_up);
    $('#display').addClass('pencil');
    $('#pencil-btn').addClass('selected');
  } else {
    $('#display').off('mousedown.pencil');
    $('#display').off('mousemove.pencil');
    $('#display').off('mouseup.pencil');
    $('#display').removeClass('pencil');
    $('#pencil-btn').removeClass('selected');
  }
}

function play() {
  interval_id = setInterval(iterate, 100);
  $('#play').hide();
  $('#pause').show();
}

function pause() {
  clearInterval(interval_id);
  $('#play').show();
  $('#pause').hide();
}

$(function() {
  canvas = document.getElementById('display');
  ctx = canvas.getContext('2d')
  
  $('#pencil-btn').click(toggle_pencil);

  clear_board();
  randomize_colors();
  play();
});

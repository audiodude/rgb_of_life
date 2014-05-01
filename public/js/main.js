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

function cell_index(col, row) { return row * COLS + col; }

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
  var blocksize = Math.max(Math.ceil(window.innerWidth / COLS),
                           Math.ceil(window.innerHeight / ROWS));
  if (!img_data || canvas.width != window.innerWidth ||
      canvas.height != window.innerHeight) {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    img_data = ctx.createImageData(blocksize * COLS, blocksize * ROWS);
  }
  var stride = blocksize * COLS;
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
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
  update_display();
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
  clear_board();
  randomize_colors();
  play();
});

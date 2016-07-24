'use strict';

var Connect4 = {};

// namespace Connect4.Board //
Connect4.Board = {};

// Public class Display //
Connect4.Board.Display = function(svg, x, y) {
  var d = Connect4.Board.Display.DEPTH;

  this.x = x;
  this.y = y;
  this.svg = svg;
  this.shapeFond = svg.set();
  this.shapeDevant = svg.set();

  // bottom grid //
  var gridFond = new Connect4.Board.Grid(svg, x + d, y);
  var gW = gridFond.getWidth();
  var gH = gridFond.getHeight();
  var borderFond = svg.rect(x + d, y, gW, gH);
  borderFond.attr({
    'stroke-width': 0
  });

  this.shapeFond.push(gridFond);
  this.shapeFond.push(borderFond);

  // Front grille //
  var borderDevant = svg.rect(x, y + d, gW, gH);
  borderDevant.attr({
    'stroke-width': 0
  });

  this.shapeDevant.push(new Connect4.Board.Grid(svg, x, y + Connect4.Board.Display.DEPTH));
  this.shapeDevant.push(borderDevant);
};

// Constant for the Display class //
Connect4.Board.Display.DEPTH = 0; // Distance between the two plates //

Connect4.Board.Display.prototype = {  
  'addPiece': function(Color) {
    var d = Connect4.Board.Display.DEPTH;
    var s = Connect4.Board.Cell.CELL_SPACING;
    var w = Connect4.Board.Cell.CELL_WIDTH;

    var piece = new Connect4.Board.Piece(this.svg, Color, this.x + (d / 2), this.y + s - w);
    piece.getShape().insertBefore(this.shapeDevant);

    return piece;
  },

  'getPositionX': function(x, y) {
    var d = Connect4.Board.Display.DEPTH;
    var w = Connect4.Board.Cell.CELL_WIDTH;

    return Math.min(Math.max(Math.floor((x - (this.x + (d / 2))) / w), 0), 6);
  }
};

// Public class Grid //
Connect4.Board.Grid = function(svg, x, y) {
  var c = Connect4.Board.Grid.NB_COLS;
  var r = Connect4.Board.Grid.NB_ROWS;

  this.shape = svg.set();

  for (var i = 0; i < c; i++) {
    for (var j = 0; j < r; j++) {
      var cell = new Connect4.Board.Cell(svg, i, j);
      cell.getShape().translate(x, y);
      this.shape.push(cell.getShape());
    }
  }
};

// Constant for the Grid class //
Connect4.Board.Grid.NB_COLS = 7;
Connect4.Board.Grid.NB_ROWS = 6;

Connect4.Board.Grid.prototype = {
  'getShape': function() {
    return this.shape;
  },

  'getWidth': function() {
    return Connect4.Board.Grid.NB_COLS * Connect4.Board.Cell.CELL_WIDTH;
  },

  'getHeight': function() {
    return Connect4.Board.Grid.NB_ROWS * Connect4.Board.Cell.CELL_WIDTH;
  }
};

// public class Cell //
Connect4.Board.Cell = function(svg, x, y) {
  var w = Connect4.Board.Cell.CELL_WIDTH;
  var s = Connect4.Board.Cell.CELL_SPACING;

  var squareHole = svg.path(
    // Circle
    'M ' + s + ' ' + (w / 2) +
    ' A 20 20 000 00 01 ' + (w - s) + ' ' + (w / 2) +
    ' A 20 20 180 00 01 ' + s + ' ' + (w / 2) +
    ' z ' +

    // Square //
    'M 0 0' +
    ' L0 0' +
    ' L0 ' + w +
    ' L' + w + ' ' + w +
    ' L' + w + ' 0' +
    ' z'
  );

  squareHole.translate(x * w, y * w);
  squareHole.attr({
    fill: 'brown',
    'stroke-width': 1,
    'stroke-opacity': 0
  });

  var circleBorder = svg.circle(w / 2, w / 2, (w - (s * 2)) / 2);
  circleBorder.translate(x * w, y * w);
  circleBorder.attr({
    'stroke-width': 0,
  });

  this.shape = svg.set();
  this.shape.push(squareHole, circleBorder);

  this.x = x;
  this.y = y;
};

// Constant for the class Cell //
Connect4.Board.Cell.CELL_SPACING = 5;
Connect4.Board.Cell.CELL_WIDTH = 50;

Connect4.Board.Cell.prototype = {
  'getShape': function() {
    return this.shape;
  }
};

//public class Piece //
Connect4.Board.Piece = function(svg, Color, x, y) {
  var w = Connect4.Board.Piece.WIDTH;
  var d = Connect4.Board.Piece.DEPTH;
  this.shape = svg.set();

  var circleFond = svg.circle();
  circleFond.attr(Color);
  circleFond.attr({
    'stroke-width': 0
  });

  var circleDevant = svg.circle(x + (w / 2), y + (w / 2) + d, w / 2);
  circleDevant.attr(Color);

  this.shape.push(circleFond);
  this.shape.push(circleDevant);

  this.baseX = x;
  this.baseY = y;
  this.x = x;
  this.y = y;
  this.positionX = 0;
  this.Color = Color;
};

Connect4.Board.Piece.DEPTH = Connect4.Board.Display.DEPTH - 0;
Connect4.Board.Piece.WIDTH = 45;

Connect4.Board.Piece.Color = {
  PINK: {
    'fill': 'pink'
  },
  YELLOW: {
    'fill': 'yellow'
  }
};

Connect4.Board.Piece.prototype = {
  'getShape': function() {
    return this.shape;
  },

  'setPosition': function(pos) {
    var d = Connect4.Board.Display.DEPTH;
    var diff = (pos - this.positionX) * Connect4.Board.Cell.CELL_WIDTH;

    this.shape.translate(diff, 0);
    this.positionX = pos;
    this.x += diff;
  },

  'move': function(y) {
    this.shape.translate(0, y);
    this.y += y;
  },

  'getPosition': function(pos) {
    return {
      x: this.x - this.baseX,
      y: this.y - this.baseY
    };
  },

  'getColor': function() {
    return this.Color;
  }
};

// namespace Connect4.Controller //
Connect4.Controller = {};

// public class Game //
Connect4.Controller.Game = function(svg) {
  var c = Connect4.Board.Grid.NB_COLS;
  var r = Connect4.Board.Grid.NB_ROWS;
  var e = Connect4.Controller.Game.EMPTY;

  this.grille = [];

  for (var i = 0; i < c; i++) {
    this.grille[i] = [];
    for (var j = 0; j < r; j++) {
      this.grille[i][j] = e;
    }
  }

  this.board = new Connect4.Board.Display(svg, 50, 50);
  this.pieceCurrent;
  this.timerRefresh;
  this.turn = Connect4.Controller.Game.TOUR_HU;
  this.computer = new Connect4.IA.Computer();
  this.isDropping = false;

  window.onmousemove = (function(t) {
    return function(e) {
      t.refreshMouse(e);
    }
  })(this);

  document.getElementById('gameTable').onclick = (function(t) {
    return function() {
      t.mouseClick();
    }
  })(this);
};

Connect4.Controller.Game.EMPTY = -1;
Connect4.Controller.Game.COLOR_PC = Connect4.Board.Piece.Color.PINK;
Connect4.Controller.Game.COLOR_HU = Connect4.Board.Piece.Color.YELLOW;
Connect4.Controller.Game.TOUR_HU = 1;
Connect4.Controller.Game.TOUR_PC = 2;

Connect4.Controller.Game.prototype = {
  'start': function() {
    this.pieceCurrent = this.board.addPiece(Connect4.Controller.Game.COLOR_HU);
  },

  'drop': function() {
    this.timerRefresh = setInterval((function(t) {
      return function() {
        t.refresh();
      }
    })(this), 5);

    this.isDropping = true;
  },

  'refresh': function() {
    var w = Connect4.Board.Cell.CELL_WIDTH;
    var r = Connect4.Board.Grid.NB_ROWS;
    var empty = Connect4.Controller.Game.EMPTY;
    var end = false;

    //We move the piece down communications //
    this.pieceCurrent.move(1);
    var position = this.pieceCurrent.getPosition();

    var gX = Math.floor(position.x / w);
    var gY = Math.floor(position.y / w) - 1;

    // If the path is blocked//
    if (gY >= 0 && this.grille[gX][gY + 1] !== empty) {
      end = true;
    }

    // If we come to the end //
    if (position.y > r * w) {
      end = true;
    }

    // If the item is placed//
    if (end) {
      // Placement of the piece //
      this.grille[gX][gY] = this.pieceCurrent;

      // Checking endgame //
      var gridScore = new Connect4.IA.Grid();
      gridScore.importGrid(this.grille);
      var score = (new Connect4.IA.Computer()).evalGrille(gridScore);

      var isFull = true;

      for (var i = 0; i < 7; i++) {
        if (this.grille[i][0] === Connect4.Controller.Game.EMPTY) {
          isFull = false;
          break;
        }
      }

      // Game over //
      if (Math.abs(score) === Connect4.IA.Computer.prototype.SCORE_FIN || isFull) {
        // Match nul //
        if (isFull && Math.abs(score) !== Connect4.IA.Computer.prototype.SCORE_FIN) {
          document.getElementById('result').innerHTML = 'made a draw';
          // Victory / Defeat //
        } else {
          document.getElementById('result').innerHTML = (score > 0) ? 'lose' : 'win';
        }

        document.getElementById('theEnd').style.display = 'block';

        // the switch is forced to PC //
        this.turn = Connect4.Controller.Game.TOUR_PC;
        // On continue //
      } else {
        if (this.turn === Connect4.Controller.Game.TOUR_HU) {
          this.doComputerMove();

          // next round //
          this.turn = Connect4.Controller.Game.TOUR_PC;
        } else {
          this.pieceCurrent = this.board.addPiece(Connect4.Controller.Game.COLOR_HU);
          // next round //
          this.turn = Connect4.Controller.Game.TOUR_HU;
        }
      }

      clearInterval(this.timerRefresh);
      this.isDropping = false;
    }
  },

  'refreshMouse': function(e) {
    var pX = 0,
      pY = 0;
    var bounds;

    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
      pX = e.pageX, pY = e.pageY
    }
    if (e.clientX || e.clientY) {
      pX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    if (document.getElementById('gameTable').childNodes[0].offsetLeft) {
      pX -= document.getElementById('gameTable').childNodes[0].offsetLeft;
      pY -= document.getElementById('gameTable').childNodes[0].offsetTop;
    } else if (document.getElementById('gameTable').childNodes[0].getBoundingClientRect) {
      bounds = document.getElementById('gameTable').childNodes[0].getBoundingClientRect();

      pY -= bounds.top;
      pX -= bounds.left;
    }

    if (this.turn === Connect4.Controller.Game.TOUR_HU && !this.isDropping) {
      this.pieceCurrent.setPosition(this.board.getPositionX(pX, pY));
    }
  },

  'mouseClick': function() {
    if (this.turn === Connect4.Controller.Game.TOUR_HU && !this.isDropping) {
      this.drop();
    }
  },

  'doComputerMove': function() {
    // Message loading //
    document.getElementById('loading').style.display = 'block';

    // Coup from the computer //
    var self = this;

    setTimeout(function() {
      var mouvementComp = self.computer.nextMove(self.grille);

      self.pieceCurrent = self.board.addPiece(Connect4.Controller.Game.COLOR_PC);
      self.pieceCurrent.setPosition(mouvementComp);
      self.drop();

      // off loading message //
      document.getElementById('loading').style.display = 'none';
    }, 0);
  }
};

Connect4.IA = {};

Connect4.IA.Strategie = {
  'NORMAL': 1
};

Connect4.IA.Computer = function() {

};

Connect4.IA.Computer.prototype = {
  'SCORE_FIN': 100000,
  'TYPE_STATEGIE': Connect4.IA.Strategie.NORMAL,

  'scoreCurrent': 0, // Value of the gate , for debug //

  'nextMove': function(grid) {
    var gridIA = new Connect4.IA.Grid();
    gridIA.importGrid(grid);

    return this.bestMove(gridIA, 2);
  },

  /**
   * Is the best move to make for the computer
   */
  'bestMove': function(grid, level, levelInit) {
    levelInit = (!levelInit) ? level : levelInit;

    // If this is the computer tower //
    var estPc = (levelInit - level) % 2 === 0;
    var scoreGrid = this.evalGrille(grid);

    // If the grid contains a connect 4 is completed //
    if (scoreGrid === this.SCORE_FIN || scoreGrid === -this.SCORE_FIN) {
      return scoreGrid;
    }

    if (level > 0) {
      var ideal, idealScore = 0;
      var skip = 0;

      for (var i = 0; i < 7; i++) {
        var nGrid = grid.clone();

        // If the column is full, it is not known //
        if (!nGrid.addPiece(i, estPc)) {
          skip++;
          continue;
        }

        var score = this.bestMove(nGrid, level - 1, levelInit);

        if ((i - skip) === 0) {
          idealScore = score;
          ideal = i;
        } else {
          // We keep the best shot for the computer //
          if (estPc && score > idealScore) {
            idealScore = score;
            ideal = i;
          }

          // We keep the best shot to humans //
          if (!estPc && score < idealScore) {
            idealScore = score;
            ideal = i;
          }
        }
      }

      this.scoreCurrent = idealScore;

      // Whether to return a movement //
      if (level === levelInit) {
        var nGrid = grid.clone();
        var nbTest = 0;

        while (!nGrid.addPiece(ideal, estPc)) {
          nGrid = grid.clone();
          ideal = (ideal + 1) % 7;
          nbTest++;

          if (nbTest > 7) {
            return -1;
          }
        }

        return ideal;
      }

      // If it returns a score //
      return idealScore;
    } else {
      return scoreGrid;
    }
  },

  'evalGrille': function(g) {
    // Calculation //
    var grid = g.cells;
    var score = 0;

    // #####   1 : Game over ###### //
    // 100,000 is added to a winner //
    var coulLigne = [0, 0, 0, 0, 0, 0];
    var coulCol = [0, 0, 0, 0, 0, 0, 0];
    var coulDiago = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var coulDiagoB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var lstDiago = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var lstDiagoB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var lstCol = [0, 0, 0, 0, 0, 0, 0];
    var lstLigne = [0, 0, 0, 0, 0, 0];

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[0].length; j++) {
        var diago = (i - j) + 5;
        var diagoB = (i + j);

        if (grid[i][j] === 0) {
          coulLigne[j] = 0;
          lstLigne[j] = 0;
          coulCol[i] = 0;
          lstCol[i] = 0;
          coulDiago[diago] = 0;
          lstDiago[diago] = 0;
          coulDiagoB[diagoB] = 0;
          lstDiagoB[diagoB] = 0;
        } else {
          if (coulLigne[j] === grid[i][j]) {
            lstLigne[j]++;
          } else {
            coulLigne[j] = grid[i][j];
            lstLigne[j] = 1;
          }

          if (coulCol[i] === grid[i][j]) {
            lstCol[i]++;
          } else {
            coulCol[i] = grid[i][j];
            lstCol[i] = 1;
          }

          if (coulDiago[diago] === grid[i][j]) {
            lstDiago[diago]++;
          } else {
            coulDiago[diago] = grid[i][j];
            lstDiago[diago] = 1;
          }

          if (coulDiagoB[diagoB] === grid[i][j]) {
            lstDiagoB[diagoB]++;
          } else {
            coulDiagoB[diagoB] = grid[i][j];
            lstDiagoB[diagoB] = 1;
          }
        }

        // If there is a power 4 the final score is 100000 //
        if (lstLigne[j] === 4) {
          return this.SCORE_FIN * ((coulLigne[j] === 2) ? 1 : -1);
        }

        if (lstCol[i] === 4) {
          return this.SCORE_FIN * ((coulCol[i] === 2) ? 1 : -1);
        }

        if (lstDiago[diago] === 4) {
          return this.SCORE_FIN * ((coulDiago[diago] === 2) ? 1 : -1);
        }

        if (lstDiagoB[diagoB] === 4) {
          return this.SCORE_FIN * ((coulDiagoB[diagoB] === 2) ? 1 : -1);
        }
      }
    }

    // #####  2 : Middle ###### //
    // +3 Score is added to each room located in a suitable area //
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[0].length; j++) {
        if (grid[i][j] !== 0) {
          var estPc = (grid[i][j] === 2);

          if (((i - j) + 5 >= 3 && (i - j) + 5 <= 8) &&
            ((i + j) >= 3 && (i + j) <= 8)) {

            score += 3 * ((estPc) ? this.TYPE_STATEGIE : -1);
          }
        }
      }
    }

    // #####  3 : The lines ###### //
    // On ajoute +25 au score pour chaque 2 pièces qui forme une ligne potentielle //
    var dblCouple = this.findCouple(g, 2);
    for (var i = 0; i < dblCouple.length; i++) {
      score += 25 * ((dblCouple[i] === 2) ? this.TYPE_STATEGIE : -1);
    }

    // 25 is added to the score for each 2 pieces that form a potential line //
    var trpCouple = this.findCouple(g, 3);
    for (var i = 0; i < trpCouple.length; i++) {
      score += 250 * ((trpCouple[i] === 2) ? this.TYPE_STATEGIE : -1);
    }

    return score;
  },

  /**
   * Couples find potential power 4
   */
  'findCouple': function(g, nbPiece) {
    var grid = g.cells;
    var couple = [];

    /*
     * 
Object on which one sends Colors and determines when there is a power potential 4
     */
    var IteratorCouple = (function(couple, nbPiece) {
      var nbSpaceBefore = 0;
      var nbSpaceAfter = 0;
      var cColor = 0;
      var size = 0;

      return {
        'reset': function() {
          nbSpaceBefore = 0;
          nbSpaceAfter = 0;
          cColor = 0;
          size = 0;
        },

        'next': function(color) {
          //If it's a space //
          if (color === 0) {
            if (cColor === 0) {
              nbSpaceBefore++;
            } else {
              // Is removed the groups that do not have the correct size //
              if (size !== nbPiece) {
                size = 0;
                cColor = 0;
                nbSpaceBefore = 1;
              } else {
                nbSpaceAfter++;

                // It is expected that a potential of four boxes //
                if (size + nbSpaceAfter + nbSpaceBefore >= 4) {
                  couple.push(cColor);

                  size = 0;
                  cColor = 0;
                  nbSpaceBefore = nbSpaceAfter;
                  nbSpaceAfter = 0;
                }
              }
            }
            // If you are still on the same Color //
          } else if (color === cColor) {
            size++;
            // on change of Color //
          } else if (color !== cColor) {
            // If we move to a different token Color //
            if (cColor !== 0) {
              nbSpaceBefore = nbSpaceAfter;
              nbSpaceAfter = 0;
            }

            cColor = color;
            size = 1;
          }
        },

        'end': function() {
          if (size === nbPiece && nbSpaceBefore + size >= 4) {
            couple.push(cColor);
          }
        }
      }
    })(couple, nbPiece);

    // ## Checking for rows  ## //

    // For each line //
    for (var j = 0; j < grid[0].length; j++) {
      IteratorCouple.reset();

      // For each column //
      for (var i = 0; i < grid.length; i++) {
        IteratorCouple.next(grid[i][j]);
      }

      IteratorCouple.end();
    }

    // ## Checking for columns  ## //

    // For each column //
    for (var i = 0; i < grid.length; i++) {
      var cColor = 0;
      var size = 0;

      // For each line//
      for (var j = (grid[0].length - 1); j >= 0; j--) {

        // If it's a space //
        if (grid[i][j] === 0) {
          if (size === nbPiece) {
            if (size + j + 1 >= 4) {
              couple.push(cColor);
            }
          }

          break;
          // If you are still on the same Color //
        } else if (grid[i][j] === cColor) {
          size++;
          // on change of colors //
        } else if (grid[i][j] !== cColor) {
          cColor = grid[i][j];
          size = 1;
        }
      }
    }

    // ## Checking the diagonals  ## //
    var startPts = [0, 2, 0, 1, 0, 0, 1, 0, 2, 0, 3, 0];

    for (var a = 0; a < startPts.length; a += 2) {
      IteratorCouple.reset();

      for (i = startPts[a], j = startPts[a + 1]; i < 7 && j < 6; i++, j++) {
        IteratorCouple.next(grid[i][j]);
      }

      IteratorCouple.end();
    }

    // ## Checking for diagonal cons  ## //
    var startPts = [3, 0, 4, 0, 5, 0, 6, 0, 6, 1, 6, 2];
    for (var a = 0; a < startPts.length; a += 2) {
      IteratorCouple.reset();

      for (i = startPts[a], j = startPts[a + 1]; i >= 0 && j < 6; i--, j++) {
        IteratorCouple.next(grid[i][j]);
      }

      IteratorCouple.end();
    }

    return couple;
  },


};

Connect4.IA.Grid = function() {
  this.cells = [];
};

Connect4.IA.Grid.prototype = {
  'importGrid': function(grid) {
    var cellPC = Connect4.Controller.Game.COLOR_PC;
    var cellEmpty = Connect4.Controller.Game.EMPTY;

    for (var x = 0; x < grid.length; x++) {
      this.cells[x] = [];
      for (var y = 0; y < grid[0].length; y++) {
        if (grid[x][y] !== cellEmpty) {
          if (grid[x][y].getColor() === cellPC) {
            this.cells[x][y] = 2;
          } else {
            this.cells[x][y] = 1;
          }
        } else {
          // Empty //
          this.cells[x][y] = 0;
        }
      }
    }
  },

  'clone': function() {
    var grid = new Connect4.IA.Grid();

    for (var x = 0; x < this.cells.length; x++) {
      grid.cells[x] = [];
      for (var y = 0; y < this.cells[0].length; y++) {
        grid.cells[x][y] = this.cells[x][y];
      }
    }

    return grid;
  },

  'addPiece': function(col, estPc) {
    if (this.cells[col][0] !== 0) {
      return false;
    }

    for (var i = 6; i >= 0; i--) {
      if (this.cells[col][i] === 0) {
        this.cells[col][i] = (estPc) ? 2 : 1;
        break;
      }
    }

    return true;
  }
};

window.onload = function() {
  init();
}

function init(e) {
  // Reset //
  document.getElementById('gameTable').innerHTML = '';
  document.getElementById('theEnd').style.display = 'none';

  // Construction //
  var gameTable = new Raphael('gameTable', 450, 375);

  var games = new Connect4.Controller.Game(gameTable);
  games.start();
}
function closeOptions() {
  document.getElementById('theEnd').style.display = 'none';
};


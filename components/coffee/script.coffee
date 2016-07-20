Connect4 = {}
# namespace Connect4.Board //

init = (e) ->
  # Reset //
  document.getElementById('gameTable').innerHTML = ''
  document.getElementById('fin').style.display = 'none'
  # Construction //
  gameTable = new Raphael('gameTable', 450, 375)
  games = new (Connect4.Controller.Game)(gameTable)
  games.start()
  return

closeOptions = ->
  document.getElementById('fin').style.display = 'none'
  return

Connect4.Board = {}
# Public class Display //

Connect4.Board.Display = (svg, x, y) ->
  d = Connect4.Board.Display.DEPTH
  @x = x
  @y = y
  @svg = svg
  @shapeFond = svg.set()
  @shapeDevant = svg.set()
  # bottom grid //
  gridFond = new (Connect4.Board.Grid)(svg, x + d, y)
  gW = gridFond.getWidth()
  gH = gridFond.getHeight()
  borderFond = svg.rect(x + d, y, gW, gH)
  borderFond.attr 'stroke-width': 0
  @shapeFond.push gridFond
  @shapeFond.push borderFond
  # The side pieces (background) //
  morceaux = svg.path()
  @shapeFond.push morceaux
  # Morceaux du côté (devant) //
  morceaux2 = morceaux.clone()
  morceaux2.translate gW, 0
  @shapeDevant.push morceaux2
  # Front grille //
  borderDevant = svg.rect(x, y + d, gW, gH)
  borderDevant.attr 'stroke-width': 0
  @shapeDevant.push new (Connect4.Board.Grid)(svg, x, y + Connect4.Board.Display.DEPTH)
  @shapeDevant.push borderDevant
  return

# Constant for the Display class //
Connect4.Board.Display.DEPTH = 0
# Distance between the two plates //
Connect4.Board.Display.prototype =
  'addPiece': (Color) ->
    d = Connect4.Board.Display.DEPTH
    s = Connect4.Board.Cell.CELL_SPACING
    w = Connect4.Board.Cell.CELL_WIDTH
    piece = new (Connect4.Board.Piece)(@svg, Color, @x + d / 2, @y + s - w)
    piece.getShape().insertBefore @shapeDevant
    piece
  'getPositionX': (x, y) ->
    d = Connect4.Board.Display.DEPTH
    w = Connect4.Board.Cell.CELL_WIDTH
    Math.min Math.max(Math.floor((x - (@x + d / 2)) / w), 0), 6
# Public class Grid //

Connect4.Board.Grid = (svg, x, y) ->
  c = Connect4.Board.Grid.NB_COLS
  r = Connect4.Board.Grid.NB_ROWS
  @shape = svg.set()
  i = 0
  while i < c
    j = 0
    while j < r
      cell = new (Connect4.Board.Cell)(svg, i, j)
      cell.getShape().translate x, y
      @shape.push cell.getShape()
      j++
    i++
  return

# Constant for the Grid class //
Connect4.Board.Grid.NB_COLS = 7
Connect4.Board.Grid.NB_ROWS = 6
Connect4.Board.Grid.prototype =
  'getShape': ->
    @shape
  'getWidth': ->
    Connect4.Board.Grid.NB_COLS * Connect4.Board.Cell.CELL_WIDTH
  'getHeight': ->
    Connect4.Board.Grid.NB_ROWS * Connect4.Board.Cell.CELL_WIDTH
# public class Cell //

Connect4.Board.Cell = (svg, x, y) ->
  w = Connect4.Board.Cell.CELL_WIDTH
  s = Connect4.Board.Cell.CELL_SPACING
  squareHole = svg.path('M ' + s + ' ' + w / 2 + ' A 20 20 000 00 01 ' + w - s + ' ' + w / 2 + ' A 20 20 180 00 01 ' + s + ' ' + w / 2 + ' z ' + 'M 0 0' + ' L0 0' + ' L0 ' + w + ' L' + w + ' ' + w + ' L' + w + ' 0' + ' z')
  squareHole.translate x * w, y * w
  squareHole.attr
    fill: 'gray'
    'stroke-width': 1
    'stroke-opacity': 0
  circleBorder = svg.circle(w / 2, w / 2, (w - (s * 2)) / 2)
  circleBorder.translate x * w, y * w
  circleBorder.attr 'stroke-width': 0
  @shape = svg.set()
  @shape.push squareHole, circleBorder
  @x = x
  @y = y
  return

# Constant for the class Cell //
Connect4.Board.Cell.CELL_SPACING = 5
Connect4.Board.Cell.CELL_WIDTH = 50
Connect4.Board.Cell.prototype = 'getShape': ->
  @shape
#public class Piece //

Connect4.Board.Piece = (svg, Color, x, y) ->
  w = Connect4.Board.Piece.WIDTH
  d = Connect4.Board.Piece.DEPTH
  @shape = svg.set()
  circleFond = svg.circle()
  circleFond.attr Color
  circleFond.attr 'stroke-width': 0
  circleDevant = svg.circle(x + w / 2, y + w / 2 + d, w / 2)
  circleDevant.attr Color
  @shape.push circleFond
  @shape.push circleDevant
  @baseX = x
  @baseY = y
  @x = x
  @y = y
  @positionX = 0
  @Color = Color
  return

Connect4.Board.Piece.DEPTH = Connect4.Board.Display.DEPTH - 0
Connect4.Board.Piece.WIDTH = 40
Connect4.Board.Piece.Color =
  PINK: 'fill': 'pink'
  YELLOW: 'fill': 'yellow'
Connect4.Board.Piece.prototype =
  'getShape': ->
    @shape
  'setPosition': (pos) ->
    d = Connect4.Board.Display.DEPTH
    diff = (pos - (@positionX)) * Connect4.Board.Cell.CELL_WIDTH
    @shape.translate diff, 0
    @positionX = pos
    @x += diff
    return
  'move': (y) ->
    @shape.translate 0, y
    @y += y
    return
  'getPosition': (pos) ->
    {
      x: @x - (@baseX)
      y: @y - (@baseY)
    }
  'getColor': ->
    @Color
# namespace Connect4.Controller //
Connect4.Controller = {}
# public class Game //

Connect4.Controller.Game = (svg) ->
  c = Connect4.Board.Grid.NB_COLS
  r = Connect4.Board.Grid.NB_ROWS
  e = Connect4.Controller.Game.EMPTY
  @grille = []
  i = 0
  while i < c
    @grille[i] = []
    j = 0
    while j < r
      @grille[i][j] = e
      j++
    i++
  @board = new (Connect4.Board.Display)(svg, 50, 50)
  @pieceCurrent
  @timerRefresh
  @turn = Connect4.Controller.Game.TOUR_HU
  @computer = new (Connect4.IA.Computer)
  @isDropping = false
  window.onmousemove = ((t) ->
    (e) ->
      t.refreshMouse e
      return
  )(this)
  document.getElementById('gameTable').onclick = ((t) ->
    ->
      t.mouseClick()
      return
  )(this)
  return

Connect4.Controller.Game.EMPTY = -1
Connect4.Controller.Game.COULEUR_PC = Connect4.Board.Piece.Color.PINK
Connect4.Controller.Game.COULEUR_HU = Connect4.Board.Piece.Color.YELLOW
Connect4.Controller.Game.TOUR_HU = 1
Connect4.Controller.Game.TOUR_PC = 2
Connect4.Controller.Game.prototype =
  'start': ->
    @pieceCurrent = @board.addPiece(Connect4.Controller.Game.COULEUR_HU)
    return
  'drop': ->
    @timerRefresh = setInterval(((t) ->
      ->
        t.refresh()
        return
    )(this), 5)
    @isDropping = true
    return
  'refresh': ->
    w = Connect4.Board.Cell.CELL_WIDTH
    r = Connect4.Board.Grid.NB_ROWS
    empty = Connect4.Controller.Game.EMPTY
    end = false
    #We move the piece down communications //
    @pieceCurrent.move 1
    position = @pieceCurrent.getPosition()
    gX = Math.floor(position.x / w)
    gY = Math.floor(position.y / w) - 1
    # If the path is blocked//
    if gY >= 0 and @grille[gX][gY + 1] != empty
      end = true
    # If we come to the end //
    if position.y > r * w
      end = true
    # If the item is placed//
    if end
      # Placement of the piece //
      @grille[gX][gY] = @pieceCurrent
      # Checking endgame //
      gridScore = new (Connect4.IA.Grid)
      gridScore.importGrid @grille
      score = (new (Connect4.IA.Computer)).evalGrille(gridScore)
      estPlein = true
      i = 0
      while i < 7
        if @grille[i][0] == Connect4.Controller.Game.EMPTY
          estPlein = false
          break
        i++
      # Game over //
      if Math.abs(score) == Connect4.IA.Computer::SCORE_FIN or estPlein
        # Match nul //
        if estPlein and Math.abs(score) != Connect4.IA.Computer::SCORE_FIN
          document.getElementById('result').innerHTML = 'made a draw'
          # Victory / Defeat //
        else
          document.getElementById('result').innerHTML = if score > 0 then 'lose' else 'win'
        document.getElementById('fin').style.display = 'block'
        # the switch is forced to PC //
        @turn = Connect4.Controller.Game.TOUR_PC
        # On continue //
      else
        if @turn == Connect4.Controller.Game.TOUR_HU
          @doComputerMove()
          # next round //
          @turn = Connect4.Controller.Game.TOUR_PC
        else
          @pieceCurrent = @board.addPiece(Connect4.Controller.Game.COULEUR_HU)
          # next round //
          @turn = Connect4.Controller.Game.TOUR_HU
      clearInterval @timerRefresh
      @isDropping = false
    return
  'refreshMouse': (e) ->
    pX = 0
    pY = 0
    bounds = undefined
    if !e
      e = window.event
    if e.pageX or e.pageY
      pX = e.pageX
      pY = e.pageY
    if e.clientX or e.clientY
      pX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
      pY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    if document.getElementById('gameTable').childNodes[0].offsetLeft
      pX -= document.getElementById('gameTable').childNodes[0].offsetLeft
      pY -= document.getElementById('gameTable').childNodes[0].offsetTop
    else if document.getElementById('gameTable').childNodes[0].getBoundingClientRect
      bounds = document.getElementById('gameTable').childNodes[0].getBoundingClientRect()
      pY -= bounds.top
      pX -= bounds.left
    if @turn == Connect4.Controller.Game.TOUR_HU and !@isDropping
      @pieceCurrent.setPosition @board.getPositionX(pX, pY)
    return
  'mouseClick': ->
    if @turn == Connect4.Controller.Game.TOUR_HU and !@isDropping
      @drop()
    return
  'doComputerMove': ->
    # Message loading //
    document.getElementById('loading').style.display = 'block'
    # Coup from the computer //
    self = this
    setTimeout (->
      mouvementComp = self.computer.nextMove(self.grille)
      self.pieceCurrent = self.board.addPiece(Connect4.Controller.Game.COULEUR_PC)
      self.pieceCurrent.setPosition mouvementComp
      self.drop()
      # off loading message //
      document.getElementById('loading').style.display = 'none'
      return
    ), 0
    return
Connect4.IA = {}
Connect4.IA.Strategie = 'NORMAL': 1

Connect4.IA.Computer = ->

Connect4.IA.Computer.prototype =
  'SCORE_FIN': 100000
  'TYPE_STATEGIE': Connect4.IA.Strategie.NORMAL
  'scoreCurrent': 0
  'nextMove': (grid) ->
    gridIA = new (Connect4.IA.Grid)
    gridIA.importGrid grid
    @bestMove gridIA, 2
  'bestMove': (grid, level, levelInit) ->
    `var nGrid`
    levelInit = if !levelInit then level else levelInit
    # If this is the computer tower //
    estPc = (levelInit - level) % 2 == 0
    scoreGrid = @evalGrille(grid)
    # If the grid contains a connect 4 is completed //
    if scoreGrid == @SCORE_FIN or scoreGrid == -@SCORE_FIN
      return scoreGrid
    if level > 0
      ideal = undefined
      idealScore = 0
      skip = 0
      i = 0
      while i < 7
        nGrid = grid.clone()
        # If the column is full, it is not known //
        if !nGrid.addPiece(i, estPc)
          skip++
          i++
          continue
        score = @bestMove(nGrid, level - 1, levelInit)
        if i - skip == 0
          idealScore = score
          ideal = i
        else
          # We keep the best shot for the computer //
          if estPc and score > idealScore
            idealScore = score
            ideal = i
          # We keep the best shot to humans //
          if !estPc and score < idealScore
            idealScore = score
            ideal = i
        i++
      @scoreCurrent = idealScore
      # Whether to return a movement //
      if level == levelInit
        nGrid = grid.clone()
        nbTest = 0
        while !nGrid.addPiece(ideal, estPc)
          nGrid = grid.clone()
          ideal = (ideal + 1) % 7
          nbTest++
          if nbTest > 7
            return -1
        return ideal
      # If it returns a score //
      idealScore
    else
      scoreGrid
  'evalGrille': (g) ->
    `var i`
    `var j`
    `var i`
    `var i`
    # Calculation //
    grid = g.cells
    score = 0
    # #####   1 : Game over ###### //
    # 100,000 is added to a winner //
    coulLigne = [
      0
      0
      0
      0
      0
      0
    ]
    coulCol = [
      0
      0
      0
      0
      0
      0
      0
    ]
    coulDiago = [
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
    ]
    coulDiagoB = [
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
    ]
    lstDiago = [
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
    ]
    lstDiagoB = [
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
      0
    ]
    lstCol = [
      0
      0
      0
      0
      0
      0
      0
    ]
    lstLigne = [
      0
      0
      0
      0
      0
      0
    ]
    i = 0
    while i < grid.length
      j = 0
      while j < grid[0].length
        diago = i - j + 5
        diagoB = i + j
        if grid[i][j] == 0
          coulLigne[j] = 0
          lstLigne[j] = 0
          coulCol[i] = 0
          lstCol[i] = 0
          coulDiago[diago] = 0
          lstDiago[diago] = 0
          coulDiagoB[diagoB] = 0
          lstDiagoB[diagoB] = 0
        else
          if coulLigne[j] == grid[i][j]
            lstLigne[j]++
          else
            coulLigne[j] = grid[i][j]
            lstLigne[j] = 1
          if coulCol[i] == grid[i][j]
            lstCol[i]++
          else
            coulCol[i] = grid[i][j]
            lstCol[i] = 1
          if coulDiago[diago] == grid[i][j]
            lstDiago[diago]++
          else
            coulDiago[diago] = grid[i][j]
            lstDiago[diago] = 1
          if coulDiagoB[diagoB] == grid[i][j]
            lstDiagoB[diagoB]++
          else
            coulDiagoB[diagoB] = grid[i][j]
            lstDiagoB[diagoB] = 1
        # If there is a power 4 the final score is 100000 //
        if lstLigne[j] == 4
          return @SCORE_FIN * (if coulLigne[j] == 2 then 1 else -1)
        if lstCol[i] == 4
          return @SCORE_FIN * (if coulCol[i] == 2 then 1 else -1)
        if lstDiago[diago] == 4
          return @SCORE_FIN * (if coulDiago[diago] == 2 then 1 else -1)
        if lstDiagoB[diagoB] == 4
          return @SCORE_FIN * (if coulDiagoB[diagoB] == 2 then 1 else -1)
        j++
      i++
    # #####  2 : Middle ###### //
    # +3 Score is added to each room located in a suitable area //
    i = 0
    while i < grid.length
      j = 0
      while j < grid[0].length
        if grid[i][j] != 0
          estPc = grid[i][j] == 2
          if i - j + 5 >= 3 and i - j + 5 <= 8 and i + j >= 3 and i + j <= 8
            score += 3 * (if estPc then @TYPE_STATEGIE else -1)
        j++
      i++
    # #####  3 : The lines ###### //
    # On ajoute +25 au score pour chaque 2 pièces qui forme une ligne potentielle //
    dblCouple = @findCouple(g, 2)
    i = 0
    while i < dblCouple.length
      score += 25 * (if dblCouple[i] == 2 then @TYPE_STATEGIE else -1)
      i++
    # 25 is added to the score for each 2 pieces that form a potential line //
    trpCouple = @findCouple(g, 3)
    i = 0
    while i < trpCouple.length
      score += 250 * (if trpCouple[i] == 2 then @TYPE_STATEGIE else -1)
      i++
    score
  'findCouple': (g, nbPiece) ->
    `var i`
    `var j`
    `var startPts`
    `var a`
    grid = g.cells
    couple = []

    ###
    # 
    Object on which one sends Colors and determines when there is a power potential 4
    ###

    IteratorCouple = do (couple, nbPiece) ->
      nbSpaceBefore = 0
      nbSpaceAfter = 0
      cColor = 0
      size = 0
      {
        'reset': ->
          nbSpaceBefore = 0
          nbSpaceAfter = 0
          cColor = 0
          size = 0
          return
        'next': (color) ->
          #If it's a space //
          if color == 0
            if cColor == 0
              nbSpaceBefore++
            else
              # Is removed the groups that do not have the correct size //
              if size != nbPiece
                size = 0
                cColor = 0
                nbSpaceBefore = 1
              else
                nbSpaceAfter++
                # It is expected that a potential of four boxes //
                if size + nbSpaceAfter + nbSpaceBefore >= 4
                  couple.push cColor
                  size = 0
                  cColor = 0
                  nbSpaceBefore = nbSpaceAfter
                  nbSpaceAfter = 0
            # If you are still on the same Color //
          else if color == cColor
            size++
            # Si on change de Color //
          else if color != cColor
            # If we move to a different token Color //
            if cColor != 0
              nbSpaceBefore = nbSpaceAfter
              nbSpaceAfter = 0
            cColor = color
            size = 1
          return
        'end': ->
          if size == nbPiece and nbSpaceBefore + size >= 4
            couple.push cColor
          return

      }
    # ## Checking for rows  ## //
    # For each line //
    j = 0
    while j < grid[0].length
      IteratorCouple.reset()
      # For each column //
      i = 0
      while i < grid.length
        IteratorCouple.next grid[i][j]
        i++
      IteratorCouple.end()
      j++
    # ## Checking for columns  ## //
    # For each column //
    i = 0
    while i < grid.length
      cColor = 0
      size = 0
      # For each line//
      j = grid[0].length - 1
      while j >= 0
        # If it's a space //
        if grid[i][j] == 0
          if size == nbPiece
            if size + j + 1 >= 4
              couple.push cColor
          break
          # If you are still on the same Color //
        else if grid[i][j] == cColor
          size++
          # on change of colors //
        else if grid[i][j] != cColor
          cColor = grid[i][j]
          size = 1
        j--
      i++
    # ## Checking the diagonals  ## //
    startPts = [
      0
      2
      0
      1
      0
      0
      1
      0
      2
      0
      3
      0
    ]
    a = 0
    while a < startPts.length
      IteratorCouple.reset()
      i = startPts[a]
      j = startPts[a + 1]
      while i < 7 and j < 6
        IteratorCouple.next grid[i][j]
        i++
        j++
      IteratorCouple.end()
      a += 2
    # ## Checking for diagonal cons  ## //
    startPts = [
      3
      0
      4
      0
      5
      0
      6
      0
      6
      1
      6
      2
    ]
    a = 0
    while a < startPts.length
      IteratorCouple.reset()
      i = startPts[a]
      j = startPts[a + 1]
      while i >= 0 and j < 6
        IteratorCouple.next grid[i][j]
        i--
        j++
      IteratorCouple.end()
      a += 2
    couple

Connect4.IA.Grid = ->
  @cells = []
  return

Connect4.IA.Grid.prototype =
  'importGrid': (grid) ->
    cellPC = Connect4.Controller.Game.COULEUR_PC
    cellEmpty = Connect4.Controller.Game.EMPTY
    x = 0
    while x < grid.length
      @cells[x] = []
      y = 0
      while y < grid[0].length
        if grid[x][y] != cellEmpty
          if grid[x][y].getColor() == cellPC
            @cells[x][y] = 2
          else
            @cells[x][y] = 1
        else
          # Empty //
          @cells[x][y] = 0
        y++
      x++
    return
  'clone': ->
    grid = new (Connect4.IA.Grid)
    x = 0
    while x < @cells.length
      grid.cells[x] = []
      y = 0
      while y < @cells[0].length
        grid.cells[x][y] = @cells[x][y]
        y++
      x++
    grid
  'addPiece': (col, estPc) ->
    if @cells[col][0] != 0
      return false
    i = 6
    while i >= 0
      if @cells[col][i] == 0
        @cells[col][i] = if estPc then 2 else 1
        break
      i--
    true

window.onload = ->
  init()
  return

# ---
# generated by js2coffee 2.2.0
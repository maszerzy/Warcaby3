
const board = document.getElementById("board");
const info = document.getElementById("info");

let currentPlayer = "red";
let selected = null;
let mustContinue = false;

const SIZE = 8;
let squares = [];
let pieces = [];

function createBoard() {
  board.innerHTML = "";
  squares = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const sq = document.createElement("div");
      sq.className = "square " + ((x + y) % 2 === 0 ? "light" : "dark");
      sq.dataset.x = x;
      sq.dataset.y = y;
      board.appendChild(sq);
      squares.push(sq);
    }
  }
}

function setupPieces() {
  pieces = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if ((x + y) % 2 === 1) {
        if (y < 3) addPiece(x, y, "black");
        else if (y > 4) addPiece(x, y, "red");
      }
    }
  }
}

function addPiece(x, y, color) {
  const piece = document.createElement("div");
  piece.className = "piece " + color;
  piece.dataset.x = x;
  piece.dataset.y = y;
  piece.dataset.color = color;
  piece.dataset.king = "false";
  piece.addEventListener("click", () => onPieceClick(piece));
  getSquare(x, y).appendChild(piece);
  pieces.push(piece);
}

function getSquare(x, y) {
  return squares[y * SIZE + x];
}

function onPieceClick(piece) {
  if (mustContinue && piece !== selected) return;
  if (piece.dataset.color !== currentPlayer) return;
  if (selected) selected.classList.remove("selected");
  selected = piece;
  selected.classList.add("selected");
}

function onSquareClick(e) {
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  if (selected && isValidMove(selected, x, y)) {
    movePiece(selected, x, y);
  }
}

function isValidMove(piece, x2, y2) {
  const x1 = parseInt(piece.dataset.x);
  const y1 = parseInt(piece.dataset.y);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (getPiece(x2, y2)) return false;

  const dir = piece.dataset.color === "red" ? -1 : 1;
  const isKing = piece.dataset.king === "true";

  if (absDx === 1 && absDy === 1 && !mustContinue) {
    if (isKing || dy === dir) return true;
  }

  if (absDx === 2 && absDy === 2) {
    const mx = x1 + dx / 2;
    const my = y1 + dy / 2;
    const midPiece = getPiece(mx, my);
    if (midPiece && midPiece.dataset.color !== piece.dataset.color) {
      return true;
    }
  }

  return false;
}

function movePiece(piece, x2, y2) {
  const x1 = parseInt(piece.dataset.x);
  const y1 = parseInt(piece.dataset.y);
  const dx = x2 - x1;
  const dy = y2 - y1;

  const captured = Math.abs(dx) === 2;
  if (captured) {
    const mx = x1 + dx / 2;
    const my = y1 + dy / 2;
    const midPiece = getPiece(mx, my);
    if (midPiece) {
      getSquare(mx, my).removeChild(midPiece);
    }
  }

  piece.dataset.x = x2;
  piece.dataset.y = y2;
  getSquare(x2, y2).appendChild(piece);

  if ((piece.dataset.color === "red" && y2 === 0) ||
      (piece.dataset.color === "black" && y2 === SIZE - 1)) {
    piece.dataset.king = "true";
    piece.classList.add("king");
  }

  if (captured && canCapture(piece)) {
    mustContinue = true;
    selected = piece;
    updateInfo();
    return;
  }

  selected.classList.remove("selected");
  selected = null;
  mustContinue = false;
  currentPlayer = currentPlayer === "red" ? "black" : "red";
  updateInfo();
}

function getPiece(x, y) {
  for (const p of pieces) {
    if (parseInt(p.dataset.x) === x && parseInt(p.dataset.y) === y) {
      if (p.parentElement) return p;
    }
  }
  return null;
}

function canCapture(piece) {
  const x = parseInt(piece.dataset.x);
  const y = parseInt(piece.dataset.y);
  const dirs = [[1,1],[-1,1],[1,-1],[-1,-1]];
  for (const [dx, dy] of dirs) {
    const mx = x + dx;
    const my = y + dy;
    const tx = x + 2*dx;
    const ty = y + 2*dy;
    if (tx >= 0 && tx < SIZE && ty >= 0 && ty < SIZE) {
      const mid = getPiece(mx, my);
      const dest = getPiece(tx, ty);
      if (mid && mid.dataset.color !== piece.dataset.color && !dest) {
        if (piece.dataset.king === "true" ||
            (piece.dataset.color === "red" && dy === -1) ||
            (piece.dataset.color === "black" && dy === 1)) {
          return true;
        }
      }
    }
  }
  return false;
}

function updateInfo() {
  info.textContent = "Tura gracza: " + (currentPlayer === "red" ? "Czerwony" : "Czarny");
}

function startGame() {
  createBoard();
  setupPieces();
  updateInfo();
  for (const sq of squares) {
    sq.addEventListener("click", onSquareClick);
  }
}

startGame();

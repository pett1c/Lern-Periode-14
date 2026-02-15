/**
 * app.js - Komplette Schach-Spiellogik
 *
 * Enthaelt: Zugvalidierung, Schach/Schachmatt/Patt/Remis, Rochade, En Passant,
 * Bauernumwandlung, Zughistorie, Undo, Timer, Drag-and-Drop, Sound, Brett-Flip.
 */

class SoundManager {
  constructor() {
    this.muted = false;
    this.ctx = null;
  }
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  play(freq, dur, type) {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = freq;
    osc.type = type || "sine";
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + dur);
  }
  playMove() {
    this.play(400, 0.05);
  }
  playCapture() {
    this.play(600, 0.1, "square");
  }
  playCheck() {
    this.play(800, 0.15, "square");
  }
  playGameEnd() {
    this.play(523, 0.2);
    this.play(659, 0.2);
    this.play(784, 0.3);
  }
  toggle() {
    this.muted = !this.muted;
    return this.muted;
  }
}

class ChessGame {
  constructor() {
    this.gameboard = document.querySelector("#gameboard");
    this.playerDisplay = document.querySelector("#player");
    this.infoDisplay = document.querySelector("#info-display");
    this.whiteClockDisplay = document.querySelector(".white-clock");
    this.blackClockDisplay = document.querySelector(".black-clock");
    this.moveListDisplay = document.querySelector("#move-list");
    this.whiteCapturedDisplay = document.querySelector("#white-captured");
    this.blackCapturedDisplay = document.querySelector("#black-captured");

    // Pruefen ob alle kritischen DOM-Elemente vorhanden sind
    const required = { gameboard: this.gameboard, player: this.playerDisplay, infoDisplay: this.infoDisplay };
    for (const [name, el] of Object.entries(required)) {
      if (!el) {
        console.error(`Schachspiel: Erforderliches DOM-Element "#${name}" nicht gefunden.`);
      }
    }

    this.sound = new SoundManager();
    this.dragFrom = null;

    this.initGame();
  }

  /** Setzt alle Spielzustaende auf Anfang und startet das Spiel. */
  initGame() {
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.whiteTime = 600;
    this.blackTime = 600;
    this.gameOver = false;

    this.board = [...START_POSITION];

    this.enPassantTarget = null;

    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    };

    this.moveHistory = [];
    this.boardHistory = [];
    this.stateHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.lastMove = null;
    this.pendingPromotion = null;
    this.positionHistory = [];
    this.halfMoveClock = 0;
    this.flipped = false;
    this.gameResult = "*";

    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = null;

    this.createBoard();
    this.updateLabels();
    this.updateDisplay();
    this.updateCapturedDisplay();
    this.updateMoveList();
    this.startTimer();
    this.positionHistory = [this.getBoardHash()];
  }

  // =========================================================================
  //  RENDERING
  // =========================================================================

  /** Visual-Index zu Board-Index (bei Flip umgekehrt). */
  visToBoard(vis) {
    return this.flipped ? LAST_INDEX - vis : vis;
  }

  /** Gibt die deutsche Figurenbezeichnung fuer ein Feld zurueck. */
  getPieceName(piece) {
    if (!piece) return "leer";
    const type = getPieceType(piece);
    const color = getPieceColor(piece);
    const colorName = color === "white" ? "weisser" : "schwarzer";
    const typeNames = {
      pawn: "Bauer", rook: "Turm", knight: "Springer",
      bishop: "Laeufer", queen: "Dame", king: "Koenig",
    };
    return colorName + " " + (typeNames[type] || "");
  }

  /** Erzeugt ein aria-label fuer ein Feld, z.B. "e4, weisser Bauer". */
  getSquareAriaLabel(index) {
    const name = indexToAlgebraic(index);
    const piece = this.board[index];
    return piece ? name + ", " + this.getPieceName(piece) : name + ", leer";
  }

  /** Erstellt das gesamte 8x8 Spielfeld im DOM. */
  createBoard() {
    this.gameboard.innerHTML = "";
    const order = this.flipped
      ? [...Array(SQUARE_COUNT)].map((_, i) => LAST_INDEX - i)
      : [...Array(SQUARE_COUNT)].map((_, i) => i);
    for (let vis = 0; vis < SQUARE_COUNT; vis++) {
      const i = order[vis];
      const square = document.createElement("div");
      square.classList.add("square");
      square.setAttribute("data-index", i);
      square.textContent = this.board[i];

      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      if (this.board[i])
        square.classList.add(
          this.isPieceColor(this.board[i], "white")
            ? "piece-white"
            : "piece-black",
        );

      if (
        this.lastMove &&
        (i === this.lastMove.from || i === this.lastMove.to)
      ) {
        square.classList.add("last-move");
      }
      if (this.lastMove && i === this.lastMove.to && this.board[i]) {
        square.classList.add("piece-placed");
      }
      if (!this.gameOver && this.isInCheck(this.currentPlayer)) {
        const kingPos = this.findKing(this.currentPlayer);
        if (i === kingPos) square.classList.add("check");
      }

      square.setAttribute("role", "gridcell");
      square.setAttribute("tabindex", "-1");
      square.setAttribute("aria-label", this.getSquareAriaLabel(i));

      square.draggable = !!(
        this.board[i] &&
        this.isPieceColor(this.board[i], this.currentPlayer) &&
        !this.gameOver &&
        !this.pendingPromotion
      );
      square.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
        this.handleSquareClick(idx);
      });
      square.addEventListener("keydown", (e) => {
        this.handleKeyDown(e);
      });
      square.addEventListener("dragstart", (e) => {
        if (square.draggable) {
          this.dragFrom = i;
          e.dataTransfer.setData("text/plain", i);
          e.dataTransfer.effectAllowed = "move";
          square.classList.add("dragging");
          this.showValidMoves(i);
        }
      });
      square.addEventListener("dragend", () => {
        this.dragFrom = null;
        this.clearSelection();
      });
      square.addEventListener("dragover", (e) => {
        if (this.dragFrom !== null && this.isLegalMove(this.dragFrom, i)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      });
      square.addEventListener("drop", (e) => {
        e.preventDefault();
        if (this.dragFrom !== null && this.isLegalMove(this.dragFrom, i)) {
          this.makeMove(this.dragFrom, i);
        }
      });
      this.gameboard.appendChild(square);
    }

    // Erstes Feld per Tab erreichbar machen
    const firstSquare = this.gameboard.children[0];
    if (firstSquare) firstSquare.setAttribute("tabindex", "0");
  }

  /** Aktualisiert Reihen-/Spaltenbeschriftungen je nach Flip. */
  updateLabels() {
    const cols = this.flipped
      ? ["h", "g", "f", "e", "d", "c", "b", "a"]
      : ["a", "b", "c", "d", "e", "f", "g", "h"];
    const rows = this.flipped
      ? ["1", "2", "3", "4", "5", "6", "7", "8"]
      : ["8", "7", "6", "5", "4", "3", "2", "1"];
    document
      .querySelectorAll("#col-labels-top span, #col-labels-bottom span")
      .forEach((el, idx) => {
        el.textContent = cols[idx];
      });
    document
      .querySelectorAll("#row-labels-left span, #row-labels-right span")
      .forEach((el, idx) => {
        el.textContent = rows[idx];
      });
  }

  /**
   * Aktualisiert das bestehende Brett ohne DOM-Neuaufbau.
   */
  updateBoard() {
    const order = this.flipped
      ? [...Array(SQUARE_COUNT)].map((_, i) => LAST_INDEX - i)
      : [...Array(SQUARE_COUNT)].map((_, i) => i);
    const squares = this.gameboard.children;
    const checkKingPos =
      !this.gameOver && this.isInCheck(this.currentPlayer)
        ? this.findKing(this.currentPlayer)
        : -1;

    for (let vis = 0; vis < SQUARE_COUNT; vis++) {
      const i = order[vis];
      const sq = squares[vis];
      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;

      sq.setAttribute("data-index", i);
      sq.setAttribute("aria-label", this.getSquareAriaLabel(i));
      sq.textContent = this.board[i];
      sq.className = "square " + ((row + col) % 2 === 0 ? "light" : "dark");
      if (this.board[i])
        sq.classList.add(
          this.isPieceColor(this.board[i], "white")
            ? "piece-white"
            : "piece-black",
        );
      else sq.classList.remove("piece-white", "piece-black");
      sq.draggable = !!(
        this.board[i] &&
        this.isPieceColor(this.board[i], this.currentPlayer) &&
        !this.gameOver &&
        !this.pendingPromotion
      );

      if (this.lastMove && (i === this.lastMove.from || i === this.lastMove.to))
        sq.classList.add("last-move");
      if (this.lastMove && i === this.lastMove.to && this.board[i])
        sq.classList.add("piece-placed");
      if (i === checkKingPos) sq.classList.add("check");
    }
  }

  /** Aktualisiert die Statusanzeige (wer am Zug ist, Schach-Warnung). */
  updateDisplay() {
    this.playerDisplay.textContent =
      this.currentPlayer === "white" ? "Weiss" : "Schwarz";
    this.whiteClockDisplay.classList.toggle(
      "active-clock",
      this.currentPlayer === "white",
    );
    this.blackClockDisplay.classList.toggle(
      "active-clock",
      this.currentPlayer === "black",
    );

    if (this.gameOver) return;

    if (this.isInCheck(this.currentPlayer)) {
      this.infoDisplay.textContent =
        (this.currentPlayer === "white" ? "Weiss" : "Schwarz") +
        " steht im Schach!";
      this.infoDisplay.classList.add("check-warning");
    } else {
      this.infoDisplay.textContent =
        (this.currentPlayer === "white" ? "Weiss" : "Schwarz") + " ist am Zug";
      this.infoDisplay.classList.remove("check-warning");
    }
  }

  /** Zeigt geschlagene Figuren und Materialvorteil an. */
  updateCapturedDisplay() {
    const sortByValue = (arr) =>
      [...arr].sort(
        (a, b) =>
          (PIECE_VALUES[getPieceType(b)] || 0) -
          (PIECE_VALUES[getPieceType(a)] || 0),
      );
    const val = (arr) =>
      arr.reduce((s, p) => s + (PIECE_VALUES[getPieceType(p)] || 0), 0);
    const wCap = sortByValue(this.capturedPieces.black);
    const bCap = sortByValue(this.capturedPieces.white);
    const adv = val(wCap) - val(bCap);

    if (this.whiteCapturedDisplay) {
      this.whiteCapturedDisplay.innerHTML =
        wCap.join(" ") +
        (adv > 0 ? `<span class="material-adv">+${adv}</span>` : "");
    }
    if (this.blackCapturedDisplay) {
      this.blackCapturedDisplay.innerHTML =
        bCap.join(" ") +
        (adv < 0 ? `<span class="material-adv">+${-adv}</span>` : "");
    }
  }

  /** Aktualisiert die Zugliste in der Seitenleiste. */
  updateMoveList() {
    if (!this.moveListDisplay) return;
    this.moveListDisplay.innerHTML = "";

    for (let i = 0; i < this.moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = this.moveHistory[i] || "";
      const blackMove = this.moveHistory[i + 1] || "";

      const row = document.createElement("div");
      row.classList.add("move-row");

      const numSpan = document.createElement("span");
      numSpan.classList.add("move-num");
      numSpan.textContent = moveNum + ".";

      const whiteSpan = document.createElement("span");
      whiteSpan.classList.add("move-white");
      whiteSpan.textContent = whiteMove;

      const blackSpan = document.createElement("span");
      blackSpan.classList.add("move-black");
      blackSpan.textContent = blackMove;

      row.appendChild(numSpan);
      row.appendChild(whiteSpan);
      row.appendChild(blackSpan);
      this.moveListDisplay.appendChild(row);
    }

    this.moveListDisplay.scrollTop = this.moveListDisplay.scrollHeight;
  }

  // =========================================================================
  //  TIMER
  // =========================================================================

  /** Startet die Schachuhr. */
  startTimer() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = setInterval(() => {
      if (this.gameOver) return;
      if (this.currentPlayer === "white") {
        this.whiteTime--;
      } else {
        this.blackTime--;
      }
      this.updateClockDisplay();

      if (this.whiteTime <= 0) {
        this.endGame("Schwarz gewinnt auf Zeit!");
      } else if (this.blackTime <= 0) {
        this.endGame("Weiss gewinnt auf Zeit!");
      }
    }, 1000);
  }

  /** Aktualisiert die Uhrenanzeige. */
  updateClockDisplay() {
    const fmt = (sec) => {
      const m = Math.floor(Math.max(0, sec) / 60);
      const s = Math.max(0, sec) % 60;
      return m + ":" + s.toString().padStart(2, "0");
    };
    this.whiteClockDisplay.textContent = "Weiss: " + fmt(this.whiteTime);
    this.blackClockDisplay.textContent = "Schwarz: " + fmt(this.blackTime);
  }

  // =========================================================================
  //  INTERAKTION
  // =========================================================================

  /** Verarbeitet Klick auf ein Feld. */
  handleSquareClick(index) {
    if (this.gameOver || this.pendingPromotion) return;

    const piece = this.board[index];

    if (this.selectedSquare === null) {
      if (piece && this.isPieceColor(piece, this.currentPlayer)) {
        this.selectedSquare = index;
        const el = this.getSquareEl(index);
        if (el) el.classList.add("selected");
        this.showValidMoves(index);
      }
    } else {
      if (index === this.selectedSquare) {
        this.clearSelection();
      } else if (piece && this.isPieceColor(piece, this.currentPlayer)) {
        this.clearSelection();
        this.selectedSquare = index;
        const el = this.getSquareEl(index);
        if (el) el.classList.add("selected");
        this.showValidMoves(index);
      } else if (this.isLegalMove(this.selectedSquare, index)) {
        this.makeMove(this.selectedSquare, index);
      } else {
        this.clearSelection();
      }
    }
  }

  /** Markiert alle gueltigen Zielfelder fuer eine Figur. */
  showValidMoves(index) {
    for (let i = 0; i < SQUARE_COUNT; i++) {
      if (this.isLegalMove(index, i)) {
        const sq = this.getSquareEl(i);
        if (!sq) continue;
        const isEnPassant =
          getPieceType(this.board[index]) === "pawn" &&
          i === this.enPassantTarget;
        if (this.board[i] || isEnPassant) {
          sq.classList.add("valid-capture");
        } else {
          sq.classList.add("valid-move");
        }
      }
    }
  }

  /** Entfernt alle Hervorhebungen. */
  clearSelection() {
    this.selectedSquare = null;
    this.dragFrom = null;
    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove(
        "selected",
        "valid-move",
        "valid-capture",
        "dragging",
      );
    });
  }

  /**
   * Verarbeitet Tastaturnavigation auf dem Brett.
   * Pfeiltasten zum Bewegen, Enter/Space zum Auswaehlen, Escape zum Abbrechen.
   */
  handleKeyDown(e) {
    const sq = e.currentTarget;
    const idx = parseInt(sq.getAttribute("data-index"), 10);
    const row = Math.floor(idx / BOARD_SIZE);
    const col = idx % BOARD_SIZE;

    let targetIdx = -1;

    switch (e.key) {
      case "ArrowUp":
        if (row > 0) targetIdx = this.flipped ? idx + BOARD_SIZE : idx - BOARD_SIZE;
        break;
      case "ArrowDown":
        if (row < BOARD_SIZE - 1) targetIdx = this.flipped ? idx - BOARD_SIZE : idx + BOARD_SIZE;
        break;
      case "ArrowLeft":
        if (col > 0) targetIdx = this.flipped ? idx + 1 : idx - 1;
        break;
      case "ArrowRight":
        if (col < BOARD_SIZE - 1) targetIdx = this.flipped ? idx - 1 : idx + 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.handleSquareClick(idx);
        return;
      case "Escape":
        this.clearSelection();
        return;
      default:
        return;
    }

    e.preventDefault();
    if (targetIdx >= 0 && targetIdx < SQUARE_COUNT) {
      const targetEl = this.getSquareEl(targetIdx);
      if (targetEl) targetEl.focus();
    }
  }

  // =========================================================================
  //  ZUGAUSFUEHRUNG
  // =========================================================================

  /** Speichert den aktuellen Zustand fuer Undo. */
  saveState() {
    this.boardHistory.push([...this.board]);
    this.stateHistory.push({
      currentPlayer: this.currentPlayer,
      enPassantTarget: this.enPassantTarget,
      castlingRights: { ...this.castlingRights },
      whiteTime: this.whiteTime,
      blackTime: this.blackTime,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      capturedPieces: {
        white: [...this.capturedPieces.white],
        black: [...this.capturedPieces.black],
      },
      halfMoveClock: this.halfMoveClock,
      positionHistoryLen: this.positionHistory.length,
    });
  }

  /**
   * Fuehrt einen Zug aus und behandelt alle Spezialzuege.
   * @param {number} from - Start-Index
   * @param {number} to - Ziel-Index
   */
  makeMove(from, to) {
    this.saveState();

    const piece = this.board[from];
    const disambig = this.getDisambiguation(piece, from, to);
    const targetPiece = this.board[to];
    const pieceType = getPieceType(piece);
    const pieceColor = getPieceColor(piece);
    const fromRow = Math.floor(from / BOARD_SIZE);
    const toRow = Math.floor(to / BOARD_SIZE);
    const fromCol = from % BOARD_SIZE;
    const toCol = to % BOARD_SIZE;

    let isCapture = !!targetPiece;
    let specialNotation = null;

    // Geschlagene Figur merken
    if (targetPiece) {
      this.capturedPieces[getPieceColor(targetPiece)].push(targetPiece);
    }

    // --- En Passant Schlag ---
    if (pieceType === "pawn" && to === this.enPassantTarget) {
      const capturedIndex = pieceColor === "white" ? to + BOARD_SIZE : to - BOARD_SIZE;
      const capturedPawn = this.board[capturedIndex];
      if (capturedPawn) {
        this.capturedPieces[getPieceColor(capturedPawn)].push(capturedPawn);
        this.board[capturedIndex] = "";
      }
      isCapture = true;
    }

    // --- En Passant Zielfeld aktualisieren ---
    if (pieceType === "pawn" && Math.abs(fromRow - toRow) === 2) {
      this.enPassantTarget = pieceColor === "white" ? from - BOARD_SIZE : from + BOARD_SIZE;
    } else {
      this.enPassantTarget = null;
    }

    // --- Rochade ausfuehren ---
    if (pieceType === "king" && Math.abs(fromCol - toCol) === 2) {
      if (toCol > fromCol) {
        const rookFrom = fromRow * BOARD_SIZE + 7;
        const rookTo = fromRow * BOARD_SIZE + 5;
        this.board[rookTo] = this.board[rookFrom];
        this.board[rookFrom] = "";
        specialNotation = "O-O";
      } else {
        const rookFrom = fromRow * BOARD_SIZE;
        const rookTo = fromRow * BOARD_SIZE + 3;
        this.board[rookTo] = this.board[rookFrom];
        this.board[rookFrom] = "";
        specialNotation = "O-O-O";
      }
    }

    // --- Rochaderechte aktualisieren ---
    if (pieceType === "king") {
      if (pieceColor === "white") {
        this.castlingRights.whiteKingSide = false;
        this.castlingRights.whiteQueenSide = false;
      } else {
        this.castlingRights.blackKingSide = false;
        this.castlingRights.blackQueenSide = false;
      }
    }
    if (pieceType === "rook") {
      if (from === LAST_INDEX) this.castlingRights.whiteKingSide = false;
      if (from === LAST_INDEX - 7) this.castlingRights.whiteQueenSide = false;
      if (from === 7) this.castlingRights.blackKingSide = false;
      if (from === 0) this.castlingRights.blackQueenSide = false;
    }
    if (to === LAST_INDEX) this.castlingRights.whiteKingSide = false;
    if (to === LAST_INDEX - 7) this.castlingRights.whiteQueenSide = false;
    if (to === 7) this.castlingRights.blackKingSide = false;
    if (to === 0) this.castlingRights.blackQueenSide = false;

    // --- Halfmove fuer 50-Zuege-Regel ---
    if (pieceType === "pawn" || isCapture) this.halfMoveClock = 0;
    else this.halfMoveClock++;

    // --- Figur ziehen ---
    this.board[to] = piece;
    this.board[from] = "";

    // --- Bauernumwandlung ---
    if (pieceType === "pawn" && (toRow === 0 || toRow === 7)) {
      this.pendingPromotion = {
        to,
        from,
        color: pieceColor,
        isCapture,
        specialNotation,
      };
      this.lastMove = { from, to };
      this.clearSelection();
      this.updateBoard();
      this.showPromotionModal(pieceColor);
      return;
    }

    const notation = getAlgebraicNotation(
      piece,
      from,
      to,
      isCapture,
      specialNotation,
      disambig,
    );
    this.moveHistory.push(notation);

    this.animateMove(from, to, () => this.finishMove(from, to, isCapture));
  }

  /** Schliesst einen Zug ab. */
  finishMove(from, to, wasCapture) {
    this.lastMove = { from, to };
    this.clearSelection();
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.positionHistory.push(this.getBoardHash());
    if (wasCapture) this.sound.playCapture();
    else this.sound.playMove();
    this.updateBoard();
    this.updateDisplay();
    this.updateClockDisplay();
    this.updateCapturedDisplay();
    this.updateMoveList();
    this.checkGameState();
  }

  // =========================================================================
  //  BAUERNUMWANDLUNG
  // =========================================================================

  /** Zeigt das Umwandlungs-Modal an. */
  showPromotionModal(color) {
    const modal = document.querySelector("#promotion-modal");
    const options = modal.querySelectorAll(".promo-piece");
    const choices = [
      PIECES.queen[color],
      PIECES.rook[color],
      PIECES.bishop[color],
      PIECES.knight[color],
    ];
    options.forEach((opt, idx) => {
      opt.textContent = choices[idx];
      opt.onclick = () => this.completePromotion(choices[idx]);
    });
    modal.classList.add("visible");
  }

  /** Fuehrt die Bauernumwandlung durch. */
  completePromotion(newPiece) {
    const { to, from, isCapture, specialNotation, color } =
      this.pendingPromotion;
    this.board[to] = newPiece;

    document.querySelector("#promotion-modal").classList.remove("visible");

    const origPiece = PIECES.pawn[color];
    let notation = getAlgebraicNotation(
      origPiece,
      from,
      to,
      isCapture,
      specialNotation,
      "",
    );
    const promoType = getPieceType(newPiece);
    notation += "=" + (PIECE_NOTATION[promoType] || "");
    this.moveHistory.push(notation);
    this.halfMoveClock = 0; // Bauernumwandlung = Bauerzug

    this.pendingPromotion = null;
    this.finishMove(from, to, isCapture);
  }

  // =========================================================================
  //  SPIELSTATUS
  // =========================================================================

  /** Prueft nach einem Zug auf Schachmatt, Patt oder Remis. */
  checkGameState() {
    if (this.isThreefoldRepetition()) {
      this.endGame("Remis durch dreifache Stellungswiederholung!");
      return;
    }
    if (this.halfMoveClock >= 100) {
      this.endGame("Remis nach 50-Zuege-Regel!");
      return;
    }
    if (this.isInsufficientMaterial()) {
      this.endGame("Remis durch ungenuegendes Material!");
      return;
    }
    if (!this.hasLegalMoves(this.currentPlayer)) {
      if (this.isInCheck(this.currentPlayer)) {
        const winner = this.currentPlayer === "white" ? "Schwarz" : "Weiss";
        if (this.moveHistory.length > 0) {
          this.moveHistory[this.moveHistory.length - 1] += "#";
          this.updateMoveList();
        }
        this.endGame("Schachmatt! " + winner + " gewinnt!");
      } else {
        this.endGame("Patt! Unentschieden!");
      }
      return;
    }
    if (this.isInCheck(this.currentPlayer)) {
      this.sound.playCheck();
      if (this.moveHistory.length > 0) {
        this.moveHistory[this.moveHistory.length - 1] += "+";
        this.updateMoveList();
      }
    }
  }

  getBoardHash() {
    const cr = this.castlingRights;
    return (
      this.board.join("") +
      "|" +
      this.currentPlayer +
      "|" +
      (cr.whiteKingSide ? "1" : "0") +
      (cr.whiteQueenSide ? "1" : "0") +
      (cr.blackKingSide ? "1" : "0") +
      (cr.blackQueenSide ? "1" : "0") +
      "|" +
      (this.enPassantTarget ?? "")
    );
  }

  isThreefoldRepetition() {
    const h = this.getBoardHash();
    return this.positionHistory.filter((x) => x === h).length >= 3;
  }

  isInsufficientMaterial() {
    const pieces = this.board.filter(Boolean);
    if (pieces.length > 4) return false;
    const types = pieces.map(getPieceType);
    if (
      types.includes("pawn") ||
      types.includes("rook") ||
      types.includes("queen")
    )
      return false;
    const minors = types.filter((t) => t === "knight" || t === "bishop");
    if (minors.length <= 1) return true; // K vs K, K+B vs K, K+S vs K
    if (minors.length === 2 && minors.every((t) => t === "bishop")) {
      const bishops = pieces.filter((p) => getPieceType(p) === "bishop");
      const sq = (i) => (Math.floor(i / BOARD_SIZE) + (i % BOARD_SIZE)) % 2;
      if (bishops.length === 2) {
        const idx1 = this.board.indexOf(bishops[0]);
        const idx2 = this.board.indexOf(bishops[1]);
        if (sq(idx1) === sq(idx2)) return true; // beide auf gleicher Farbe
      }
    }
    return false;
  }

  getDisambiguation(piece, from, to) {
    const type = getPieceType(piece);
    if (!type || type === "pawn" || type === "king") return "";
    const color = getPieceColor(piece);
    const others = [];
    for (let i = 0; i < SQUARE_COUNT; i++) {
      if (i === from) continue;
      if (
        this.board[i] &&
        this.isPieceColor(this.board[i], color) &&
        getPieceType(this.board[i]) === type &&
        this.isLegalMove(i, to)
      ) {
        others.push(i);
      }
    }
    if (others.length === 0) return "";
    const fromCol = from % BOARD_SIZE,
      fromRow = Math.floor(from / BOARD_SIZE);
    const sameCol = others.some((i) => i % BOARD_SIZE === fromCol);
    const sameRow = others.some((i) => Math.floor(i / BOARD_SIZE) === fromRow);
    if (!sameCol) return COL_LETTERS[fromCol];
    if (!sameRow) return String(BOARD_SIZE - fromRow);
    return COL_LETTERS[fromCol] + (BOARD_SIZE - fromRow);
  }

  animateMove(from, to, cb) {
    const fromEl = this.getSquareEl(from);
    const toEl = this.getSquareEl(to);
    if (!fromEl || !toEl) {
      cb();
      return;
    }
    const piece = this.board[to];
    if (!piece) {
      cb();
      return;
    }
    const r1 = fromEl.getBoundingClientRect();
    const r2 = toEl.getBoundingClientRect();
    const ghost = document.createElement("span");
    ghost.className = "moving-piece";
    ghost.textContent = piece;
    ghost.style.left = r1.left + "px";
    ghost.style.top = r1.top + "px";
    ghost.style.fontSize = "calc(var(--sq-size) * 0.6)";
    ghost.style.color = window.getComputedStyle(fromEl).color || "inherit";
    document.body.appendChild(ghost);
    fromEl.style.visibility = "hidden";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.left = r2.left + "px";
        ghost.style.top = r2.top + "px";
        ghost.style.transition = "left 0.2s ease-out, top 0.2s ease-out";
        setTimeout(() => {
          fromEl.style.visibility = "";
          ghost.remove();
          cb();
        }, 220);
      });
    });
  }

  getSquareEl(idx) {
    return Array.from(this.gameboard.children).find(
      (sq) => parseInt(sq.getAttribute("data-index"), 10) === idx,
    );
  }

  flipBoard() {
    this.flipped = !this.flipped;
    this.createBoard();
    this.updateLabels();
  }

  exportPGN() {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
    const result = this.gameResult || "*";
    let pgn = `[Event "Schachspiel"]\n[Date "${d}"]\n[White "Weiss"]\n[Black "Schwarz"]\n[Result "${result}"]\n\n`;
    for (let i = 0; i < this.moveHistory.length; i += 2) {
      pgn +=
        Math.floor(i / 2) +
        1 +
        ". " +
        (this.moveHistory[i] || "") +
        " " +
        (this.moveHistory[i + 1] || "") +
        " ";
    }
    pgn = pgn.trim() + " " + result;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pgn).then(() => {
        this.infoDisplay.textContent = "PGN kopiert!";
        setTimeout(() => this.updateDisplay(), 2000);
      }).catch(() => {
        this.copyFallback(pgn);
      });
    } else {
      this.copyFallback(pgn);
    }
  }

  /** Fallback-Kopiermethode fuer aeltere Browser oder fehlende Clipboard-API. */
  copyFallback(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      this.infoDisplay.textContent = "PGN kopiert!";
    } catch {
      this.infoDisplay.textContent = "PGN konnte nicht kopiert werden.";
    }
    setTimeout(() => this.updateDisplay(), 2000);
  }

  resign() {
    if (this.gameOver) return;
    const winner = this.currentPlayer === "white" ? "Schwarz" : "Weiss";
    this.endGame(winner + " gewinnt durch Aufgeben!");
  }

  /** Beendet das Spiel und zeigt das Ergebnis-Modal. */
  endGame(message) {
    this.gameOver = true;
    clearInterval(this.gameTimer);
    this.infoDisplay.textContent = message;
    this.infoDisplay.classList.add("check-warning");

    // Ergebnis fuer PGN setzen
    if (message.includes("Weiss gewinnt")) {
      this.gameResult = "1-0";
    } else if (message.includes("Schwarz gewinnt")) {
      this.gameResult = "0-1";
    } else {
      this.gameResult = "1/2-1/2";
    }

    this.sound.playGameEnd();

    const endModal = document.querySelector("#game-end-modal");
    if (endModal) {
      endModal.querySelector("#end-message").textContent = message;
      endModal.classList.add("visible");
    }
  }

  // =========================================================================
  //  ZUG-VALIDIERUNG
  // =========================================================================

  /**
   * Prueft ob eine Figur zu einer bestimmten Farbe gehoert.
   * @param {string} piece
   * @param {"white"|"black"} color
   * @returns {boolean}
   */
  isPieceColor(piece, color) {
    if (!piece) return false;
    return color === "white" ? isWhitePiece(piece) : isBlackPiece(piece);
  }

  /**
   * Findet die Position des Koenigs einer Farbe.
   * @param {"white"|"black"} color
   * @returns {number} Board-Index (-1 wenn nicht gefunden)
   */
  findKing(color) {
    const king = color === "white" ? PIECES.king.white : PIECES.king.black;
    return this.board.indexOf(king);
  }

  /**
   * Prueft ob ein Feld von einer bestimmten Farbe angegriffen wird.
   * Nutzt isValidMoveRaw mit forAttack=true (nur Angriffsmuster).
   * @param {number} square
   * @param {"white"|"black"} byColor
   * @returns {boolean}
   */
  isSquareAttacked(square, byColor) {
    for (let i = 0; i < SQUARE_COUNT; i++) {
      const piece = this.board[i];
      if (piece && this.isPieceColor(piece, byColor)) {
        if (this.isValidMoveRaw(i, square, true)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Prueft ob der Koenig einer Farbe im Schach steht.
   * @param {"white"|"black"} color
   * @returns {boolean}
   */
  isInCheck(color) {
    const kingPos = this.findKing(color);
    if (kingPos === -1) return false;
    const opponent = color === "white" ? "black" : "white";
    return this.isSquareAttacked(kingPos, opponent);
  }

  /**
   * Simuliert einen Zug und prueft, ob der eigene Koenig danach im Schach steht.
   * @param {number} from
   * @param {number} to
   * @param {"white"|"black"} color
   * @returns {boolean} true wenn der Koenig im Schach waere
   */
  wouldBeInCheck(from, to, color) {
    const savedBoard = [...this.board];
    const savedEP = this.enPassantTarget;

    const piece = this.board[from];
    const pieceType = getPieceType(piece);

    // En Passant Schlag simulieren
    if (pieceType === "pawn" && to === this.enPassantTarget) {
      const capturedIdx = color === "white" ? to + BOARD_SIZE : to - BOARD_SIZE;
      this.board[capturedIdx] = "";
    }

    this.board[to] = this.board[from];
    this.board[from] = "";

    // Rochade-Turm mitsimulieren
    if (pieceType === "king" && Math.abs((from % BOARD_SIZE) - (to % BOARD_SIZE)) === 2) {
      const row = Math.floor(from / BOARD_SIZE);
      if (to % BOARD_SIZE > from % BOARD_SIZE) {
        this.board[row * BOARD_SIZE + 5] = this.board[row * BOARD_SIZE + 7];
        this.board[row * BOARD_SIZE + 7] = "";
      } else {
        this.board[row * BOARD_SIZE + 3] = this.board[row * BOARD_SIZE];
        this.board[row * BOARD_SIZE] = "";
      }
    }

    const inCheck = this.isInCheck(color);

    this.board = savedBoard;
    this.enPassantTarget = savedEP;

    return inCheck;
  }

  /**
   * Prueft ob ein Zug legal ist (Regelkonform UND laesst Koenig nicht im Schach).
   * @param {number} from
   * @param {number} to
   * @returns {boolean}
   */
  isLegalMove(from, to) {
    if (!this.isValidMoveRaw(from, to, false)) return false;
    const pieceColor = getPieceColor(this.board[from]);
    return !this.wouldBeInCheck(from, to, pieceColor);
  }

  /**
   * Prueft ob eine Farbe noch mindestens einen legalen Zug hat.
   * @param {"white"|"black"} color
   * @returns {boolean}
   */
  hasLegalMoves(color) {
    for (let from = 0; from < SQUARE_COUNT; from++) {
      if (this.board[from] && this.isPieceColor(this.board[from], color)) {
        for (let to = 0; to < SQUARE_COUNT; to++) {
          if (this.isLegalMove(from, to)) return true;
        }
      }
    }
    return false;
  }

  /**
   * Prueft ob der Weg zwischen zwei Feldern frei ist (fuer Turm, Laeufer, Dame).
   * @param {number} from
   * @param {number} to
   * @returns {boolean}
   */
  isPathClear(from, to) {
    const fromRow = Math.floor(from / BOARD_SIZE);
    const fromCol = from % BOARD_SIZE;
    const toRow = Math.floor(to / BOARD_SIZE);
    const toCol = to % BOARD_SIZE;

    const rowDir = Math.sign(toRow - fromRow);
    const colDir = Math.sign(toCol - fromCol);

    let r = fromRow + rowDir;
    let c = fromCol + colDir;

    while (r !== toRow || c !== toCol) {
      if (this.board[r * BOARD_SIZE + c]) return false;
      r += rowDir;
      c += colDir;
    }
    return true;
  }

  /**
   * Prueft ob ein Bauernzug gueltig ist (fuer beide Farben).
   * @param {string} piece - Die Bauernfigur
   * @param {number} fromRow
   * @param {number} fromCol
   * @param {number} toRow
   * @param {number} toCol
   * @param {string} targetPiece - Figur auf dem Zielfeld
   * @param {number} to - Ziel-Index
   * @param {boolean} forAttack - Nur Angriffsfelder pruefen?
   * @returns {boolean}
   */
  isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, targetPiece, to, forAttack) {
    const isWhite = piece === PIECES.pawn.white;
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const jumpRow = isWhite ? 4 : 3;
    const betweenIdx = (startRow + direction) * BOARD_SIZE + fromCol;

    // Angriffsmuster (diagonal ein Feld vorwaerts)
    if (forAttack) {
      return Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow;
    }

    // Geradeaus (kein Schlagen)
    if (fromCol === toCol && !targetPiece) {
      if (fromRow + direction === toRow) return true;
      if (fromRow === startRow && toRow === jumpRow && !this.board[betweenIdx])
        return true;
    }

    // Diagonal schlagen (inkl. En Passant)
    if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow) {
      if (targetPiece) return true;
      if (to === this.enPassantTarget) return true;
    }

    return false;
  }

  /**
   * Rohe Zugvalidierung: prueft nur die Figurenbewegungsregeln.
   * Keine Pruefung ob der eigene Koenig danach im Schach steht.
   *
   * @param {number} from - Start-Index
   * @param {number} to - Ziel-Index
   * @param {boolean} forAttack - Wenn true, werden nur Angriffsfelder geprueft
   *                              (Bauern greifen diagonal an, nicht vorwaerts)
   * @returns {boolean}
   */
  isValidMoveRaw(from, to, forAttack) {
    const piece = this.board[from];
    const targetPiece = this.board[to];

    if (!piece) return false;
    if (from === to) return false;

    const pieceColor = getPieceColor(piece);

    // Eigene Figuren nicht schlagen
    if (targetPiece && this.isPieceColor(targetPiece, pieceColor)) return false;

    const fromRow = Math.floor(from / BOARD_SIZE);
    const fromCol = from % BOARD_SIZE;
    const toRow = Math.floor(to / BOARD_SIZE);
    const toCol = to % BOARD_SIZE;

    switch (piece) {
      // --- Weisser Bauer ---
      case PIECES.pawn.white:
      // --- Schwarzer Bauer ---
      case PIECES.pawn.black:
        return this.isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, targetPiece, to, forAttack);

      // --- Turm ---
      case PIECES.rook.white:
      case PIECES.rook.black:
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(from, to);

      // --- Springer ---
      case PIECES.knight.white:
      case PIECES.knight.black:
        return (
          (Math.abs(fromRow - toRow) === 2 &&
            Math.abs(fromCol - toCol) === 1) ||
          (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)
        );

      // --- Laeufer ---
      case PIECES.bishop.white:
      case PIECES.bishop.black:
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol))
          return false;
        return this.isPathClear(from, to);

      // --- Dame ---
      case PIECES.queen.white:
      case PIECES.queen.black: {
        const straight = fromRow === toRow || fromCol === toCol;
        const diagonal =
          Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);
        if (!straight && !diagonal) return false;
        return this.isPathClear(from, to);
      }

      // --- Koenig ---
      case PIECES.king.white:
      case PIECES.king.black: {
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
          return true;
        }
        if (
          !forAttack &&
          fromRow === toRow &&
          Math.abs(fromCol - toCol) === 2
        ) {
          return this.canCastle(from, to);
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Prueft ob eine Rochade moeglich ist.
   * Bedingungen: Koenig/Turm nicht bewegt, Weg frei, kein Schach auf dem Weg.
   * @param {number} from - Koenig-Position
   * @param {number} to - Zielposition des Koenigs
   * @returns {boolean}
   */
  canCastle(from, to) {
    const color = getPieceColor(this.board[from]);
    const row = Math.floor(from / BOARD_SIZE);
    const toCol = to % BOARD_SIZE;
    const opColor = color === "white" ? "black" : "white";

    if (this.isInCheck(color)) return false;

    if (toCol === 6) {
      // Kurze Rochade (Koenigsseite)
      const right =
        color === "white"
          ? this.castlingRights.whiteKingSide
          : this.castlingRights.blackKingSide;
      if (!right) return false;
      if (this.board[row * BOARD_SIZE + 5] || this.board[row * BOARD_SIZE + 6]) return false;
      if (this.isSquareAttacked(row * BOARD_SIZE + 5, opColor)) return false;
      if (this.isSquareAttacked(row * BOARD_SIZE + 6, opColor)) return false;
      return true;
    }

    if (toCol === 2) {
      // Lange Rochade (Damenseite)
      const right =
        color === "white"
          ? this.castlingRights.whiteQueenSide
          : this.castlingRights.blackQueenSide;
      if (!right) return false;
      if (
        this.board[row * BOARD_SIZE + 1] ||
        this.board[row * BOARD_SIZE + 2] ||
        this.board[row * BOARD_SIZE + 3]
      ) {
        return false;
      }
      if (this.isSquareAttacked(row * BOARD_SIZE + 2, opColor)) return false;
      if (this.isSquareAttacked(row * BOARD_SIZE + 3, opColor)) return false;
      return true;
    }

    return false;
  }

  // =========================================================================
  //  UNDO / RESET
  // =========================================================================

  /** Nimmt den letzten Zug zurueck. */
  undoMove() {
    if (
      this.boardHistory.length === 0 ||
      this.gameOver ||
      this.pendingPromotion
    )
      return;

    this.board = this.boardHistory.pop();
    const state = this.stateHistory.pop();

    this.currentPlayer = state.currentPlayer;
    this.enPassantTarget = state.enPassantTarget;
    this.castlingRights = state.castlingRights;
    this.whiteTime = state.whiteTime;
    this.blackTime = state.blackTime;
    this.lastMove = state.lastMove;
    this.capturedPieces = state.capturedPieces;
    this.halfMoveClock = state.halfMoveClock ?? 0;
    this.positionHistory.length =
      state.positionHistoryLen ?? this.positionHistory.length;

    this.moveHistory.pop();
    this.pendingPromotion = null;

    document.querySelector("#promotion-modal").classList.remove("visible");

    this.clearSelection();
    this.updateBoard();
    this.updateDisplay();
    this.updateClockDisplay();
    this.updateCapturedDisplay();
    this.updateMoveList();
  }

  /** Startet ein komplett neues Spiel. */
  resetGame() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameOver = false;

    document.querySelector("#promotion-modal").classList.remove("visible");
    document.querySelector("#game-end-modal").classList.remove("visible");

    this.initGame();
  }
}

// =============================================================================
//  SPIEL STARTEN
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const game = new ChessGame();

  document
    .querySelector("#btn-new-game")
    .addEventListener("click", () => game.resetGame());
  document
    .querySelector("#btn-undo")
    .addEventListener("click", () => game.undoMove());
  document
    .querySelector("#btn-flip")
    .addEventListener("click", () => game.flipBoard());
  document.querySelector("#btn-mute").addEventListener("click", () => {
    const m = game.sound.toggle();
    document.querySelector("#btn-mute").textContent = m ? "Ton An" : "Ton Aus";
    document.querySelector("#btn-mute").classList.toggle("muted", m);
  });
  document
    .querySelector("#btn-pgn")
    .addEventListener("click", () => game.exportPGN());
  document.querySelector("#btn-resign").addEventListener("click", () => {
    document.querySelector("#resign-modal").classList.add("visible");
  });
  document
    .querySelector("#btn-resign-confirm")
    .addEventListener("click", () => {
      document.querySelector("#resign-modal").classList.remove("visible");
      game.resign();
    });
  document.querySelector("#btn-resign-cancel").addEventListener("click", () => {
    document.querySelector("#resign-modal").classList.remove("visible");
  });

  const playAgainBtn = document.querySelector("#btn-play-again");
  if (playAgainBtn)
    playAgainBtn.addEventListener("click", () => game.resetGame());
});

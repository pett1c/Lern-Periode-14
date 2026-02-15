/**
 * pieces.js - Figurendefinitionen, Startposition und Hilfsfunktionen
 */

/** Schachfiguren als Unicode-Zeichen */
const PIECES = {
  pawn: { white: "\u2659", black: "\u265F" },
  rook: { white: "\u2656", black: "\u265C" },
  knight: { white: "\u2658", black: "\u265E" },
  bishop: { white: "\u2657", black: "\u265D" },
  queen: { white: "\u2655", black: "\u265B" },
  king: { white: "\u2654", black: "\u265A" },
};

/** Zeichenketten fuer schnelle Farbpruefung */
const WHITE_PIECES = "\u2654\u2655\u2656\u2657\u2658\u2659";
const BLACK_PIECES = "\u265A\u265B\u265C\u265D\u265E\u265F";

/** Startaufstellung (Index 0 = a8, Index 63 = h1) */
const START_POSITION = [
  PIECES.rook.black,
  PIECES.knight.black,
  PIECES.bishop.black,
  PIECES.queen.black,
  PIECES.king.black,
  PIECES.bishop.black,
  PIECES.knight.black,
  PIECES.rook.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  PIECES.pawn.black,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.pawn.white,
  PIECES.rook.white,
  PIECES.knight.white,
  PIECES.bishop.white,
  PIECES.queen.white,
  PIECES.king.white,
  PIECES.bishop.white,
  PIECES.knight.white,
  PIECES.rook.white,
];

/**
 * Prueft ob eine Figur weiss ist.
 * @param {string} piece - Unicode-Zeichen der Figur
 * @returns {boolean}
 */
function isWhitePiece(piece) {
  return WHITE_PIECES.includes(piece);
}

/**
 * Prueft ob eine Figur schwarz ist.
 * @param {string} piece - Unicode-Zeichen der Figur
 * @returns {boolean}
 */
function isBlackPiece(piece) {
  return BLACK_PIECES.includes(piece);
}

/**
 * Gibt die Farbe einer Figur zurueck.
 * @param {string} piece
 * @returns {"white"|"black"|null}
 */
function getPieceColor(piece) {
  if (!piece) return null;
  return isWhitePiece(piece) ? "white" : isBlackPiece(piece) ? "black" : null;
}

/**
 * Gibt den Figurentyp zurueck (pawn, rook, knight, bishop, queen, king).
 * @param {string} piece
 * @returns {string|null}
 */
function getPieceType(piece) {
  if (!piece) return null;
  for (const [type, colors] of Object.entries(PIECES)) {
    if (colors.white === piece || colors.black === piece) return type;
  }
  return null;
}

/** Brettgroessen-Konstanten */
const BOARD_SIZE = 8;
const SQUARE_COUNT = 64;
const LAST_INDEX = 63;

/** Spaltenbuchstaben a-h */
const COL_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Figurenwerte fuer Materialberechnung */
const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

/** Figurenkuerzel fuer algebraische Notation */
const PIECE_NOTATION = {
  king: "K",
  queen: "D",
  rook: "T",
  bishop: "L",
  knight: "S",
  pawn: "",
};

/**
 * Wandelt einen Board-Index (0-63) in algebraische Notation um.
 * @param {number} index
 * @returns {string} z.B. "e4"
 */
function indexToAlgebraic(index) {
  const col = index % BOARD_SIZE;
  const row = BOARD_SIZE - Math.floor(index / BOARD_SIZE);
  return COL_LETTERS[col] + row;
}

/**
 * Erzeugt die algebraische Notation fuer einen Zug.
 * @param {string} piece - Die gezogene Figur
 * @param {number} from - Start-Index
 * @param {number} to - Ziel-Index
 * @param {boolean} isCapture - Schlagzug?
 * @param {string|null} special - "O-O" oder "O-O-O" fuer Rochade
 * @param {string} disambig - Disambiguierung (z.B. "b" oder "2" fuer Sbd2)
 * @returns {string}
 */
function getAlgebraicNotation(piece, from, to, isCapture, special, disambig) {
  if (special === "O-O") return "O-O";
  if (special === "O-O-O") return "O-O-O";

  const type = getPieceType(piece);
  const prefix = PIECE_NOTATION[type] || "";
  const captureStr = isCapture ? "x" : "";
  const target = indexToAlgebraic(to);

  if (type === "pawn" && isCapture) {
    return COL_LETTERS[from % BOARD_SIZE] + captureStr + target;
  }
  return prefix + (disambig || "") + captureStr + target;
}

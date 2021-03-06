'use strict';

var crypto = require('crypto');

function Piece(options) {

  if (!options) {
    throw new Error('options must be specified');
  }

  if (!options.id) {
    throw new Error('options.id must be specified');
  }

  if (!options.board) {
    throw new Error('options.board must be specified');
  }

  if (!options.position || !options.position.x || !options.position.y) {
    throw new Error('options.position must be specified');
  }

  this.id = options.id;

  this.board = options.board;

  this.class = options.class || 'piece';

  this.size = options.size || 50;

  this.borderSize = options.borderSize || 3;

  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.target = options.target || {
    x: this.position.x,
    y: this.position.y
  };

  this.speed = options.speed || 2;

  if (options.weapon) {
    this.weapon = options.weapon;
    this.weapon.last = 0;
  }

  this.board.addPiece(this);

  if (options.lifespan) {
    this.deathCallback = options.deathCallback;
    var piece = this;
    setTimeout(function() {
      if (typeof piece.deathCallback !== 'undefined') {
        piece.deathCallback(piece.id);
      }
      piece.deconstruct();
    }, options.lifespan);
  }

}

Piece.prototype.deconstruct = function() {
  this.board.removePiece(this.id);
};

Piece.prototype.getOptions = function() {
  return {
    id: this.id,
    position: {
      x: this.position.x,
      y: this.position.y
    },
    target: {
      x: this.target.x,
      y: this.target.y
    },
    size: this.size,
    borderSize: this.borderSize,
    speed: this.speed,
    class: this.class
  };
};

Piece.prototype.getUpdate = function() {
  return {
    id: this.id,
    position: this.position,
    target: this.target
  };
};

Piece.prototype.updateTarget = function(target) {
  this.target.x = target.x;
  this.target.y = target.y;
};

Piece.prototype.fire = function(target, deathCallback) {

  if (!this.weapon) {
    return; // no weapon
  }

  if (this.weapon.last + this.weapon.cooldown > Date.now()) {
    return; // still on cooldown
  }

  var options = {
    id: crypto.randomBytes(32).toString('hex'),
    board: this.board,
    position: {
      x: this.position.x,
      y: this.position.y
    },
    target: {
      x: target.x,
      y: target.y
    },
    size: 10,
    speed: 8,
    borderSize: 2,
    class: 'projectile piece',
    lifespan: 500,
    deathCallback: deathCallback
  };

  this.weapon.last = Date.now();

  return new Piece(options);
};

Piece.prototype.update = function() {
  var movementX = this.target.x - this.position.x;
  var movementY = this.target.y - this.position.y;
  if (movementX != 0 || movementY != 0) {
    var factor = this.speed / Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2));
    if (factor < 1) {
      movementX *= factor;
      movementY *= factor;
    }
  }
  var x = this.position.x + movementX;
  x = Math.min(x, this.board.size.width - this.size/2);
  x = Math.max(x, this.size/2);
  this.position.x = x;
  var y = this.position.y + movementY;
  y = Math.min(y, this.board.size.height - this.size/2);
  y = Math.max(y, this.size/2);
  this.position.y = y;
  for (var i in this.board.pieces) {
    var other = this.board.pieces[i];
    if (this == other) {
      break;
    }
    var dx = this.position.x - other.position.x;
    var dy = this.position.y - other.position.y;
    var totalSize = this.size/2 + other.size/2;
  }
};

module.exports = Piece;

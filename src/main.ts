import { Actor, CollisionType, Color, Engine } from "excalibur";
// game.js

// Create an instance of the engine.
const game = new Engine({
  width: 800,
  height: 600,
});

// Create an actor with x position of 150px,
// y position of 40px from the bottom of the screen,
// width of 200px, height and a height of 20px
const paddle = new Actor({
  x: 150,
  y: game.drawHeight - 40,
  width: 200,
  height: 20,
});

// Let's give it some color with one of the predefined
// color constants
paddle.color = Color.Chartreuse;

// Make sure the paddle can partipate in collisions, by default excalibur actors do not collide
paddle.body.collider.type = CollisionType.Fixed;

// `game.add` is the same as calling
// `game.currentScene.add`
game.add(paddle);

// Add a mouse move listener
game.input.pointers.primary.on("move", function (evt) {
  paddle.pos.x = evt.worldPos.x;
});

// Create a ball
const ball = new Actor(100, 300, 20, 20);

// Set the color
ball.color = Color.Red;

// Set the velocity in pixels per second
ball.vel.setTo(100, 100);

// Set the collision Type to passive
// This means "tell me when I collide with an emitted event, but don't let excalibur do anything automatically"
ball.body.collider.type = CollisionType.Passive;
// Other possible collision types:
// "ex.CollisionType.PreventCollision - this means do not participate in any collision notification at all"
// "ex.CollisionType.Active - this means participate and let excalibur resolve the positions/velocities of actors after collision"
// "ex.CollisionType.Fixed - this means participate, but this object is unmovable"

// Wire up to the postupdate event
ball.on("postupdate", () => {
  // If the ball collides with the left side
  // of the screen reverse the x velocity
  if (ball.pos.x < ball.width / 2) {
    ball.vel.x *= -1;
  }

  // If the ball collides with the right side
  // of the screen reverse the x velocity
  if (ball.pos.x + ball.width / 2 > game.drawWidth) {
    ball.vel.x *= -1;
  }

  // If the ball collides with the top
  // of the screen reverse the y velocity
  if (ball.pos.y < ball.height / 2) {
    ball.vel.y *= -1;
  }
});

// Draw is passed a rendering context and a delta in milliseconds since the last frame
ball.draw = (ctx, delta) => {
  // Optionally call original 'base' method
  // ex.Actor.prototype.draw.call(this, ctx, delta)

  // Custom draw code
  ctx.fillStyle = ball.color.toString();
  ctx.beginPath();
  ctx.arc(ball.pos.x, ball.pos.y, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
};

// Add the ball to the current scene
game.add(ball);

// Build Bricks

// Padding between bricks
const padding = 20; // px
const xoffset = 65; // x-offset
const yoffset = 20; // y-offset
const columns = 5;
const rows = 3;

const brickColor = [Color.Violet, Color.Orange, Color.Yellow];

// Individual brick width with padding factored in
const brickWidth = game.drawWidth / columns - padding - padding / columns; // px
const brickHeight = 30; // px
const bricks: Actor[] = [];
for (let j = 0; j < rows; j++) {
  for (let i = 0; i < columns; i++) {
    bricks.push(
      new Actor({
        x: xoffset + i * (brickWidth + padding) + padding,
        y: yoffset + j * (brickHeight + padding) + padding,
        width: brickWidth,
        height: brickHeight,
        color: brickColor[j % brickColor.length],
      })
    );
  }
}

bricks.forEach(function (brick) {
  // Make sure that bricks can participate in collisions
  brick.body.collider.type = CollisionType.Active;

  // Add the brick to the current scene to be drawn
  game.add(brick);
});

// On collision remove the brick, bounce the ball
ball.on("precollision", function (ev) {
  if (bricks.indexOf(ev.other) > -1) {
    // kill removes an actor from the current scene
    // therefore it will no longer be drawn or updated
    ev.other.kill();
  }

  // reverse course after any collision
  // intersections are the direction body A has to move to not be clipping body B
  // `ev.intersection` is a vector `normalize()` will make the length of it 1
  // `negate()` flips the direction of the vector
  var intersection = ev.intersection.normalize();

  // The largest component of intersection is our axis to flip
  if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
    ball.vel.x *= -1;
  } else {
    ball.vel.y *= -1;
  }
});

// Loss condigion
ball.on("exitviewport", () => {
  alert("You lose!");
});

// Start the engine to begin the game.
game.start();

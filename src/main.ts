import { Actor, CollisionType, Color, Engine, vec } from "excalibur";
// game.js

// start-snippet{create-engine}
// Create an instance of the engine.
// I'm specifying that the game be 800 pixels wide by 600 pixels tall.
// If no dimensions are specified the game will fit to the screen.
const game = new Engine({
  width: 800,
  height: 600,
});
// end-snippet{create-engine}

// start-snippet{create-paddle}
// Create an actor with x position of 150px,
// y position of 40px from the bottom of the screen,
// width of 200px, height and a height of 20px
const paddle = new Actor({
  x: 150,
  y: game.drawHeight - 40,
  width: 200,
  height: 20,
  // Let's give it some color with one of the predefined
  // color constants
  color: Color.Chartreuse,
});

// Make sure the paddle can partipate in collisions, by default excalibur actors do not collide with each other
// CollisionType.Fixed is like an object with infinite mass, and cannot be moved, but does participate in collision.
paddle.body.collisionType = CollisionType.Fixed;

// `game.add` is the same as calling
// `game.currentScene.add`
game.add(paddle);
// end-snippet{create-paddle}

// start-snippet{mouse-move}
// Add a mouse move listener
game.input.pointers.primary.on("move", (evt) => {
  paddle.pos.x = evt.worldPos.x;
});
// end-snippet{mouse-move}

// start-snippet{create-ball}
// Create a ball at pos (100, 300) to start
const ball = new Actor({
  x: 100,
  y: 300,
  // Use a circle collider with radius 10
  radius: 10,
  // Set the color
  color: Color.Red,
});
// Start the serve after a second
const ballSpeed = vec(100, 100);
setTimeout(() => {
  // Set the velocity in pixels per second
  ball.vel = ballSpeed;
}, 1000);

// Set the collision Type to passive
// This means "tell me when I collide with an emitted event, but don't let excalibur do anything automatically"
ball.body.collisionType = CollisionType.Passive;
// Other possible collision types:
// "ex.CollisionType.PreventCollision - this means do not participate in any collision notification at all"
// "ex.CollisionType.Active - this means participate and let excalibur resolve the positions/velocities of actors after collision"
// "ex.CollisionType.Fixed - this means participate, but this object is unmovable"

// Add the ball to the current scene
game.add(ball);
// end-snippet{create-ball}

// start-snippet{screen-collision}
// Wire up to the postupdate event
ball.on("postupdate", () => {
  // If the ball collides with the left side
  // of the screen reverse the x velocity
  if (ball.pos.x < ball.width / 2) {
    ball.vel.x = ballSpeed.x;
  }

  // If the ball collides with the right side
  // of the screen reverse the x velocity
  if (ball.pos.x + ball.width / 2 > game.drawWidth) {
    ball.vel.x = ballSpeed.x * -1;
  }

  // If the ball collides with the top
  // of the screen reverse the y velocity
  if (ball.pos.y < ball.height / 2) {
    ball.vel.y = ballSpeed.y;
  }
});
// end-snippet{screen-collision}

// start-snippet{create-bricks}
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
  brick.body.collisionType = CollisionType.Active;

  // Add the brick to the current scene to be drawn
  game.add(brick);
});
// end-snippet{create-bricks}

// start-snippet{ball-brick-collision}
// On collision remove the brick, bounce the ball
let colliding = false;
ball.on("collisionstart", function (ev) {
  if (bricks.indexOf(ev.other) > -1) {
    // kill removes an actor from the current scene
    // therefore it will no longer be drawn or updated
    ev.other.kill();
  }

  // reverse course after any collision
  // intersections are the direction body A has to move to not be clipping body B
  // `ev.content.mtv` "minimum translation vector" is a vector `normalize()` will make the length of it 1
  // `negate()` flips the direction of the vector
  var intersection = ev.contact.mtv.normalize();

  // Only reverse direction when the collision starts
  // Object could be colliding for multiple frames
  if (!colliding) {
    colliding = true;
    // The largest component of intersection is our axis to flip
    if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
      ball.vel.x *= -1;
    } else {
      ball.vel.y *= -1;
    }
  }
});

ball.on("collisionend", () => {
  // ball has separated from whatever object it was colliding with
  colliding = false;
});

// end-snippet{ball-brick-collision}

// start-snippet{lose-condition}
// Loss condition
ball.on("exitviewport", () => {
  alert("You lose!");
});
// end-snippet{lose-condition}

// start-snippet{start-game}
// Start the engine to begin the game.
game.start();
// end-snippet{start-game}

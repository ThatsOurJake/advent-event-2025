// Game constants - will be set based on parent element
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
// Zone heights as percentages of total height (for 1:1 aspect ratio)
let DROP_ZONE_HEIGHT = 0;
let OBSTACLE_ZONE_HEIGHT = 0;
let CATCH_ZONE_HEIGHT = 0;

// Bumper pattern types
export const validBumperPatterns = ["wavy", "zigzag", "line", "semi"] as const;
export type BumperPattern = (typeof validBumperPatterns)[number];

// Current pattern (can be changed externally)
let currentPattern: BumperPattern = "wavy";

// Game events
export const GAME_EVENTS = {
  CAUGHT: "present-caught",
  MISSED: "present-missed",
};

export const loadGame = async () => {
  const Phaser = await import("phaser");

  // Game state
  let gameStarted = false;
  let inputEnabled = true;
  let fallingSquare: Phaser.GameObjects.Rectangle | null = null;
  let fallingSprite: Phaser.GameObjects.Image | null = null;
  let catcherSquare: Phaser.GameObjects.Rectangle | null = null;
  let catcherSprite: Phaser.GameObjects.Image | null = null;
  const bumpers: Phaser.GameObjects.Image[] = [];

  const preload: Phaser.Types.Scenes.ScenePreloadCallback = function () {
    const scene = this as Phaser.Scene;
    // Load catcher sprite
    scene.load.image("catcher", "/static/sleigh/catcher.png");
    // Load bumper sprite
    scene.load.image("bumper", "/static/sleigh/bumper.png");
    // Load present sprite
    scene.load.image("present", "/static/sleigh/present.png");
    // Load snowflake sprite
    scene.load.image("snowflake", "/static/sleigh/snowflake.png");
  };

  const create: Phaser.Types.Scenes.SceneCreateCallback = function () {
    const scene = this as Phaser.Scene;

    // Update dimensions based on parent element
    const parent = document.getElementById("game-wrapper");
    if (parent) {
      GAME_WIDTH = parent.clientWidth;
      GAME_HEIGHT = parent.clientHeight;
      scene.scale.resize(GAME_WIDTH, GAME_HEIGHT);

      // Calculate zone heights based on aspect ratio (1:1)
      // Drop zone: 13%, Obstacle zone: 67%, Catch zone: 20%
      DROP_ZONE_HEIGHT = Math.floor(GAME_HEIGHT * 0.13);
      OBSTACLE_ZONE_HEIGHT = Math.floor(GAME_HEIGHT * 0.67);
      CATCH_ZONE_HEIGHT = Math.floor(GAME_HEIGHT * 0.2);
    }

    // Enable physics
    scene.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw zone dividers (visual guides)
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0x1c274c, 0.3); // Use snowflake color with transparency

    // Drop zone bottom line
    graphics.lineBetween(0, DROP_ZONE_HEIGHT, GAME_WIDTH, DROP_ZONE_HEIGHT);

    // Obstacle zone bottom line
    graphics.lineBetween(
      0,
      DROP_ZONE_HEIGHT + OBSTACLE_ZONE_HEIGHT,
      GAME_WIDTH,
      DROP_ZONE_HEIGHT + OBSTACLE_ZONE_HEIGHT,
    );

    // Create falling snowflakes for Christmas atmosphere
    createSnowflakes(scene);

    // Create bumpers based on selected pattern
    createBumperPattern(scene, currentPattern);

    // Create catcher with image sprite and rectangular collision zone
    const catcherWidth = 80; // Total collision zone width (same as before)
    const catcherHeight = 20; // Total collision zone height (same as before)
    const catcherY =
      DROP_ZONE_HEIGHT + OBSTACLE_ZONE_HEIGHT + CATCH_ZONE_HEIGHT / 2;

    // Create invisible rectangle for collision detection
    catcherSquare = scene.add.rectangle(
      GAME_WIDTH / 2,
      catcherY,
      catcherWidth,
      catcherHeight,
      0x00ff00,
      0, // Fully transparent
    );
    scene.physics.add.existing(catcherSquare, true); // true = immovable

    // Create visible sprite centered on the collision zone
    catcherSprite = scene.add.image(GAME_WIDTH / 2, catcherY, "catcher");
    catcherSprite.setDisplaySize(64, 64); // Keep sprite at 64x64

    // Mouse/pointer movement for catcher
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (catcherSquare && catcherSprite && inputEnabled) {
        const newX = Phaser.Math.Clamp(
          pointer.x,
          catcherWidth / 2,
          GAME_WIDTH - catcherWidth / 2,
        );

        // Update both the collision rectangle and sprite
        catcherSquare.x = newX;
        catcherSprite.x = newX;

        // Update physics body position
        (
          catcherSquare.body as Phaser.Physics.Arcade.Body
        ).updateFromGameObject();
      }
    });

    // Listen for start game event
    scene.events.on("start-game", () => {
      startGame(scene);
    });
  };

  const update: Phaser.Types.Scenes.SceneUpdateCallback = function () {
    const scene = this as Phaser.Scene;

    if (!gameStarted || !fallingSquare || !fallingSprite) return;

    // Sync sprite position and rotation with physics body
    fallingSprite.x = fallingSquare.x;
    fallingSprite.y = fallingSquare.y;
    fallingSprite.rotation = fallingSquare.rotation;

    // Manual boundary checks for left, right, and top (allow falling through bottom)
    const body = fallingSquare.body as Phaser.Physics.Arcade.Body;
    const squareSize = 30;
    const halfSize = squareSize / 2;

    // Bounce off left wall
    if (fallingSquare.x - halfSize <= 0 && body.velocity.x < 0) {
      body.setVelocityX(-body.velocity.x * 0.8);
      fallingSquare.x = halfSize;
    }

    // Bounce off right wall
    if (fallingSquare.x + halfSize >= GAME_WIDTH && body.velocity.x > 0) {
      body.setVelocityX(-body.velocity.x * 0.8);
      fallingSquare.x = GAME_WIDTH - halfSize;
    }

    // Bounce off top wall
    if (fallingSquare.y - halfSize <= 0 && body.velocity.y < 0) {
      body.setVelocityY(-body.velocity.y * 0.8);
      fallingSquare.y = halfSize;
    }

    // Check if square has passed the catch zone (missed)
    // Trigger miss if present goes below the catch zone
    const catchZoneBottom =
      DROP_ZONE_HEIGHT + OBSTACLE_ZONE_HEIGHT + CATCH_ZONE_HEIGHT;
    if (fallingSquare.y > catchZoneBottom) {
      handleMissed(scene);
    }
  };

  function createSnowflakes(scene: Phaser.Scene) {
    // Create multiple snowflakes falling in the background
    const numSnowflakes = 30;

    for (let i = 0; i < numSnowflakes; i++) {
      // Random position across the width
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      // Random starting position in height (spread them out initially)
      const y = Phaser.Math.Between(-GAME_HEIGHT, 0);

      const snowflake = scene.add.image(x, y, "snowflake");
      const size = Phaser.Math.Between(8, 16); // Random sizes for depth
      snowflake.setDisplaySize(size, size);
      snowflake.setAlpha(0.6); // Semi-transparent
      snowflake.setDepth(-1); // Behind everything else

      // Animate the snowflake falling
      const fallDuration = Phaser.Math.Between(8000, 15000); // 8-15 seconds
      const horizontalDrift = Phaser.Math.Between(-30, 30); // Slight horizontal movement

      scene.tweens.add({
        targets: snowflake,
        y: GAME_HEIGHT + 50,
        x: x + horizontalDrift,
        duration: fallDuration,
        ease: "Linear",
        repeat: -1, // Infinite loop
        onRepeat: () => {
          // Reset to top with new random position
          snowflake.x = Phaser.Math.Between(0, GAME_WIDTH);
          snowflake.y = -20;
        },
      });

      // Add gentle rotation
      scene.tweens.add({
        targets: snowflake,
        rotation: Phaser.Math.FloatBetween(-Math.PI * 2, Math.PI * 2),
        duration: Phaser.Math.Between(5000, 10000),
        ease: "Linear",
        repeat: -1,
        yoyo: true,
      });
    }
  }

  function createBumperPattern(scene: Phaser.Scene, pattern: BumperPattern) {
    // Clear existing bumpers
    for (const bumper of bumpers) {
      bumper.destroy();
    }
    bumpers.length = 0;

    const bumperRadius = 20;
    const obstacleZoneTop = DROP_ZONE_HEIGHT;
    const obstacleZoneBottom = DROP_ZONE_HEIGHT + OBSTACLE_ZONE_HEIGHT;
    const zoneHeight = obstacleZoneBottom - obstacleZoneTop;

    switch (pattern) {
      case "wavy": {
        // Continuous sine wave following both x and y within obstacle zone
        const amplitude = zoneHeight / 2.5; // Vertical wave amplitude
        const frequency = 2.5; // Number of wave cycles across width
        const centerY = obstacleZoneTop + zoneHeight / 2;
        const minSpacing = bumperRadius * 2.5; // Minimum distance between bumpers

        let lastX = -minSpacing;
        let lastY = centerY;
        let i = 0;
        const maxIterations = 100; // Safety limit

        while (i < maxIterations) {
          const t = i / maxIterations;
          const x = t * GAME_WIDTH;
          const offset = Math.sin(t * Math.PI * 2 * frequency) * amplitude;
          const y = centerY + offset;

          // Calculate distance from last bumper
          const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);

          // Only add if far enough from last bumper and within bounds
          if (distance >= minSpacing) {
            if (
              x > bumperRadius &&
              x < GAME_WIDTH - bumperRadius &&
              y > obstacleZoneTop + bumperRadius &&
              y < obstacleZoneBottom - bumperRadius
            ) {
              const bumper = scene.add.image(x, y, "bumper");
              bumper.setDisplaySize(bumperRadius * 2, bumperRadius * 2); // 40x40 to match circle
              bumper.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2)); // Random rotation
              scene.physics.add.existing(bumper, true);
              bumpers.push(bumper);
              lastX = x;
              lastY = y;
            }
          }

          i++;
        }
        break;
      }

      case "zigzag": {
        // "WWW" pattern - three rows forming W shapes
        const rows = 3;
        const numWs = 3; // Number of W shapes
        const pointsPerW = 5; // 5 points make a W: \/ \/
        const minSpacing = bumperRadius * 2.2; // Minimum distance between bumpers
        const placedBumpers: { x: number; y: number }[] = [];

        for (let w = 0; w < numWs; w++) {
          const wWidth = GAME_WIDTH / numWs;
          const wStart = w * wWidth;

          for (let point = 0; point < pointsPerW; point++) {
            // Determine row based on W pattern: down, up, down, up, down
            let rowIndex: number;
            if (point === 0 || point === 4) {
              rowIndex = 0; // Top row
            } else if (point === 2) {
              rowIndex = 0; // Middle peak (top row)
            } else {
              rowIndex = rows - 1; // Bottom row (valleys)
            }

            const y =
              obstacleZoneTop + (zoneHeight / (rows + 1)) * (rowIndex + 1);
            const x = wStart + (wWidth / (pointsPerW - 1)) * point;

            // Check if this position is too close to any existing bumper
            let tooClose = false;
            for (const placed of placedBumpers) {
              const distance = Math.sqrt(
                (x - placed.x) ** 2 + (y - placed.y) ** 2,
              );
              if (distance < minSpacing) {
                tooClose = true;
                break;
              }
            }

            if (
              !tooClose &&
              x > bumperRadius &&
              x < GAME_WIDTH - bumperRadius
            ) {
              const bumper = scene.add.image(x, y, "bumper");
              bumper.setDisplaySize(bumperRadius * 2, bumperRadius * 2); // 40x40 to match circle
              bumper.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2)); // Random rotation
              scene.physics.add.existing(bumper, true);
              bumpers.push(bumper);
              placedBumpers.push({ x, y });
            }
          }
        }
        break;
      }

      case "line": {
        // Three rows with middle row shorter and centered
        const rows = 3;
        const bumpersPerRow = [7, 5, 7]; // Top, middle, bottom

        for (let row = 0; row < rows; row++) {
          const y = obstacleZoneTop + (zoneHeight / (rows + 1)) * (row + 1);
          const numBumpers = bumpersPerRow[row];
          const horizontalSpacing = GAME_WIDTH / (numBumpers + 1);

          for (let i = 0; i < numBumpers; i++) {
            const x = horizontalSpacing * (i + 1);
            const bumper = scene.add.image(x, y, "bumper");
            bumper.setDisplaySize(bumperRadius * 2, bumperRadius * 2); // 40x40 to match circle
            bumper.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2)); // Random rotation
            scene.physics.add.existing(bumper, true);
            bumpers.push(bumper);
          }
        }
        break;
      }

      case "semi": {
        // Semi-circle pattern (cup shape - bottom half of circle)
        const totalBumpers = 14;
        const centerX = GAME_WIDTH / 2;
        const centerY = obstacleZoneTop + bumperRadius + 40; // Position near top
        const radius = Math.min(GAME_WIDTH / 2.5, zoneHeight / 1.5);

        for (let i = 0; i < totalBumpers; i++) {
          // Angle from 0 to PI (bottom half of circle, like a cup)
          const angle = (i / (totalBumpers - 1)) * Math.PI;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius; // Positive sin for bottom half

          if (
            y > obstacleZoneTop + bumperRadius &&
            y < obstacleZoneBottom - bumperRadius &&
            x > bumperRadius &&
            x < GAME_WIDTH - bumperRadius
          ) {
            const bumper = scene.add.image(x, y, "bumper");
            bumper.setDisplaySize(bumperRadius * 2, bumperRadius * 2); // 40x40 to match circle
            bumper.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2)); // Random rotation
            scene.physics.add.existing(bumper, true);
            bumpers.push(bumper);
          }
        }
        break;
      }
    }
  }

  function startGame(scene: Phaser.Scene) {
    if (gameStarted && fallingSquare) {
      // Clean up existing falling square if game is restarted
      fallingSquare.destroy();
      if (fallingSprite) {
        fallingSprite.destroy();
      }
    }

    gameStarted = true;
    inputEnabled = true; // Re-enable input when game starts

    // Create falling square at random x position in drop zone
    const squareSize = 30;
    const randomX = Phaser.Math.Between(
      squareSize / 2 + 10,
      GAME_WIDTH - squareSize / 2 - 10,
    );

    // Create invisible rectangle for physics
    fallingSquare = scene.add.rectangle(
      randomX,
      50,
      squareSize,
      squareSize,
      0xffff00,
      0,
    );
    scene.physics.add.existing(fallingSquare);

    // Create visible sprite
    fallingSprite = scene.add.image(randomX, 50, "present");
    fallingSprite.setDisplaySize(squareSize, squareSize); // Match the physics body size

    const body = fallingSquare.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 200); // Initial downward velocity
    body.setBounce(0.8, 0.8); // Bounce on collision

    // Don't collide with world bounds - we'll handle left/right/top manually in update
    body.setCollideWorldBounds(false);

    // Add collision with bumpers
    bumpers.forEach((bumper) => {
      scene.physics.add.collider(
        fallingSquare as Phaser.GameObjects.Rectangle,
        bumper,
        (_, bumperObj) => {
          // Apply random horizontal force on bumper collision
          const horizontalForce = Phaser.Math.Between(-150, 150);
          const body = (fallingSquare as Phaser.GameObjects.Rectangle)
            .body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(body.velocity.x + horizontalForce);

          // Add rotation based on horizontal velocity direction
          const rotationSpeed = body.velocity.x * 0.01; // Rotate based on horizontal speed
          body.setAngularVelocity(rotationSpeed * 100);

          // Destroy the bumper after collision
          const bumperGameObject = bumperObj as Phaser.GameObjects.Image;
          bumperGameObject.destroy();

          // Remove from bumpers array
          const index = bumpers.indexOf(bumperGameObject);
          if (index > -1) {
            bumpers.splice(index, 1);
          }
        },
      );
    });

    // Add overlap detection with catcher
    scene.physics.add.overlap(
      fallingSquare,
      catcherSquare as Phaser.GameObjects.Rectangle,
      () => {
        handleCaught(scene);
      },
    );
  }

  function handleCaught(scene: Phaser.Scene) {
    if (!fallingSquare) return;

    gameStarted = false;
    inputEnabled = false; // Disable input when game ends
    fallingSquare.destroy();
    fallingSquare = null;

    if (fallingSprite) {
      fallingSprite.destroy();
      fallingSprite = null;
    }

    // Emit caught event for external handling
    scene.events.emit(GAME_EVENTS.CAUGHT);

    // Dispatch custom event to window for external listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(GAME_EVENTS.CAUGHT));
    }
  }

  function handleMissed(scene: Phaser.Scene) {
    if (!fallingSquare) return;

    gameStarted = false;
    inputEnabled = false; // Disable input when game ends
    fallingSquare.destroy();
    fallingSquare = null;

    if (fallingSprite) {
      fallingSprite.destroy();
      fallingSprite = null;
    }

    // Emit missed event for external handling
    scene.events.emit(GAME_EVENTS.MISSED);

    // Dispatch custom event to window for external listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(GAME_EVENTS.MISSED));
    }
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false, // Set to true to see physics bodies
      },
    },
    scene: {
      preload,
      create,
      update,
    },
    parent: "game-wrapper",
    backgroundColor: "#e8f3ff", // Light complementary color for snowflake #1c274c
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  const game = new Phaser.Game(config);

  // Export function to start the game from external button
  const startGameExternal = () => {
    const scene = game.scene.scenes[0];
    if (scene) {
      scene.events.emit("start-game");
    }
  };

  // Export function to set bumper pattern
  const setBumperPattern = (pattern: BumperPattern) => {
    currentPattern = pattern;
    const scene = game.scene.scenes[0];
    if (scene?.scene.isActive()) {
      createBumperPattern(scene, pattern);
    }
  };

  // Export function to destroy the game (for cleanup on component unmount)
  const destroyGame = () => {
    if (game) {
      game.destroy(true); // true = remove canvas element
    }
  };

  return {
    game,
    startGameExternal,
    setBumperPattern,
    destroyGame,
  };
};

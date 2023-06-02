import React, { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import kaboom from 'kaboom';
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const MOVE_SPEED = 150;

const Game = () => {
  const canvasRef = React.useRef(null);

  const { address } = useAccount();

  const { data: totalCounter, isLoading: isCounterLoading } = useScaffoldContractRead({
    contractName: "Game",
    functionName: "points",
  });

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Game",
    functionName: "earnPoint",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  useEffect(() => {
    if(totalCounter) {
      startGame();
    }
  }, [totalCounter]);

  const startGame = () => {
    const k = kaboom({
      // if you don't want to import to the global namespace
      global: false,
      // if you don't want kaboom to create a canvas and insert under document.body
      canvas: canvasRef.current,
    })

    k.loadSprite("player", "assets/Player.png");
    k.loadSprite("ethereum", "assets/ethereum.png");
    k.loadSprite("wall40x40", "assets/wall40x40.png");

    k.add([
      k.text(totalCounter),
      k.pos(40, 20),
    ])

    k.addLevel([
      `  xxx          x     `,
      `  x   xxxx  x    x   `,
      `     x               `,
      `  x   x    e  x xx   `,
      `  xxx          x     `,
      `  x   xxxx  x    x   `,
      `  x   x    e  x xx   `,
      `  xxx          x     `,
      `  x   xxxx  x    x   `,
      `     x               `,
      `  x   x    e  x xx     `
    ], {
      tileWidth: 40,
      tileHeight: 40,
      tiles: {
        "x": () => [
          k.sprite("wall40x40"),
          k.area(),
          k.body(),
        ],
        "e": () => [
            k.sprite("ethereum"),
            k.area(),
            k.body(),
            'ethereum',
        ]
      },
    });

    const player = k.add([
      k.sprite("player"),
      k.pos(100, 100),
      k.area(),
      k.body(),
      'player',
    ]);

    // Control the player with arrow keys
    k.onKeyDown('left', () => {
      player.move(-MOVE_SPEED, 0);
    });
    k.onKeyDown('right', () => {
      player.move(MOVE_SPEED, 0);
    });
    k.onKeyDown('up', () => {
      player.move(0, -MOVE_SPEED);
    });
    k.onKeyDown('down', () => {
      player.move(0, MOVE_SPEED);
    });

    player.onCollide("ethereum", (ethereum) => {
      k.destroy(ethereum);
      writeAsync();
    })
  }

  return (
    <div className='game'>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default Game;

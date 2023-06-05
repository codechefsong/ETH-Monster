import React, { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import kaboom from 'kaboom';
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const MOVE_SPEED = 150;

const Game = () => {
  const canvasRef = React.useRef(null);

  const { address } = useAccount();

  const { data: totalCounter, isLoading: isCounterLoading } = useScaffoldContractRead({
    contractName: "Game",
    functionName: "points",
  });

  const { data: nums, isLoading: isNumsLoading } = useScaffoldContractRead({
    contractName: "Game",
    functionName: "getNums",
  });

  const { data: isPay, isLoading: isPayLoading } = useScaffoldContractRead({
    contractName: "Game",
    functionName: "isPay",
    args: [address]
  });

  useScaffoldEventSubscriber({
    contractName: "Game",
    eventName: "Result",
    listener: (player, num, isWinner) => {
      console.log(player, num, isWinner);
      if (isWinner) notification.error(`${num}: You Won`);
      else notification.error(`${num}: You Lose`);
    },
  });

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Game",
    functionName: "earnPoint",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: payGame, isLoading: payGameLoading } = useScaffoldContractWrite({
    contractName: "Game",
    functionName: "playGame",
    value: "0.001",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  useEffect(() => {
    if(isPay) {
      startGame();
    }
  }, [isPay]);

  const startGame = () => {
    const k = kaboom({
      // if you don't want to import to the global namespace
      global: false,
      // if you don't want kaboom to create a canvas and insert under document.body
      canvas: canvasRef.current,
      background: [ 0, 204, 153 ]
    })

    k.loadSprite("player", "assets/Player.png");
    k.loadSprite("ethereum", "assets/ethereum.png");
    k.loadSprite("wall40x40", "assets/wall40x40.png");

    k.add([
      k.text(totalCounter),
      k.pos(40, 20),
    ])

    k.addLevel([
      `  xxx          x      `,
      `  x   xxxx  x    x    `,
      `    e x               `,
      `  x   x    e  x  xx   `,
      `    xx          x     `,
      `  x   xxxx  x     x   `,
      `  x   x    e   x xx   `,
      `  xxx            x    `,
      `  x   xxxx  x    x    `,
      `   e  x            e  `,
      `  x   x    e  x xx     `
    ], {
      tileWidth: 50,
      tileHeight: 50,
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
    <div>
      <h1 className='text-3xl text-center mt-5'>Find the real ETH to win a 0.01 ETH</h1>
      <div className='center'>
        {!isPay && <button className='py-2 px-4 mb-1 mt-3 bg-green-500 rounded baseline hover:bg-green-300 disabled:opacity-50' onClick={()=> payGame()}>
          Pay 0.001 ETH
        </button>}
      </div>
      <div className='center'>
        <div className='game'>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Game;

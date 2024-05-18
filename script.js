window.onload = () => {
    game.init();
}

class Game {
    framerate = 60;
    currentFrame = 0; // aktualna klatka
    framesMax = 4; // max klatek
    playerFrameWidth = 160; // szerokosc 1 klatki gracza 
    playerFrameHeight = 90; // wysokosc 1 klatki gracza
    drawPosX = 0;
    drawPosY = 700 - this.playerFrameHeight;
    playerX = 50; // pozycja gracza na osi X
    jumpStrength = 0;
    isJumping = false;
    obstacles = [];
    obstaclesGap = 200;
    obstacleSpeed = 20;
    gravity = 2;
    score = 0;
    gameOver = false;

    init = () => {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image();
        this.background.src = "background.png";

        this.player = new Image();
        this.player.src = "player.png";

        this.obstacle = new Image();
        this.obstacle.src = "fence.png";

        this.ctx.drawImage(this.background, 0, 0);
        this.setControls();
        this.startGame();
    };


    setControls = () => {
        document.addEventListener("click", this.playerJump);
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                this.playerJump();
            }
        });
    }

    startGame = () => {
        setInterval(this.updateGame, this.framerate);
        this.addObstacles();
    };

    updateGame = () => {
        this.isOver();
        if (!this.gameOver) {
            this.drawPlayer();
            this.drawObstacles();
            this.checkCollision();
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 85, 25);
        }
    }

    playerJump = () => {
        if (!this.isJumping) {
            this.jumpStrength = -35;
            return;
        }
    };

    drawPlayer = () => {
        this.clearCanvas();
        this.ctx.drawImage(this.background, 0, 0);
        if (this.drawPosX > this.canvas.width) {
            this.currentFrame = 0;
            this.drawPosX = 0;
        }

        if (this.currentFrame > this.framesMax - 1) {
            this.currentFrame = 0;
        }
        this.currentFrame++;
        let cutX = 0;
        if (!this.isJumping) {
            cutX = (this.currentFrame - 1) * this.playerFrameWidth;
        }
        this.jumpStrength += this.gravity;
        this.drawPosY = Math.min(this.drawPosY + this.jumpStrength, this.canvas.height - this.playerFrameHeight);
        if (this.drawPosY != 475) {
            this.isJumping = true;
        }
        else {
            this.isJumping = false;
        }
        this.drawPosX += this.framesMax;
        this.ctx.drawImage(this.player, cutX, 0, this.playerFrameWidth, this.playerFrameHeight, this.playerX, this.drawPosY, this.playerFrameWidth, this.playerFrameHeight);
    };

    addObstacles = () => {
        let x = this.canvas.width - 10;
        let y = 500;

        this.obstacles.push({
            img: this.obstacle,
            x: x,
            y: y,
            width: this.obstacle.width,
            height: this.obstacle.height
        });
    }

    drawObstacles = () => {
        const obstaclesToDraw = [...this.obstacles];

        obstaclesToDraw.forEach(obstacle => {
            this.ctx.drawImage(obstacle.img, obstacle.x, this.canvas.height - this.obstacle.height);
            obstacle.x -= this.obstacleSpeed;

            if (obstacle.x == 50) {
                this.addObstacles();
            }

            if (obstacle.x + obstacle.width < - 100) {
                this.obstacles.shift();
            }
        });
    }

    checkCollision = () => {
        const obstaclesToCheck = [...this.obstacles];
        obstaclesToCheck.forEach(obstacle => {
            if (obstacle.x == this.playerX + this.playerFrameWidth / 2) {
                this.score++;
            }
            if (this.playerX + this.playerFrameWidth / 1.5 > obstacle.x && this.playerX <= obstacle.x + obstacle.width) {
                if (this.drawPosY >= obstacle.y - obstacle.height / 1.5) {
                    this.gameOver = true;
                }
                else {
                    this.gameOver = false;
                }
            }
        })
    };

    clearCanvas = () => {
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };


    isOver = () => {
        if (this.gameOver) {
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.2, this.canvas.height / 2 - 15);
            this.ctx.fillText("Press any key to restart", this.canvas.width / 2.75, this.canvas.height / 2 + 10);
            document.addEventListener("keypress", this.restartGame);
            document.addEventListener("click", this.restartGame);
        }
    }

    restartGame = () => {
        this.score = 0;
        this.drawPosX = 0;
        this.drawPosY = 700;
        this.obstacles = [];
        this.addObstacles();
        this.gameOver = false;
        document.removeEventListener("keypress", this.restartGame);
        document.removeEventListener("click", this.restartGame);
    }
}

const game = new Game();
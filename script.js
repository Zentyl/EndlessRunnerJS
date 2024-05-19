window.onload = () => { // uruchomienie gry przy załadowaniu okna strony
    game.init();
}

class Game { // klasa gry
    currentFrame = 0; // aktualna klatka
    framesMax = 4; // max klatek
    playerFrameWidth = 160; // szerokość 1 klatki gracza 
    playerFrameHeight = 90; // wysokość 1 klatki gracza
    drawPosX = 0;
    playerX = 50; // pozycja gracza na osi X
    playerY = 700 - this.playerFrameHeight; // pozycja gracza na osi Y
    jumpStrength = 0; // siła skoku
    isJumping = false; // zmienna sprawdzająca czy postać gracza jest w powietrzu
    backgrounds = []
    backgroundSpeed = 20; // prędkość przesuwania się tła
    obstacles = [];
    obstacleSpeed = 15; // prędkość poruszania się przeszkod w strone gracza
    gravity = 2; // sila przyciągania gracza do podloza
    score = 0; // punkty
    isStarted = false; // zmienna sprawdzająca czy gra zostala rozpoczęta
    isOver = false; // zmienna sprawdzająca czy gra zostala skończona
    isMusic = false;

    init = () => { // konstruktor
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image();
        this.background.src = "/img/background.png"; // tło

        this.player = new Image();
        this.player.src = "/img/player.png"; // postać gracza

        this.obstacle = new Image();
        this.obstacle.src = "/img/fence.png"; // przeszkoda

        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

        this.backgrounds.push({ // tworzenie pierwszej grafiki tła
            img: this.background,
            x: x1,
            y: y1,
            width: this.background.width,
            height: this.background.height
        });

        this.setControls();
        this.startGame();
    };

    setControls = () => { // ustawienie sterowania
        document.addEventListener("click", this.playerJump);
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                this.playerJump();
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                this.restartGame();
            }
        });
    }

    startGame = () => {  // rozpoczęcie gry
        // ustawienie częstotliwości wyswietlania klatek
        let framerate = 30;
        let now;
        let then = Date.now();
        let delta = 0;
        let interval = 1000 / framerate;

        const update = () => {
            requestAnimationFrame(update);
            now = Date.now();
            delta = now - then;

            if (delta > interval) {
                this.updateGame();
                this.titleScreen(); // wyswietlanie ekranu tytulowego
                then = now - (delta % interval);
            }
        }
        update();
        console.log(this.obstacleSpeed);
        this.addBackgrounds();
        this.addObstacles();
    }

    updateGame = () => { // aktualizowanie gry
        this.gameOver();
        if (!this.isOver) {
            this.drawBackgrounds();
            this.drawPlayer();
            this.drawObstacles();
            this.checkCollision();
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 80, 55);
        }
    }

    titleScreen = () => { // ekran tytułowy gry
        if (!this.isStarted) { // wyświetlanie ekranu tytułowego dopóki gracz nie wciśnie Enter
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Press Enter to start", this.canvas.width / 2.5, this.canvas.height / 2 - 37);
        }
    }

    drawPlayer = () => { // rysowanie postaci gracza oraz jej fizyka
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
            cutX = (this.currentFrame - 1) * this.playerFrameWidth; // wyswietlanie klatki skoku podczas skakania
        }
        this.jumpStrength += this.gravity; // zmniejszanie siły skoku przez przyciąganie grawitacyjne
        // zabezpieczenie aby postać gracza nie wpadła pod podloge
        this.playerY = Math.min(this.playerY + this.jumpStrength, this.canvas.height - this.playerFrameHeight);
        if (this.playerY != 475) { // uniemożliwienie skoku w powietrzu
            this.isJumping = true;
        }
        else {
            this.isJumping = false;
        }
        this.drawPosX += this.framesMax;
        // rysowanie postaci gracza
        this.ctx.drawImage(this.player, cutX, 0, this.playerFrameWidth, this.playerFrameHeight, this.playerX, this.playerY, this.playerFrameWidth, this.playerFrameHeight);
    };

    playerJump = () => { // skok gracza
        if (!this.isJumping) {
            this.playSoundJump();
            this.jumpStrength = -35;
            return;
        }
    };

    addBackgrounds = () => { // tworzenie tła
        let x = this.canvas.width;
        let y = this.canvas.height - this.background.height;

        this.backgrounds.push({ // tablica z tłami
            img: this.background,
            x: x,
            y: y,
            width: this.background.width,
            height: this.background.height
        });
    }

    drawBackgrounds = () => { // rysowanie tła
        this.clearCanvas();
        const backgroundsToDraw = [...this.backgrounds]; // tła oczekujące na narysowanie

        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // rysowanie tła
            background.x -= this.backgroundSpeed;

            if (background.x == - 1000) {
                this.addBackgrounds(); // dodawanie tła do tablicy
            }

            if (background.x + background.width < - 565) {
                this.backgrounds.shift(); // usuwanie tła z tablicy
            }
        });
    }

    addObstacles = () => { // tworzenie przeszkod
        let x = this.canvas.width - 10;
        let y = this.canvas.height - this.obstacle.height;

        this.obstacles.push({ // tablica z przeszkodami
            img: this.obstacle,
            x: x,
            y: y,
            width: this.obstacle.width,
            height: this.obstacle.height
        });
    }

    drawObstacles = () => { // rysowanie przeszkód
        const obstaclesToDraw = [...this.obstacles]; // przeszkody oczekujace na narysowanie

        obstaclesToDraw.forEach(obstacle => {
            console.log(obstacle.x);
            this.ctx.drawImage(obstacle.img, obstacle.x, obstacle.y); // rysowanie przeszkód
            obstacle.x -= this.obstacleSpeed;

            if (obstacle.x == 50) {
                this.addObstacles(); // dodawanie przeszkód do tablicy
            }

            if (obstacle.x + obstacle.width < - 100) {
                this.obstacles.shift(); // usuwanie przeszkód z tablicy
            }
        });
    }

    checkCollision = () => { // sprawdzanie kolizji przeszkody z graczem
        const obstaclesToCheck = [...this.obstacles]; // przeszkody oczekujace na sprawdzenie kolizji
        obstaclesToCheck.forEach(obstacle => {
            if (obstacle.x == this.playerX) {
                this.score++; // jeśli gracz przeskoczył przeszkodę dodaj punkt
                if (this.score % 15 == 0) { // zwiększ prędkość ruchu przeszkód gdy ilość zdobytych punktow to wielokrotność 15
                    if (this.obstacleSpeed == 15) {
                        this.obstacleSpeed = 20;
                    }
                    else {
                        this.obstacleSpeed += 4;
                    }

                }
            }
            // warunek sprawdzajacy czy przeszkoda nie dotknęła gracza
            if (this.playerX + this.playerFrameWidth / 1.5 > obstacle.x && this.playerX <= obstacle.x + obstacle.width) {
                if (this.playerY >= obstacle.y) {
                    this.isOver = true; // warunek zakonczenia gry
                    this.playSoundHit();
                }
                else {
                    this.isOver = false;
                }
            }
        })
    };

    gameOver = () => { // funkcja kończąca grę
        if (this.isOver) {
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            // wyswietlanie komunikatu końcowego
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.5, this.canvas.height / 2 - 55);
            this.ctx.fillText("Press Enter to restart", this.canvas.width / 2.5, this.canvas.height / 2 - 25);
        }
    }

    clearCanvas = () => { // czyszczenie canvy
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    restartGame = () => { // restartowanie gry
        if (!this.isMusic) { // jeśli nie gra muzyka, uruchom muzykę
            this.playMusic();
        }
        this.isStarted = true;
        this.score = 0;
        this.drawPosX = 0;
        this.playerY = 700;
        this.backgrounds = [];
        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

        this.backgrounds.push({ // pierwsza grafika tła
            img: this.background,
            x: x1,
            y: y1,
            width: this.background.width,
            height: this.background.height
        });
        this.obstacles = [];
        this.addBackgrounds();
        this.addObstacles();
        this.isOver = false;
        this.obstacleSpeed = 15;
    }

    playSoundJump = () => { // włącz dźwięk skoku
        let soundJump = new Audio();
        soundJump.src = "/audio/jump.mp3";
        soundJump.play();
    }

    playSoundHit = () => { // włącz dźwięk uderzenia gracza w przeszkode
        let soundHit = new Audio();
        soundHit.src = "/audio/hit.mp3";
        soundHit.play();
    }

    playMusic = () => { // uruchom muzykę
        let music = new Audio();
        music.src = "/audio/music.mp3";
        music.addEventListener("ended", function () { // jeśli muzyka się skończyła, uruchom ją ponownie
            music.currentTime = 0;
            this.isMusic = false;
            music.play();
        });
        music.play();
        this.isMusic = true; // muzyka jest uruchomiona
    }
}

const game = new Game(); // utworzenie obiektu gry

// Źródła grafik i muzyki:
// https://pop-shop-packs.itch.io/cats-pixel-asset-pack
// https://www.deviantart.com/etherealdragon/art/Fence-Tile-388637295
// https://free-game-assets.itch.io/free-summer-pixel-art-backgrounds
// https://incompetech.com/music/royalty-free/music.html
// https://pixabay.com/sound-effects/cat-call-meow-102607
// https://freesound.org/people/steffcaffrey/sounds/262313
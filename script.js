window.onload = () => {
    game.init();
}

class Game {
    currentFrame = 0; // aktualna klatka
    framesMax = 4; // max klatek
    playerFrameWidth = 160; // szerokosc 1 klatki gracza 
    playerFrameHeight = 90; // wysokosc 1 klatki gracza
    drawPosX = 0;
    playerX = 50; // pozycja gracza na osi X
    playerY = 700 - this.playerFrameHeight; // pozycja gracza na osi Y
    jumpStrength = 0; // sila skoku
    isJumping = false; // zmienna sprawdzajaca czy postac gracza jest w powietrzu
    backgrounds = []
    backgroundSpeed = 20; // predkosc przesuwania sie tla
    obstacles = [];
    obstacleSpeed = this.backgroundSpeed; // predkosc poruszania sie przeszkod w strone gracza
    gravity = 2; // sila przyciagania gracza do podloza
    score = 0; // punkty
    isStarted = false; // zmienna sprawdzajaca czy gra zostala rozpoczeta
    isOver = false; // zmienna sprawdzajaca czy gra zostala skonczona

    init = () => { // konstruktor
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image();
        this.background.src = "/img/background.png"; // tlo

        this.player = new Image();
        this.player.src = "/img/player.png"; // postac gracza

        this.obstacle = new Image();
        this.obstacle.src = "/img/fence.png"; // przeszkoda

        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

        this.backgrounds.push({ // tworzenie pierwszej grafiki tla
            img: this.background,
            x: x1,
            y: y1,
            width: this.background.width,
            height: this.background.height
        });

        this.setControls();
        this.startGame();
    };


    titleScreen = () => { // ekran tytulowy gry
        if (!this.isStarted) { // wyswietlanie ekranu tytulowego dopoki gracz nie wcisnie R
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Press R to start", this.canvas.width / 2.5, this.canvas.height / 2 - 37);
        }
    }

    setControls = () => { // ustawienie sterowania
        document.addEventListener("click", this.playerJump);
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                this.playerJump();
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key == "r") {
                this.restartGame();
            }
        });
    }

    startGame = () => {  // rozpoczecie gry
        // ustawienie czestotliwosci wyswietlania klatek
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
            this.ctx.fillText("Score: " + this.score, 80, 30);
        }
    }

    playerJump = () => { // skok gracza
        if (!this.isJumping) {
            this.jumpStrength = -35;
            return;
        }
    };

    drawPlayer = () => { // rysowanie postaci gracza oraz jej fizyka
        // this.ctx.drawImage(this.background, 0, 0);

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
        this.jumpStrength += this.gravity; // zmniejszanie sily skoku przez przyciaganie grawitacyjne
        // zabezpieczenie aby postac gracza nie wpadla pod podloge
        this.playerY = Math.min(this.playerY + this.jumpStrength, this.canvas.height - this.playerFrameHeight);
        if (this.playerY != 475) { // uniemozliwienie skoku w powietrzu
            this.isJumping = true;
        }
        else {
            this.isJumping = false;
        }
        this.drawPosX += this.framesMax;
        // rysowanie postaci gracza
        this.ctx.drawImage(this.player, cutX, 0, this.playerFrameWidth, this.playerFrameHeight, this.playerX, this.playerY, this.playerFrameWidth, this.playerFrameHeight);
    };

    addBackgrounds = () => { // tworzenie tla
        let x = this.canvas.width;
        let y = this.canvas.height - this.background.height;

        this.backgrounds.push({ // tablica z tlami
            img: this.background,
            x: x,
            y: y,
            width: this.background.width,
            height: this.background.height
        });
    }

    drawBackgrounds = () => { // rysowanie tla
        this.clearCanvas();
        const backgroundsToDraw = [...this.backgrounds]; // tla oczekujace na narysowanie

        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // rysowanie tla
            background.x -= this.backgroundSpeed;

            if (background.x == - 1000) {
                this.addBackgrounds(); // dodawanie tla do tablicy
            }

            if (background.x + background.width < - 565) {
                this.backgrounds.shift(); // usuwanie tla z tablicy
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

    drawObstacles = () => { // rysowanie przeszkod

        const obstaclesToDraw = [...this.obstacles]; // przeszkody oczekujace na narysowanie

        obstaclesToDraw.forEach(obstacle => {
            this.ctx.drawImage(obstacle.img, obstacle.x, obstacle.y); // rysowanie przeszkod
            obstacle.x -= this.obstacleSpeed;

            if (obstacle.x == 50) {
                this.addObstacles(); // dodawanie przeszkod do tablicy
            }

            if (obstacle.x + obstacle.width < - 100) {
                this.obstacles.shift(); // usuwanie przeszkod z tablicy
            }
        });
    }

    checkCollision = () => { // sprawdzanie kolizji przeszkody z graczem
        const obstaclesToCheck = [...this.obstacles]; // przeszkody oczekujace na sprawdzenie kolizji
        obstaclesToCheck.forEach(obstacle => {
            if (obstacle.x == this.playerX + this.playerFrameWidth / 2) { // jesli gracz przeskoczyl przeszkode dodaj punkt
                this.score++;
            }
            // warunek sprawdzajacy czy przeszkoda nie dotknela gracza
            if (this.playerX + this.playerFrameWidth / 1.5 > obstacle.x && this.playerX <= obstacle.x + obstacle.width) {
                if (this.playerY >= obstacle.y) {
                    this.isOver = true; // warunek zakonczenia gry 
                }
                else {
                    this.isOver = false;
                }
            }
        })
    };

    clearCanvas = () => { // czyszczenie canvy
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };


    gameOver = () => { // funkcja konczaca gre 
        if (this.isOver) {
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            // wyswietlanie komunikatu koncowego
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.2, this.canvas.height / 2 - 55);
            this.ctx.fillText("Press R to restart", this.canvas.width / 2.5, this.canvas.height / 2 - 25);
        }
    }

    restartGame = () => { // resetowanie gry
        this.isStarted = true;
        this.score = 0;
        this.drawPosX = 0;
        this.playerY = 700;
        this.backgrounds = [];
        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

        this.backgrounds.push({ // pierwsza grafika tla
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
    }
}

const game = new Game();
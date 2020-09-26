const result = document.querySelector(".gameResult");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const [netWidth, netHeight] = [4, canvas.height];
const [paddleHeight, paddleWidth] = [70, 10];
let [upArrowKey, downArrowKey] = [false, false];

//Game reset button listener
document.querySelector('.gameReset').addEventListener('click', gameReset);

//Game sound
const hitSound = new Audio('../sounds/hitSound.wav');
const scoreSound = new Audio('../sounds/scoreSound.wav');
const wallHitSound = new Audio('../sounds/wallHitSound.wav');

//Net configuration
const net = {
    x: canvas.width / 2 - netWidth / 2,
    y: 0,
    width: netWidth,
    height: netHeight,
    color: "#ffffff"
};

// user paddle
const user = {
    x: 10,
    y: (canvas.height / 2) - (paddleHeight / 2),
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: 0
};

//Ai paddle
const ai = {
    x: canvas.width - (paddleWidth + 10),
    y: (canvas.height / 2) - (paddleHeight / 2),
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: 0
};

// ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
    color: '#05EDFF'
};

//Function to draw net color
const netColor = () => {
    ctx.fillStyle = net.color;
    ctx.fillRect(net.x, net.y, net.width, net.height);

}

const gameScore = (x, y, score) => {
    ctx.fillStyle = "#fff";
    ctx.font = "35px sans-serif"; //Should be changed with Google fonts
    ctx.fillText(score, x, y);

}

const drawPaddle = (x, y, width, height, color = "#fff") => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

const drawBall = (x, y, radius, color = "#05EDFF") => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
    ctx.closePath();
    ctx.fill();
}


const collisionDetect = (player, ball) => {
    // returns true or false
    player.top = player.y;
    player.right = player.x + player.width;
    player.bottom = player.y + player.height;
    player.left = player.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}



const render = () => {
    ctx.fillStyle = "#d789d7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    netColor();
    gameScore(canvas.width / 4, canvas.height / 6, user.score);
    gameScore(3 * canvas.width / 4, canvas.height / 6, ai.score);
    drawPaddle(user.x, user.y, user.width, user.height);
    drawPaddle(ai.x, ai.y, ai.width, ai.height);
    drawBall(ball.x, ball.y, ball.radius);

}


window.addEventListener('keydown', (event) => {
    switch (event.which || event.keyCode) {
        case 38:
            upArrowKey = true;
            break;
        case 40:
            downArrowKey = true;
            break;
    }
});


window.addEventListener('keyup', (event) => {
    switch (event.which || event.keyCode) {
        case 38:
            upArrowKey = false;
            break;
        case 40:
            downArrowKey = false;
            break;
    }
});




const update = () => {
    //Move the paddle
    if (upArrowKey && user.y > 0) {
        user.y -= 8;
    } else if (downArrowKey && (user.y < canvas.height - user.height)) {
        user.y += 8;
    }

    //check if ball hits top or bottom of wall

    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {

        wallHitSound.play();
        ball.velocityY = -ball.velocityY;
    }

    //Check for user score
    if (ball.x + ball.radius >= canvas.width) {
        scoreSound.play();
        user.score++;
        //Game result function call
        gameResult();
    }

    if (ball.x - ball.radius <= 0) {
        scoreSound.play();
        ai.score++;
        // Game Result function call
        gameResult();
    }



    //move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //ai Paddle
    ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.5;

    //collision detection on paddles
    let player = (ball.x < canvas.width / 2) ? user : ai;

    if (collisionDetect(player, ball)) {
        // play hitSound
        hitSound.play();
        // default angle is 0deg in Radian
        let angle = 0;

        // if ball hit the top of paddle
        if (ball.y < (player.y + player.height / 2)) {
            // then -1 * Math.PI / 4 = -45deg
            angle = -1 * Math.PI / 4;
        } else if (ball.y > (player.y + player.height / 2)) {
            // if it hit the bottom of paddle
            // then angle will be Math.PI / 4 = 45deg
            angle = Math.PI / 4;
        }

        /* change velocity of ball according to on which paddle the ball hitted */
        ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);

        // increase ball speed
        ball.speed += 0.2;
    }

}

function reset() {
    // [user.x, user.y]=[10, (canvas.height / 2) - (paddleHeight / 2)];
    // [ai.x, ai.y]=[canvas.width - (paddleWidth + 10), (canvas.height / 2) - (paddleHeight / 2)];
    [ball.x, ball.y] = [canvas.width / 2, canvas.width / 2];
    [ball.velocityX, ball.velocityY] = [-ball.velocityX, -ball.velocityY];
}

const gameLoop = () => {
    update();
    render();
}

function gameReset() {
    clearInterval(gameInterval);
    [user.x, user.y]=[10, (canvas.height / 2) - (paddleHeight / 2)];
    [ai.x, ai.y]=[canvas.width - (paddleWidth + 10), (canvas.height / 2) - (paddleHeight / 2)];
    [ball.x, ball.y] = [canvas.width / 2, canvas.width / 2];
    [ball.velocityX, ball.velocityY] = [-ball.velocityX, -ball.velocityY];
    [user.score, ai.score]= [0, 0];
    result.innerHTML="";
    result.style.visibility="hidden";
    gameInterval=setInterval(gameLoop,1000/60);
}

const gameResult = () => {
    if (ai.score >= 10) {
        result.style.visibility = "visible";
        result.innerHTML = "You Lost";
        clearInterval(gameInterval)
    } else if (user.score >= 10) {
        result.style.visibility = "visible";
        result.innerHTML = "You Won";
        clearInterval(gameInterval);
    } else {
        reset();
    }

}



let gameInterval = setInterval(gameLoop,1000/60);
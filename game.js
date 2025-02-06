const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let foods = [{ x: 15, y: 15 }, { x: 5, y: 5 }, { x: 10, y: 15 }, { x: 3, y: 8 }, { x: 17, y: 12 }, { x: 8, y: 17 }, { x: 13, y: 3 }, { x: 2, y: 12 }, { x: 18, y: 7 }];
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameLoop;
let isPaused = false;
let gameSpeed = 100;

document.getElementById('highScore').textContent = highScore;

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const directionBtns = document.querySelectorAll('.direction-btn');
    directionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = btn.getAttribute('data-key');
            const event = new KeyboardEvent('keydown', { key });
            document.dispatchEvent(event);
        });
    });
});

function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        const radius = gridSize / 2 - 1;
        const x = segment.x * gridSize + radius;
        const y = segment.y * gridSize + radius;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeRadius = radius / 4;
            const eyeOffset = radius / 2;
            
            ctx.beginPath();
            ctx.arc(x - eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#4CAF50';
        }
    });
}

function drawFood() {
    foods.forEach(food => {
        const radius = gridSize / 2 - 1;
        const x = food.x * gridSize + radius;
        const y = food.y * gridSize + radius;
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - radius/2, y - radius/2, radius/4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // 检查是否碰到边界
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    let foodEaten = false;
    foods.forEach((food, index) => {
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('score').textContent = score;
            generateFood(index);
            foodEaten = true;
        }
    });
    
    if (!foodEaten) {
        snake.pop();
    }
}

function generateFood(index) {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
        foods.some(food => food.x === newFood.x && food.y === newFood.y)
    );
    foods[index] = newFood;
}

function checkCollision() {
    const head = snake[0];
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('startButton').textContent = '开始游戏';
}

function toggleGame() {
    if (!gameLoop) {
        startGame();
        const button = document.getElementById('startButton');
        button.textContent = '暂停游戏';
    } else {
        isPaused = !isPaused;
        const button = document.getElementById('startButton');
        button.textContent = isPaused ? '继续游戏' : '暂停游戏';
    }
}

function update() {
    if (isPaused) return;
    
    if (dx !== 0 || dy !== 0) {
        moveSnake();
        
        if (checkCollision()) {
            gameOver();
            return;
        }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    drawSnake();
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    isPaused = false;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').style.display = 'none';
    
    foods.forEach((_, index) => generateFood(index));
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function updateGameSpeed(value) {
    gameSpeed = 200 - value * 1.5;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, gameSpeed);
    }
}

function clearRecord() {
    if (confirm('确定要清除最高分记录吗？')) {
        localStorage.removeItem('highScore');
        highScore = 0;
        document.getElementById('highScore').textContent = '0';
    }
}

startGame();
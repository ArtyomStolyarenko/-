class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Игровые объекты
        this.input = new InputHandler();
        this.player = new Player(this);
        this.platforms = [];
        this.coins = [];
        this.particles = [];
        this.enemies = []; // Для будущих врагов
        
        // Игровое состояние
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('platformerHighScore')) || 0;
        this.lives = 3;
        this.level = 1;
        this.maxLevels = 3;
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.levelTime = 60; // 60 секунд на уровень
        this.timeLeft = this.levelTime;
        this.levelStartTime = 0;
        
        // Инициализация
        this.createLevel(this.level);
        this.setupEventListeners();
        this.updateUI();
        
        // Запуск игрового цикла
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    createLevel(levelNum) {
        this.platforms = [];
        this.coins = [];
        this.particles = [];
        this.timeLeft = this.levelTime;
        this.levelStartTime = 0;
        
        // Границы уровня (нельзя упасть)
        this.platforms.push(new Platform(-50, 0, 50, this.height, 'wall')); // Левая стена
        this.platforms.push(new Platform(this.width, 0, 50, this.height, 'wall')); // Правая стена
        this.platforms.push(new Platform(0, -50, this.width, 50, 'wall')); // Верх
        this.platforms.push(new Platform(0, this.height, this.width, 50, 'wall')); // Низ
        
        // Пол
        this.platforms.push(new Platform(0, this.height - 20, this.width, 20));
        
        // Уровень 1: Обучение
        if (levelNum === 1) {
            // Простые платформы
            this.platforms.push(new Platform(100, 500, 200, 15));
            this.platforms.push(new Platform(350, 450, 150, 15));
            this.platforms.push(new Platform(200, 350, 120, 15));
            this.platforms.push(new Platform(500, 300, 180, 15));
            this.platforms.push(new Platform(300, 250, 100, 15));
            this.platforms.push(new Platform(600, 200, 150, 15));
            
            // Стартовая позиция
            this.player.x = 100;
            this.player.y = 300;
            
            // 8 монет
            this.createCoins(8, levelNum);
        }
        // Уровень 2: Движущиеся платформы
        else if (levelNum === 2) {
            // Платформы с движением
            this.platforms.push(new Platform(100, 550, 150, 15));
            this.platforms.push(new Platform(300, 500, 100, 15, 'moving'));
            this.platforms.push(new Platform(500, 450, 150, 15));
            this.platforms.push(new Platform(200, 400, 120, 15, 'moving'));
            this.platforms.push(new Platform(400, 350, 100, 15));
            this.platforms.push(new Platform(600, 300, 150, 15));
            this.platforms.push(new Platform(100, 250, 120, 15));
            this.platforms.push(new Platform(350, 200, 100, 15, 'moving'));
            this.platforms.push(new Platform(550, 150, 120, 15));
            
            // Стартовая позиция
            this.player.x = 100;
            this.player.y = 400;
            
            // 12 монет
            this.createCoins(12, levelNum);
        }
        // Уровень 3: Хрупкие платформы и лабиринт
        else if (levelNum === 3) {
            // Сложный лабиринт с хрупкими платформами
            this.platforms.push(new Platform(100, 550, 100, 15));
            this.platforms.push(new Platform(250, 550, 100, 15, 'breakable'));
            this.platforms.push(new Platform(400, 550, 100, 15));
            this.platforms.push(new Platform(550, 550, 100, 15, 'breakable'));
            
            this.platforms.push(new Platform(100, 450, 100, 15, 'moving'));
            this.platforms.push(new Platform(250, 450, 100, 15));
            this.platforms.push(new Platform(400, 450, 100, 15, 'breakable'));
            this.platforms.push(new Platform(550, 450, 100, 15, 'moving'));
            
            this.platforms.push(new Platform(100, 350, 100, 15));
            this.platforms.push(new Platform(250, 350, 100, 15, 'moving'));
            this.platforms.push(new Platform(400, 350, 100, 15, 'breakable'));
            this.platforms.push(new Platform(550, 350, 100, 15));
            
            this.platforms.push(new Platform(100, 250, 100, 15, 'breakable'));
            this.platforms.push(new Platform(250, 250, 100, 15));
            this.platforms.push(new Platform(400, 250, 100, 15, 'moving'));
            this.platforms.push(new Platform(550, 250, 100, 15, 'breakable'));
            
            this.platforms.push(new Platform(100, 150, 100, 15, 'moving'));
            this.platforms.push(new Platform(250, 150, 100, 15, 'breakable'));
            this.platforms.push(new Platform(400, 150, 100, 15));
            this.platforms.push(new Platform(550, 150, 100, 15, 'moving'));
            
            // Вертикальные платформы для сложности
            this.platforms.push(new Platform(650, 200, 15, 200));
            this.platforms.push(new Platform(700, 300, 15, 150));
            
            // Стартовая позиция
            this.player.x = 50;
            this.player.y = 500;
            
            // 15 монет
            this.createCoins(15, levelNum);
        }
        
        // Сброс состояния игрока
        this.player.reset();
        this.player.makeInvincible(60); // 1 секунда неуязвимости при старте уровня
    }
    
    createCoins(count, level) {
        const occupiedPositions = [];
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            
            while (!validPosition && attempts < 100) {
                attempts++;
                x = 60 + Math.random() * (this.width - 120);
                y = 60 + Math.random() * (this.height - 120);
                
                validPosition = true;
                
                // Проверяем, не слишком ли близко к платформе
                for (const platform of this.platforms) {
                    if (platform.type === 'wall') continue;
                    
                    const platformCenterX = platform.x + platform.width / 2;
                    const platformCenterY = platform.y + platform.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(x - platformCenterX, 2) + 
                        Math.pow(y - platformCenterY, 2)
                    );
                    
                    if (distance < 50) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Проверяем, не слишком ли близко к другим монетам
                for (const pos of occupiedPositions) {
                    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (distance < 40) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Проверяем, не слишком ли близко к стартовой позиции игрока
                const distanceToPlayer = Math.sqrt(
                    Math.pow(x - this.player.x, 2) + 
                    Math.pow(y - this.player.y, 2)
                );
                if (distanceToPlayer < 60) {
                    validPosition = false;
                }
            }
            
            if (validPosition) {
                this.coins.push(new Coin(x, y, level));
                occupiedPositions.push({x, y});
            }
        }
    }
    
    checkCollisions() {
        // Проверка платформ
        this.player.isOnGround = false;
        
        for (const platform of this.platforms) {
            if (platform.broken) continue;
            
            if (this.isColliding(this.player, platform)) {
                // Определяем сторону столкновения
                const playerBottom = this.player.y + this.player.height;
                const playerTop = this.player.y;
                const playerRight = this.player.x + this.player.width;
                const playerLeft = this.player.x;
                
                const platformTop = platform.y;
                const platformBottom = platform.y + platform.height;
                const platformRight = platform.x + platform.width;
                const platformLeft = platform.x;
                
                // Вычисляем глубину проникновения с каждой стороны
                const overlapTop = playerBottom - platformTop;
                const overlapBottom = platformBottom - playerTop;
                const overlapLeft = playerRight - platformLeft;
                const overlapRight = platformRight - playerLeft;
                
                // Находим минимальное перекрытие
                const minOverlap = Math.min(
                    overlapTop, overlapBottom, overlapLeft, overlapRight
                );
                
                // Решаем коллизию в зависимости от стороны
                if (minOverlap === overlapTop && this.player.vy >= 0) {
                    // Столкновение сверху (игрок стоит на платформе)
                    this.player.y = platformTop - this.player.height;
                    this.player.vy = 0;
                    this.player.isOnGround = true;
                    
                    // Ломаем хрупкую платформу
                    if (platform.type === 'breakable') {
                        if (platform.break()) {
                            this.createParticles(platform.x + platform.width/2, platform.y, 20);
                        }
                    }
                } 
                else if (minOverlap === overlapBottom && this.player.vy < 0) {
                    // Столкновение снизу (ударился головой)
                    this.player.y = platformBottom;
                    this.player.vy = 0;
                }
                else if (minOverlap === overlapLeft) {
                    // Столкновение слева
                    this.player.x = platformLeft - this.player.width;
                    this.player.vx = 0;
                }
                else if (minOverlap === overlapRight) {
                    // Столкновение справа
                    this.player.x = platformRight;
                    this.player.vx = 0;
                }
            }
        }
        
        // Проверка монет
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (!coin.collected) {
                const dx = (this.player.x + this.player.width/2) - coin.x;
                const dy = (this.player.y + this.player.height/2) - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.player.width/2 + coin.radius) {
                    // Сбор монеты
                    const coinValue = coin.collect();
                    this.score += coinValue;
                    this.createParticles(coin.x, coin.y, 15, '#ffd700');
                    this.coins.splice(i, 1);
                    
                    // Бонусные частицы
                    for (let j = 0; j < 5; j++) {
                        this.particles.push({
                            x: coin.x,
                            y: coin.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -Math.random() * 6 - 2,
                            life: 60,
                            color: '#ffffff',
                            size: 3,
                            text: `+${coinValue}`,
                            textLife: 40
                        });
                    }
                    
                    this.updateUI();
                }
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createParticles(x, y, count, color = null) {
        for (let i = 0; i < count; i++) {
            const particleColor = color || 
                (i % 3 === 0 ? '#ffd700' : 
                 i % 3 === 1 ? '#ffaa00' : '#ffffff');
            
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30 + Math.random() * 30,
                color: particleColor,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Гравитация
            p.vx *= 0.98; // Сопротивление воздуха
            p.life--;
            
            // Обновление текстовых частиц
            if (p.text !== undefined) {
                p.textLife--;
                if (p.textLife <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            }
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life / 30;
            
            if (p.text !== undefined) {
                // Текстовая частица (бонусные очки)
                this.ctx.fillStyle = p.color;
                this.ctx.font = 'bold 16px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(p.text, p.x, p.y);
            } else {
                // Обычная частица
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawBackground() {
        // Фон в зависимости от уровня
        let gradient;
        switch(this.level) {
            case 1:
                gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
                gradient.addColorStop(0, '#0a192f');
                gradient.addColorStop(1, '#1e3a5f');
                break;
            case 2:
                gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
                break;
            case 3:
                gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
                gradient.addColorStop(0, '#2d1b2e');
                gradient.addColorStop(1, '#4a1e3d');
                break;
            default:
                gradient = '#111827';
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Звезды
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width;
            const y = (i * 23) % this.height;
            const size = (Math.sin(this.timeLeft * 0.5 + i) + 1) * 0.3 + 0.3;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    updateLevelInfo() {
        document.getElementById('levelName').textContent = 
            `Уровень ${this.level}: ${this.getLevelName()}`;
        document.getElementById('levelTime').textContent = 
            `Время: ${Math.max(0, Math.floor(this.timeLeft))}с`;
        document.getElementById('coinsLeft').textContent = 
            `Монет: ${this.coins.length}`;
    }
    
    getLevelName() {
        switch(this.level) {
            case 1: return 'Начало';
            case 2: return 'Движение';
            case 3: return 'Лабиринт';
            default: return 'Доп. уровень';
        }
    }
    
    update(currentTime) {
        if (this.gameState !== 'playing') return;
        
        // Вычисление deltaTime
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Обновление времени уровня
        if (this.levelStartTime === 0) {
            this.levelStartTime = currentTime;
        }
        this.timeLeft = this.levelTime - (currentTime - this.levelStartTime) / 1000;
        
        // Проверка времени
        if (this.timeLeft <= 0 && !this.infiniteMode) {
            this.timeLeft = 0;
            this.loseLife();
            return;
        }
        
        // Обновление объектов
        this.player.update(this.input);
        
        for (const platform of this.platforms) {
            platform.update();
        }
        
        for (const coin of this.coins) {
            coin.update();
        }
        
        this.updateParticles();
        this.checkCollisions();
        
        // Проверка завершения уровня
        if (!this.infiniteMode && this.coins.length === 0) {
            this.levelComplete();
        }
        
        // Проверка паузы
        if (this.input.isPressed('pause')) {
            this.pause();
            this.input.keys.pause = false;
        }
        
        // Проверка перехода на следующий уровень (для тестирования)
        if (this.input.isPressed('next')) {
            this.input.keys.next = false;
            this.levelComplete();
        }
        
        // Обновление информации об уровне
        this.updateLevelInfo();
    }
    
    draw() {
        // Очистка и фон
        this.drawBackground();
        
        // Отрисовка объектов
        this.platforms.forEach(p => p.draw(this.ctx));
        this.coins.forEach(c => c.draw(this.ctx));
        this.drawParticles();
        this.player.draw(this.ctx);
        
        // Индикатор времени
        this.drawTimeIndicator();
        
        // Сообщения
        if (this.gameState === 'paused') {
            this.drawMessage('ПАУЗА', 'Нажмите P для продолжения');
        } else if (this.gameState === 'gameOver') {
            this.drawMessage('ИГРА ОКОНЧЕНА', `Счет: ${this.score} | Нажмите "Рестарт"`);
        } else if (this.gameState === 'menu') {
            this.drawMessage('PIXEL JUMPER', 'Нажмите СТАРТ для начала игры');
        } else if (this.gameState === 'levelComplete') {
            this.drawMessage('УРОВЕНЬ ПРОЙДЕН!', `Бонус: +${500 * this.level} очков!`);
        }
    }
    
    drawTimeIndicator() {
        if (this.timeLeft <= 10) {
            // Красный индикатор, когда мало времени
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.7)';
            this.ctx.font = 'bold 30px "Press Start 2P"';
        } else if (this.timeLeft <= 30) {
            // Желтый индикатор
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            this.ctx.font = 'bold 25px "Press Start 2P"';
        } else {
            // Зеленый индикатор
            this.ctx.fillStyle = 'rgba(0, 255, 157, 0.7)';
            this.ctx.font = 'bold 20px "Press Start 2P"';
        }
        
        this.ctx.textAlign = 'center';
        const timeText = Math.max(0, Math.floor(this.timeLeft));
        this.ctx.fillText(`${timeText}`, this.width / 2, 40);
        
        // Полоска времени
        const barWidth = 200;
        const barHeight = 10;
        const barX = this.width / 2 - barWidth / 2;
        const barY = 50;
        const progress = Math.max(0, this.timeLeft / this.levelTime);
        
        // Фон полоски
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Заполнение
        if (progress > 0.5) {
            this.ctx.fillStyle = '#00ff9d';
        } else if (progress > 0.25) {
            this.ctx.fillStyle = '#ffd700';
        } else {
            this.ctx.fillStyle = '#ff416c';
        }
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Обводка
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    drawMessage(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#00ff9d';
        this.ctx.font = 'bold 40px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.width/2, this.height/2 - 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(subtitle, this.width/2, this.height/2 + 20);
    }
    
    gameLoop(currentTime = performance.now()) {
        this.update(currentTime);
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.levelStartTime = this.lastTime;
        document.getElementById('gameMessage').classList.remove('show');
    }
    
    pause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        if (this.gameState === 'playing') {
            this.lastTime = performance.now();
        }
    }
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'playing';
        this.createLevel(this.level);
        this.updateUI();
        this.lastTime = performance.now();
        this.levelStartTime = this.lastTime;
    }
    
    nextLevel() {
        if (this.level < this.maxLevels) {
            this.level++;
            this.createLevel(this.level);
            this.updateUI();
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.levelStartTime = this.lastTime;
        }
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        
        // Бонус за уровень
        const bonus = 500 * this.level;
        this.score += bonus;
        
        if (this.level >= this.maxLevels) {
            // Победа в игре
            this.showMessage('ПОБЕДА!', `Вы прошли все ${this.maxLevels} уровня! Итоговый счет: ${this.score}`);
            this.gameState = 'gameOver';
        } else {
            this.showMessage(`Уровень ${this.level} пройден!`, `Бонус: +${bonus} очков. Следующий уровень через 3 секунды...`);
            
            setTimeout(() => {
                this.level++;
                this.createLevel(this.level);
                this.updateUI();
                this.gameState = 'playing';
                this.lastTime = performance.now();
                this.levelStartTime = this.lastTime;
            }, 3000);
        }
        
        this.updateUI();
    }
    
    loseLife() {
        if (this.player.invincible > 0) return;
        
        this.lives--;
        this.player.makeInvincible(120); // 2 секунды неуязвимости
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showMessage(`Потеряна жизнь!`, `Осталось: ${this.lives}. Продолжаем через 2 секунды...`);
            
            setTimeout(() => {
                // Перезапуск уровня с сохранением прогресса
                this.createLevel(this.level);
                this.player.makeInvincible(60);
                this.gameState = 'playing';
                this.lastTime = performance.now();
                this.levelStartTime = this.lastTime;
            }, 2000);
        }
        
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Обновление рекорда
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('platformerHighScore', this.highScore);
            this.showMessage('НОВЫЙ РЕКОРД!', `${this.score} очков! Нажмите "Рестарт" для новой игры.`);
        } else {
            this.showMessage('ИГРА ОКОНЧЕНА', `Ваш счет: ${this.score}. Рекорд: ${this.highScore}`);
        }
        
        this.updateUI();
    }
    
    showMessage(title, subtitle) {
        const messageEl = document.getElementById('gameMessage');
        messageEl.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 1.5rem;">${title}</div>
            <div style="font-size: 1rem;">${subtitle}</div>
        `;
        messageEl.classList.add('show');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
    }
}
class Player {
    constructor(game) {
        this.game = game;
        this.width = 30;
        this.height = 50;
        this.reset();
        
        this.color = '#00ff9d';
        this.jumpColor = '#ffd700';
        this.jumpEffect = 0;
        this.invincible = 0; // Неуязвимость после потери жизни
    }
    
    reset() {
        this.x = 100;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        this.isOnGround = false;
        this.direction = 1; // 1 = вправо, -1 = влево
        
        this.speed = 5;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.maxFallSpeed = 20;
        this.friction = 0.85;
        this.invincible = 0;
    }
    
    update(input) {
        // Счетчик неуязвимости
        if (this.invincible > 0) {
            this.invincible--;
        }
        
        // Применяем гравитацию
        this.vy += this.gravity;
        if (this.vy > this.maxFallSpeed) {
            this.vy = this.maxFallSpeed;
        }
        
        // Обработка ввода
        if (input.isPressed('left')) {
            this.vx = -this.speed;
            this.direction = -1;
        } else if (input.isPressed('right')) {
            this.vx = this.speed;
            this.direction = 1;
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }
        
        // Прыжок
        if (input.isPressed('up') && this.isOnGround) {
            this.vy = this.jumpForce;
            this.isOnGround = false;
            this.jumpEffect = 15;
        }
        
        // Обновление позиции
        this.x += this.vx;
        this.y += this.vy;
        
        // Анимация прыжка
        if (this.jumpEffect > 0) {
            this.jumpEffect--;
        }
        
        // Ограничение по краям (через коллизии с платформами)
    }
    
    draw(ctx) {
        // Мигание при неуязвимости
        if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) {
            return; // Пропускаем отрисовку для эффекта мигания
        }
        
        // Анимация прыжка
        const color = this.jumpEffect > 0 ? this.jumpColor : this.color;
        
        // Тело игрока
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Глаза
        ctx.fillStyle = '#000';
        const eyeX = this.direction === 1 ? this.x + 20 : this.x + 10;
        ctx.fillRect(eyeX, this.y + 15, 5, 5);
        
        // Рот (улыбка)
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const mouthY = this.y + 35;
        if (this.direction === 1) {
            ctx.moveTo(this.x + 10, mouthY);
            ctx.quadraticCurveTo(this.x + 15, mouthY + 5, this.x + 20, mouthY);
        } else {
            ctx.moveTo(this.x + 20, mouthY);
            ctx.quadraticCurveTo(this.x + 15, mouthY + 5, this.x + 10, mouthY);
        }
        ctx.stroke();
        
        // Эффект прыжка
        if (this.jumpEffect > 0) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    makeInvincible(time) {
        this.invincible = time;
    }
}
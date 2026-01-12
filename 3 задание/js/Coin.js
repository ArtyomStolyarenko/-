class Coin {
    constructor(x, y, level = 1) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.rotation = 0;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.floatSpeed = 0.03 + Math.random() * 0.02;
        this.value = this.getValueForLevel(level);
        this.sparkleTimer = 0;
    }
    
    getValueForLevel(level) {
        switch(level) {
            case 1: return 100;
            case 2: return 150;
            case 3: return 200;
            default: return 100;
        }
    }
    
    update() {
        if (this.collected) return;
        
        this.rotation += 0.05;
        this.floatOffset += this.floatSpeed;
        this.sparkleTimer++;
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Плавающая анимация
        const floatY = Math.sin(this.floatOffset) * 5;
        
        // Внешний круг (золотой ободок)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y + floatY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутренний круг
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(this.x, this.y + floatY, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Детали на монете
        ctx.save();
        ctx.translate(this.x, this.y + floatY);
        ctx.rotate(this.rotation);
        
        // Буква "C" (Coin)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', 0, 0);
        
        ctx.restore();
        
        // Блеск (анимированный)
        if (Math.sin(this.sparkleTimer * 0.2) > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x - 4, this.y - 4 + floatY, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Свечение
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y + floatY, this.radius * 1.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Сброс теней
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    collect() {
        if (!this.collected) {
            this.collected = true;
            return this.value;
        }
        return 0;
    }
}
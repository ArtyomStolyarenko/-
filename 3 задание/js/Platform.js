class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = this.getColor();
        this.originalX = x;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.speed = type === 'moving' ? 1.5 : 0;
        this.broken = false;
        this.breakTimer = 0;
    }
    
    getColor() {
        switch(this.type) {
            case 'moving': return '#ff6b6b'; // Красный
            case 'breakable': return '#ffd166'; // Желтый
            case 'wall': return '#4a4e69'; // Серый для стен
            default: return '#4ecdc4'; // Бирюзовый
        }
    }
    
    update() {
        if (this.broken) {
            this.breakTimer++;
            if (this.breakTimer > 180) { // Восстанавливаем через 3 секунды
                this.broken = false;
                this.breakTimer = 0;
            }
            return;
        }
        
        if (this.type === 'moving') {
            this.x += this.speed * this.direction;
            if (this.x > this.originalX + 150 || this.x < this.originalX - 150) {
                this.direction *= -1;
            }
        }
    }
    
    draw(ctx) {
        if (this.broken) {
            // Рисуем обломки
            ctx.fillStyle = 'rgba(255, 209, 102, 0.3)';
            for (let i = 0; i < 5; i++) {
                const fragmentX = this.x + (i * this.width/5);
                const offsetY = Math.sin(this.breakTimer * 0.1 + i) * 5;
                ctx.fillRect(fragmentX, this.y + offsetY, this.width/5 - 2, this.height);
            }
            return;
        }
        
        // Основная платформа
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Текстура
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        const patternSize = Math.min(15, this.width / 5);
        for (let i = 5; i < this.width - 5; i += patternSize) {
            ctx.fillRect(this.x + i, this.y + 2, patternSize - 5, 3);
        }
        
        // Обводка для движущихся платформ
        if (this.type === 'moving') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        // Предупреждение для хрупких платформ
        if (this.type === 'breakable') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 3; i++) {
                const warningX = this.x + this.width/2 - 10 + i * 10;
                ctx.fillRect(warningX, this.y + 5, 5, 5);
            }
        }
    }
    
    break() {
        if (this.type === 'breakable' && !this.broken) {
            this.broken = true;
            return true;
        }
        return false;
    }
}
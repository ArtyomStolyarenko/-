class InputHandler {
    constructor() {
        this.keys = {};
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.keys.up = true;
                    e.preventDefault(); // Предотвращаем прокрутку страницы
                    break;
                case 'KeyP':
                    this.keys.pause = true;
                    break;
                case 'KeyN':
                    this.keys.next = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.keys.up = false;
                    break;
                case 'KeyP':
                    this.keys.pause = false;
                    break;
                case 'KeyN':
                    this.keys.next = false;
                    break;
            }
        });
        
        // Предотвращаем контекстное меню на правый клик
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        });
    }
    
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    reset() {
        this.keys = {};
    }
}
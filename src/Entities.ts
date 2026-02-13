export class Entity {
    x: number;
    y: number;
    radius: number;
    color: string;

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
}

export class Puck extends Entity {
    vx: number = 0;
    vy: number = 0;
    friction: number = 0.99;
    maxSpeed: number = 1500;

    constructor(x: number, y: number) {
        super(x, y, 20, '#ffffff'); // White puck, size 20
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Cap speed
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed;
            this.vx *= scale;
            this.vy *= scale;
        }
    }
}

export class Mallet extends Entity {
    // Player 1: Electric Blue (#00f3ff), Player 2: Neon Magenta (#ff00ff)
    constructor(x: number, y: number, isPlayer1: boolean) {
        super(x, y, 40, isPlayer1 ? '#00f3ff' : '#ff00ff');
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Particle extends Entity {
    vx: number;
    vy: number;
    life: number;
    maxLife: number;

    constructor(x: number, y: number, color: string) {
        super(x, y, Math.random() * 3 + 1, color);
        this.vx = (Math.random() - 0.5) * 50;
        this.vy = (Math.random() - 0.5) * 50;
        this.life = 1.0;
        this.maxLife = 1.0;
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2; // Fade out speed
    }
}

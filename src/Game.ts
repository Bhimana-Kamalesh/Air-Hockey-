import { Renderer } from './Renderer';
import { Physics } from './Physics';
import { Input } from './Input';
import { Puck, Mallet, Particle } from './Entities';

export class Game {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    physics: Physics;
    input: Input;

    lastTime: number = 0;

    puck!: Puck;
    mallets!: Mallet[];
    particles: Particle[] = [];

    score: [number, number] = [0, 0];
    scoreScale: number = 1;
    state: 'MENU' | 'PLAYING' | 'SCORED' = 'MENU';
    tableAnimationProgress: number = 0;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.renderer = new Renderer(this.canvas);
        this.physics = new Physics(this.canvas.width, this.canvas.height);
        this.input = new Input(this.canvas);

        // Initialize Entities
        this.resetGame();

        // Start Table Animation
        this.state = 'MENU';

        // Input listener for Menu
        const startMenu = document.getElementById('start-menu');
        startMenu?.addEventListener('click', () => {
            if (this.state === 'MENU') {
                this.state = 'PLAYING';
                this.resetPuck();
                startMenu.classList.add('hidden');
            }
        });

        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    resetGame() {
        // Two mallets: Player 1 (Bottom), Player 2 (Top - AI or P2)
        this.mallets = [
            new Mallet(this.canvas.width / 2, this.canvas.height * 0.85, true),
            new Mallet(this.canvas.width / 2, this.canvas.height * 0.15, false)
        ];
        this.resetPuck();
        this.score = [0, 0];
    }

    resetPuck() {
        this.puck = new Puck(this.canvas.width / 2, this.canvas.height / 2);
        this.puck.vx = 0;
        this.puck.vy = 0;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Update physics boundaries if needed, though we recreate physics or update it?
        if (this.physics) {
            this.physics.width = this.canvas.width;
            this.physics.height = this.canvas.height;
        }
    }

    loop(timestamp: number) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.renderer.render(this.puck, this.mallets, this.particles, this.score, this.tableAnimationProgress, this.scoreScale);

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime: number) {
        // Table Animation
        if (this.tableAnimationProgress < 1) {
            this.tableAnimationProgress += deltaTime * 0.5; // 2 seconds to draw
            if (this.tableAnimationProgress > 1) this.tableAnimationProgress = 1;
        }

        if (this.state !== 'PLAYING' && this.state !== 'SCORED') return;

        // Input Handling
        const pointers = this.input.getPointers();

        // Reset mallet velocities if no pointers (friction/decay for mallet?)
        // Mallet position is absolute, so velocity is 0 if not updated.
        // We calculate velocity in updatePosition, so if we don't call it, we should zero it?
        // Actually, let's just update mallets based on pointers.

        let p1Moved = false;
        let p2Moved = false;

        for (const p of pointers) {
            // Player 1 (Bottom Half)
            if (p.y > this.canvas.height / 2) {
                // Constrain mallet to bottom half
                let destY = Math.max(p.y, this.canvas.height / 2 + this.mallets[0].radius);
                destY = Math.min(destY, this.canvas.height - this.mallets[0].radius);

                let destX = Math.max(p.x, this.mallets[0].radius);
                destX = Math.min(destX, this.canvas.width - this.mallets[0].radius);

                this.mallets[0].updatePosition(destX, destY, deltaTime);
                p1Moved = true;
            }
            // Player 2 (Top Half)
            else {
                // Constrain mallet to top half
                let destY = Math.max(p.y, this.mallets[1].radius);
                destY = Math.min(destY, this.canvas.height / 2 - this.mallets[1].radius);

                let destX = Math.max(p.x, this.mallets[1].radius);
                destX = Math.min(destX, this.canvas.width - this.mallets[1].radius);

                this.mallets[1].updatePosition(destX, destY, deltaTime);
                p2Moved = true;
            }
        }

        // Zero out velocity if not moved (so it doesn't keep "hitting" if static)
        if (!p1Moved) {
            this.mallets[0].vx = 0;
            this.mallets[0].vy = 0;
        }
        if (!p2Moved) {
            this.mallets[1].vx = 0;
            this.mallets[1].vy = 0;
        }

        // Basic AI for Player 2 (If no touch on top half?)
        // For local 2-player, we might want to disable AI if touch is detected, or just have AI take over if no touch?
        // Let's say if p2Moved is false, AI takes over?
        if (!p2Moved) {
            const aiMallet = this.mallets[1];
            const targetX = this.puck.x;
            const lerp = 5 * deltaTime;

            let nextX = aiMallet.x + (targetX - aiMallet.x) * lerp;
            nextX = Math.max(aiMallet.radius, Math.min(this.canvas.width - aiMallet.radius, nextX));

            let targetY = this.canvas.height * 0.15;
            if (this.puck.y < this.canvas.height / 2 && this.puck.vy < 0) {
                targetY = this.canvas.height * 0.25;
            }
            let nextY = aiMallet.y + (targetY - aiMallet.y) * lerp;

            aiMallet.updatePosition(nextX, nextY, deltaTime);
        }


        // Physics
        this.puck.update(deltaTime);
        this.physics.resolveCollisions(this.puck, this.mallets);

        // Particle System
        // Emit Trail
        if (Math.hypot(this.puck.vx, this.puck.vy) > 100) {
            this.particles.push(new Particle(this.puck.x, this.puck.y, this.puck.color));
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Screen Shake Trigger (Simple check for now, should be event driven from Physics ideally)
        // For now, if puck hits wall (we can detect this by checking bounds again or return events from Physics)
        if (this.puck.x <= this.puck.radius || this.puck.x >= this.canvas.width - this.puck.radius) {
            this.renderer.shake = 5;
            if (navigator.vibrate) navigator.vibrate(20);
        }

        // Goal Detection
        // Goal is usually a hole in the top/bottom walls. 
        // Let's define a goal width (1/3 of screen width?)
        const goalWidth = this.canvas.width * 0.4;
        const goalLeft = (this.canvas.width - goalWidth) / 2;
        const goalRight = goalLeft + goalWidth;

        if (this.puck.y < 0) {
            if (this.puck.x > goalLeft && this.puck.x < goalRight) {
                // Player 1 Scored!
                this.handleGoal(1);
            }
        } else if (this.puck.y > this.canvas.height) {
            if (this.puck.x > goalLeft && this.puck.x < goalRight) {
                // Player 2 Scored!
                this.handleGoal(2);
            }
        }
    }

    handleGoal(player: number) {
        this.renderer.shake = 20;
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (player === 1) this.score[0]++;
        else this.score[1]++;

        this.scoreScale = 2.5; // Big bounce

        this.state = 'SCORED';
        setTimeout(() => {
            this.resetPuck();
            this.state = 'PLAYING';
        }, 1000);
    }
}

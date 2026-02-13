import { Puck, Mallet, Particle } from './Entities';

export class Renderer {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    shake: number = 0;

    render(puck: Puck, mallets: Mallet[], particles: Particle[], score: [number, number], tableProgress: number, scoreScale: number) {
        // Clear screen
        this.ctx.fillStyle = '#121212'; // Deep Charcoal
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // Apply Screen Shake
        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
            this.shake *= 0.9; // Decay
            if (this.shake < 0.5) this.shake = 0;
        }

        // Draw grid
        this.drawGrid(tableProgress);

        // Draw Score
        this.drawScore(score, scoreScale);

        // Draw Particles
        for (const p of particles) {
            this.ctx.globalAlpha = p.life;
            this.drawEntity(p);
        }
        this.ctx.globalAlpha = 1.0;

        // Draw Mallets
        for (const mallet of mallets) {
            this.drawEntity(mallet);
        }

        // Draw Puck
        this.drawEntity(puck);

        this.ctx.restore();
    }

    drawEntity(entity: { x: number, y: number, radius: number, color: string }) {
        this.ctx.beginPath();
        this.ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = entity.color;

        // Add Glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = entity.color;

        this.ctx.fill();
        this.ctx.closePath();

        // Reset Shadow for performance/next draws
        this.ctx.shadowBlur = 0;
    }

    drawScore(score: [number, number], scale: number) {
        this.ctx.font = 'bold 80px Montserrat';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Player 2 Score (Top)
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height * 0.35);
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        // Only scale the scorer? For simplicity, scale both or pass a trigger.
        // Let's scale both for the "Goal" impact.
        this.ctx.scale(scale, scale);
        this.ctx.fillText(score[1].toString(), 0, 0);
        this.ctx.restore();

        // Player 1 Score (Bottom)
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height * 0.65);
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        this.ctx.scale(scale, scale);
        this.ctx.fillText(score[0].toString(), 0, 0);
        this.ctx.restore();
    }

    drawGrid(progress: number) {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        // Animate Grid lines? Maybe just the main table lines.
        // Let's keep grid static but fade it in?
        this.ctx.globalAlpha = Math.min(1, progress * 2);

        this.ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;

        // Centre Line & Circle - Draw Animation
        if (progress > 0) {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;

            // Centre Line
            const midX = this.canvas.width / 2;
            const width = this.canvas.width * progress;

            this.ctx.beginPath();
            this.ctx.moveTo(midX - width / 2, this.canvas.height / 2);
            this.ctx.lineTo(midX + width / 2, this.canvas.height / 2);
            this.ctx.stroke();

            // Centre Circle
            if (progress > 0.5) {
                const circleProgress = (progress - 0.5) * 2;
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 70, 0, Math.PI * 2 * circleProgress);
                this.ctx.stroke();
            }
        }

        this.ctx.globalAlpha = 1;
        this.drawGoals();
    }

    drawGoals() {
        const goalWidth = this.canvas.width * 0.4;
        const goalRadius = goalWidth / 2;
        const centerX = this.canvas.width / 2;

        this.ctx.save();
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';

        // Top Goal (Player 2 - Magenta)
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';

        this.ctx.beginPath();
        // Draw semi-circle arc
        this.ctx.arc(centerX, 0, goalRadius, 0, Math.PI, false);
        this.ctx.stroke();
        this.ctx.fill();

        // Goal Line (Thicker)
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - goalRadius, 0);
        this.ctx.lineTo(centerX + goalRadius, 0);
        this.ctx.lineWidth = 8;
        this.ctx.stroke();


        // Bottom Goal (Player 1 - Cyan)
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.1)';

        this.ctx.beginPath();
        this.ctx.arc(centerX, this.canvas.height, goalRadius, Math.PI, 0, false);
        this.ctx.stroke();
        this.ctx.fill();

        // Goal Line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - goalRadius, this.canvas.height);
        this.ctx.lineTo(centerX + goalRadius, this.canvas.height);
        this.ctx.lineWidth = 8;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

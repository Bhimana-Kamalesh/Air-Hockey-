import { Puck, Mallet } from './Entities';

export class Physics {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    resolveCollisions(puck: Puck, mallets: Mallet[]) {
        const goalWidth = this.width * 0.4;
        const goalLeft = (this.width - goalWidth) / 2;
        const goalRight = goalLeft + goalWidth;

        // Wall Collisions
        // Left Wall
        if (puck.x - puck.radius < 0) {
            puck.x = puck.radius;
            puck.vx *= -1;
        }
        // Right Wall
        else if (puck.x + puck.radius > this.width) {
            puck.x = this.width - puck.radius;
            puck.vx *= -1;
        }

        // Top Wall (Player 2 Goal)
        if (puck.y - puck.radius < 0) {
            // Check if within goal range
            if (puck.x > goalLeft && puck.x < goalRight) {
                // Let it pass (Goal scoring logic in Game.ts)
            } else {
                puck.y = puck.radius;
                puck.vy *= -1;
            }
        }
        // Bottom Wall (Player 1 Goal)
        else if (puck.y + puck.radius > this.height) {
            // Check if within goal range
            if (puck.x > goalLeft && puck.x < goalRight) {
                // Let it pass
            } else {
                puck.y = this.height - puck.radius;
                puck.vy *= -1;
            }
        }

        // Mallet Collisions
        for (const mallet of mallets) {
            const dx = puck.x - mallet.x;
            const dy = puck.y - mallet.y;
            const distance = Math.hypot(dx, dy);
            const minDist = puck.radius + mallet.radius;

            if (distance < minDist) {
                // Normal vector
                const nx = dx / distance;
                const ny = dy / distance;

                // Push puck out to avoid sticking
                const overlap = minDist - distance;
                puck.x += nx * overlap;
                puck.y += ny * overlap;

                // Relative Velocity
                const dvx = puck.vx - mallet.vx;
                const dvy = puck.vy - mallet.vy;

                const dot = dvx * nx + dvy * ny;

                // Only resolve if moving towards each other
                if (dot < 0) {
                    const restitution = 1.0; // Bounciness

                    // Simple impulse model assuming mallet has infinite mass
                    // j = -(1 + e) * v_rel . n
                    const j = -(1 + restitution) * dot;

                    puck.vx += j * nx;
                    puck.vy += j * ny;

                    // Add extra kick if mallet is moving fast to make it feel "powerful"
                    // Clamp max speed somewhat?
                }
            }
        }
    }
}

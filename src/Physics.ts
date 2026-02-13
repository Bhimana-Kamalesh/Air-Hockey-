import { Puck, Mallet } from './Entities';

export class Physics {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    resolveCollisions(puck: Puck, mallets: Mallet[]) {
        // Wall Collisions
        if (puck.x - puck.radius < 0) {
            puck.x = puck.radius;
            puck.vx *= -1;
            // TODO: Trigger Haptics/Sound
        } else if (puck.x + puck.radius > this.width) {
            puck.x = this.width - puck.radius;
            puck.vx *= -1;
        }

        if (puck.y - puck.radius < 0) {
            puck.y = puck.radius;
            puck.vy *= -1;
        } else if (puck.y + puck.radius > this.height) {
            puck.y = this.height - puck.radius;
            puck.vy *= -1;
        }

        // Mallet Collisions
        for (const mallet of mallets) {
            const dx = puck.x - mallet.x;
            const dy = puck.y - mallet.y;
            const distance = Math.hypot(dx, dy);
            const minDist = puck.radius + mallet.radius;

            if (distance < minDist) {
                // simple elastic collision response
                // Normal vector
                const nx = dx / distance;
                const ny = dy / distance;

                // Push puck out of mallet to avoid sticking
                const overlap = minDist - distance;
                puck.x += nx * overlap;
                puck.y += ny * overlap;

                // Reflect velocity
                // We add mallet velocity to the puck for a "hit" feel? 
                // For now, let's just treat mallet as infinite mass static (or moving) object
                // If we knew mallet velocity, we could impart impulse.
                // Simplified bounce:

                const dot = puck.vx * nx + puck.vy * ny;
                puck.vx = puck.vx - 2 * dot * nx;
                puck.vy = puck.vy - 2 * dot * ny;

                // Add some "kick" if we can infer mallet speed, 
                // but since we update mallet position directly, we don't calculate its velocity in Physics yet.
                // We can add a simple boost for gameplay feel
                puck.vx *= 1.1;
                puck.vy *= 1.1;
            }
        }
    }
}

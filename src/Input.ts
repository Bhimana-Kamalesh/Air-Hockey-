export class Input {
    pointers: Map<number, { x: number, y: number }> = new Map();

    constructor(canvas: HTMLCanvasElement) {
        // Mouse events on window to catch drags outside canvas
        window.addEventListener('mousemove', (e) => {
            this.pointers.set(-1, { x: e.clientX, y: e.clientY });
        });
        window.addEventListener('mousedown', (e) => {
            this.pointers.set(-1, { x: e.clientX, y: e.clientY });
        });
        window.addEventListener('mouseup', () => {
            this.pointers.delete(-1);
        });
        // Mouse leaving canvas should probably not delete if we want to drag outside, 
        // but for now let's keep it simple. Active dragging is usually better tracked on window.

        // Touch events - keep on canvas to prevent scrolling/gestures on page
        // But we want to likely track them globally if they drift off? 
        // For a full screen game, canvas is usually fine.
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.handleTouch(e), { passive: false });
    }

    handleTouch(e: TouchEvent) {
        e.preventDefault(); // Prevent scrolling

        // We need to sync the map with current touches
        // Create a set of current IDs to detect removals (though touchend handles that primarily)

        // Clear existing touches that are updated in this event? 
        // Actually, just updating based on changedTouches is efficient, 
        // but for a robust state, we can just rebuild or update from targetTouches.

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (e.type === 'touchstart' || e.type === 'touchmove') {
                this.pointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                this.pointers.delete(touch.identifier);
            }
        }
    }

    getPointers() {
        return Array.from(this.pointers.values());
    }
}

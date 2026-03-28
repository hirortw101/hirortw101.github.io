
class BPScanner {
    constructor(canvasId, imageSrc) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.image = new Image();
        this.image.src = imageSrc;

        // Define states
        this.STATE = {
            GLARE_DETECTED: 0,
            ADJUSTING: 1,
            UPLOADING: 2,
            RESULT: 3
        };
        this.currentState = this.STATE.GLARE_DETECTED;
        this.stateTimer = 0;

        // Visual properties
        this.glareAlpha = 0.6;
        this.cameraOffset = { x: 0, y: 0 };
        this.uploadProgress = 0;

        this.image.onload = () => {
            // Scale canvas to match aspect ratio but fit container width if needed
            // For simplicity, we keep original scaling logic but ensure it fits
            this.canvas.width = 400;
            this.canvas.height = 300;
            this.animate();
        };
    }

    drawGlare(x, y, radius, alpha) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBox(color, text) {
        // Draw viewfinder box
        const pad = 40;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(pad, pad, this.canvas.width - pad*2, this.canvas.height - pad*2);

        // Draw text background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = this.ctx.measureText(text).width;
        this.ctx.fillRect(pad, pad - 30, this.canvas.width - pad*2, 30);

        // Draw text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, pad - 10);
    }

    animate() {
        if (!this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera transforms
        this.ctx.save();

        // 1. Draw Camera Feed (Image)
        // Simulate camera movement during ADJUSTING state
        let dx = 0;
        let dy = 0;

        if (this.currentState === this.STATE.ADJUSTING) {
            // Move camera to "remove" glare
            const progress = Math.min(1, this.stateTimer / 100);
            dx = Math.sin(progress * Math.PI) * 10;
            dy = progress * 20;
            this.glareAlpha = 0.6 * (1 - progress);
        } else if (this.currentState !== this.STATE.GLARE_DETECTED) {
            this.glareAlpha = 0;
            dy = 20; // Stay in "good" position
        } else {
            this.glareAlpha = 0.6;
            // Slight jitter in glare state
            dx = Math.random() * 2 - 1;
            dy = Math.random() * 2 - 1;
        }

        // Draw image with offset
        this.ctx.drawImage(this.image, -20 + dx, -20 + dy, this.canvas.width + 40, this.canvas.height + 40);

        // 2. Draw Glare
        if (this.glareAlpha > 0.01) {
            this.drawGlare(this.canvas.width/2 - 50, this.canvas.height/2 - 50, 100, this.glareAlpha);
        }

        this.ctx.restore();

        // 3. Draw UI Overlays based on State
        switch(this.currentState) {
            case this.STATE.GLARE_DETECTED:
                this.drawBox('#ff4d4d', 'Glare Detected! Move Camera.');
                if (this.stateTimer++ > 100) {
                    this.currentState = this.STATE.ADJUSTING;
                    this.stateTimer = 0;
                }
                break;

            case this.STATE.ADJUSTING:
                this.drawBox('#ffff4d', 'Adjusting angle...');
                if (this.stateTimer++ > 100) {
                    this.currentState = this.STATE.UPLOADING;
                    this.stateTimer = 0;
                }
                break;

            case this.STATE.UPLOADING:
                this.drawBox('#4dff4d', 'Glare Removed. Uploading...');

                // Draw Spinner/Progress
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                this.uploadProgress += 2;
                if (this.uploadProgress > 100) this.uploadProgress = 100;

                // Draw loading bar
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(this.canvas.width/4, this.canvas.height/2 - 10, this.canvas.width/2, 20);
                this.ctx.fillStyle = '#4dff4d';
                this.ctx.fillRect(this.canvas.width/4, this.canvas.height/2 - 10, (this.canvas.width/2) * (this.uploadProgress/100), 20);

                this.ctx.fillStyle = '#fff';
                this.ctx.fillText(`Uploading to Server... ${Math.floor(this.uploadProgress)}%`, this.canvas.width/2, this.canvas.height/2 + 40);

                if (this.stateTimer++ > 120) {
                    this.currentState = this.STATE.RESULT;
                    this.stateTimer = 0;
                }
                break;

            case this.STATE.RESULT:
                this.drawBox('#4dff4d', 'Result Received');

                // Simulate overlaying recognized digits
                this.ctx.font = 'bold 40px Arial';
                this.ctx.fillStyle = '#0f0';
                this.ctx.fillText("120 / 80", this.canvas.width/2, this.canvas.height/2);
                this.ctx.font = '20px Arial';
                this.ctx.fillText("Heart Rate: 72", this.canvas.width/2, this.canvas.height/2 + 35);

                if (this.stateTimer++ > 200) {
                    // Reset loop
                    this.currentState = this.STATE.GLARE_DETECTED;
                    this.stateTimer = 0;
                    this.uploadProgress = 0;
                }
                break;
        }

        requestAnimationFrame(() => this.animate());
    }
}

class SystemDiagram {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.steps = [
            { id: 'mobile', text: 'Mobile App', desc: 'Captures image, checks quality.' },
            { id: 'upload', text: 'Upload', desc: 'Sends image to server securely.' },
            { id: 'server', text: 'Server (GPU)', desc: 'Processes request.' },
            { id: 'yolo', text: 'YOLOv5 Detection', desc: 'Locates LCD panel and digits.' },
            { id: 'ocr', text: 'Digit Recognition', desc: 'Identifies numbers.' },
            { id: 'result', text: 'Result', desc: 'Returns data to user.' }
        ];

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="diagram-flow">
                ${this.steps.map(step => `
                    <div class="diagram-node" data-id="${step.id}">
                        <div class="node-icon"></div>
                        <div class="node-title">${step.text}</div>
                        <div class="node-desc">${step.desc}</div>
                    </div>
                `).join('<div class="diagram-arrow">➔</div>')}
            </div>
        `;

        // Add hover effects via CSS, but maybe JS can add sequential highlighting
        this.startHighlightLoop();
    }

    startHighlightLoop() {
        let index = 0;
        const nodes = this.container.querySelectorAll('.diagram-node');

        setInterval(() => {
            nodes.forEach(n => n.classList.remove('active'));
            nodes[index].classList.add('active');

            index = (index + 1) % nodes.length;
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Use index_img.png or similar for scanner
    new BPScanner('scanner-canvas', 'index_img.png');
    new SystemDiagram('system-diagram');
});

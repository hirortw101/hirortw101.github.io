
class BPScanner {
    constructor(canvasId, imageSrc) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.image = new Image();
        this.image.src = imageSrc;

        // Bounding boxes for digits (approximate locations based on image13.png style)
        // These are normalized coordinates (0-1) to be scaled to canvas size
        this.boxes = [
            { x: 0.25, y: 0.35, w: 0.15, h: 0.25, label: 'SYS', color: '#ff4d4d' },
            { x: 0.55, y: 0.40, w: 0.15, h: 0.20, label: 'DIA', color: '#4dff4d' },
            { x: 0.45, y: 0.65, w: 0.10, h: 0.15, label: 'PUL', color: '#4d4dff' }
        ];

        this.scanY = 0;
        this.scanning = true;
        this.scanSpeed = 2;

        this.image.onload = () => {
            this.canvas.width = this.image.width / 2; // Scale down for display
            this.canvas.height = this.image.height / 2;
            this.animate();
        };
    }

    animate() {
        if (!this.canvas) return;

        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

        // Draw scan line
        if (this.scanning) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.scanY);
            this.ctx.lineTo(this.canvas.width, this.scanY);
            this.ctx.strokeStyle = '#29d';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#29d';
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            // Gradient trail
            const gradient = this.ctx.createLinearGradient(0, this.scanY - 50, 0, this.scanY);
            gradient.addColorStop(0, 'rgba(41, 221, 221, 0)');
            gradient.addColorStop(1, 'rgba(41, 221, 221, 0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, this.scanY - 50, this.canvas.width, 50);

            this.scanY += this.scanSpeed;

            if (this.scanY > this.canvas.height) {
                this.scanning = false;
                setTimeout(() => {
                    this.scanning = true;
                    this.scanY = 0;
                }, 2000); // Wait 2s before restarting
            }
        } else {
            // Draw boxes when scan is complete
            this.boxes.forEach(box => {
                const x = box.x * this.canvas.width;
                const y = box.y * this.canvas.height;
                const w = box.w * this.canvas.width;
                const h = box.h * this.canvas.height;

                this.ctx.strokeStyle = box.color;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, w, h);

                this.ctx.fillStyle = box.color;
                this.ctx.font = '14px Arial';
                this.ctx.fillText(box.label, x, y - 5);
            });
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

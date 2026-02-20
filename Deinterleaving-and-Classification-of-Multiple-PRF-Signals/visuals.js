
class RadarSignalVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = 300;
        this.pulses = [];
        this.time = 0;
        this.speed = 2;

        this.init();
        this.animate();
    }

    init() {
        // Create initial pulses
        for(let i=0; i<10; i++) {
            this.addPulse(i * 100 + Math.random() * 20);
        }
    }

    addPulse(x) {
        this.pulses.push({
            x: x,
            width: 20 + Math.random() * 10,
            height: 50 + Math.random() * 30,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`
        });
    }

    animate() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for(let i=0; i<this.width; i+=50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i - (this.time % 50), 0);
            this.ctx.lineTo(i - (this.time % 50), this.height);
            this.ctx.stroke();
        }

        // Draw pulses
        this.pulses.forEach((pulse, index) => {
            pulse.x -= this.speed;

            // Draw pulse
            this.ctx.fillStyle = pulse.color;
            this.ctx.fillRect(pulse.x, this.height/2 - pulse.height, pulse.width, pulse.height);

            // Text info (TOA/PW)
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`PW:${Math.floor(pulse.width)}`, pulse.x, this.height/2 - pulse.height - 5);
        });

        // Remove off-screen pulses and add new ones
        if (this.pulses.length > 0 && this.pulses[0].x + this.pulses[0].width < 0) {
            this.pulses.shift();
        }

        if (this.pulses.length < 15) {
            let lastX = this.pulses[this.pulses.length-1].x;
            if (lastX < this.width) {
                this.addPulse(lastX + 50 + Math.random() * 100);
            }
        }

        this.time += this.speed;
        requestAnimationFrame(() => this.animate());
    }
}


class FlowChartAnimator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flow-container">
                <div class="flow-node" id="node-radars">15 Radars</div>
                <div class="flow-arrow">➡</div>
                <div class="flow-node" id="node-params">PRI/PW Params</div>
                <div class="flow-arrow">➡</div>
                <div class="flow-node" id="node-gen">Signal Generator</div>
                <div class="flow-arrow">➡</div>
                <div class="flow-node" id="node-qpse">QPSE Encoding</div>
                <div class="flow-arrow">➡</div>
                <div class="flow-node" id="node-nn">Neural Network</div>
                <div class="flow-arrow">➡</div>
                <div class="flow-node" id="node-output">Classified Output</div>
            </div>
        `;

        this.startAnimation();
    }

    startAnimation() {
        const nodes = this.container.querySelectorAll('.flow-node');
        nodes.forEach((node, index) => {
            node.style.animation = `pulseNode 2s infinite ${index * 0.5}s`;
        });
    }
}

// Initialize when loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('radarCanvas')) {
        new RadarSignalVisualizer('radarCanvas');
    }
    if (document.getElementById('flowChart')) {
        new FlowChartAnimator('flowChart');
    }
});

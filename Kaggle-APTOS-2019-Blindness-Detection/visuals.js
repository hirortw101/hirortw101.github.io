
class RetinaGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.data = [
            { src: 'dr0.jpg', title: 'Grade 0: No DR', desc: 'Healthy retina with no abnormalities.' },
            { src: 'dr1.jpg', title: 'Grade 1: Mild DR', desc: 'Microaneurysms only.' },
            { src: 'dr2.jpg', title: 'Grade 2: Moderate DR', desc: 'Microaneurysms and retinal hemorrhages.' },
            { src: 'dr3.jpg', title: 'Grade 3: Severe DR', desc: 'Severe intraretinal hemorrhages and microvascular abnormalities.' },
            { src: 'dr4.jpg', title: 'Grade 4: Proliferative DR', desc: 'Neovascularization and vitreous/preretinal hemorrhage.' }
        ];

        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="gallery-view">
                <img id="gallery-img" src="${this.data[0].src}" alt="${this.data[0].title}">
                <div class="gallery-controls">
                    <button id="prev-btn">❮</button>
                    <div class="gallery-info">
                        <h3 id="gallery-title">${this.data[0].title}</h3>
                        <p id="gallery-desc">${this.data[0].desc}</p>
                    </div>
                    <button id="next-btn">❯</button>
                </div>
            </div>
            <div class="gallery-thumbs">
                ${this.data.map((item, index) =>
                    `<img src="${item.src}" class="thumb ${index===0?'active':''}" data-index="${index}">`
                ).join('')}
            </div>
        `;

        this.img = document.getElementById('gallery-img');
        this.title = document.getElementById('gallery-title');
        this.desc = document.getElementById('gallery-desc');
        this.thumbs = this.container.querySelectorAll('.thumb');

        document.getElementById('prev-btn').addEventListener('click', () => this.changeIndex(-1));
        document.getElementById('next-btn').addEventListener('click', () => this.changeIndex(1));

        this.thumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.setIndex(index);
            });
        });
    }

    changeIndex(delta) {
        let newIndex = this.currentIndex + delta;
        if (newIndex < 0) newIndex = this.data.length - 1;
        if (newIndex >= this.data.length) newIndex = 0;
        this.setIndex(newIndex);
    }

    setIndex(index) {
        this.currentIndex = index;
        const item = this.data[index];

        // Fade out
        this.img.style.opacity = 0;
        setTimeout(() => {
            this.img.src = item.src;
            this.title.textContent = item.title;
            this.desc.textContent = item.desc;
            this.img.style.opacity = 1;
        }, 300);

        // Update thumbs
        this.thumbs.forEach(t => t.classList.remove('active'));
        this.thumbs[index].classList.add('active');
    }
}

class AugmentationSimulator {
    constructor(canvasId, imageSrc) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.image = new Image();
        this.image.src = imageSrc;

        this.width = 300;
        this.height = 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.image.onload = () => {
            this.animate();
        };
    }

    applyAugmentations() {
        // Random transforms
        const angle = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25 rad
        const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const brightness = 0.5 + Math.random(); // 0.5 to 1.5
        const flip = Math.random() > 0.5;

        this.ctx.save();

        // Clear background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Center pivot
        this.ctx.translate(this.width/2, this.height/2);
        this.ctx.rotate(angle);
        this.ctx.scale(flip ? -scale : scale, scale);
        this.ctx.filter = `brightness(${brightness})`;

        // Draw image centered
        this.ctx.drawImage(this.image, -150, -150, 300, 300);

        this.ctx.restore();

        // Overlay text
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, this.height-30, this.width, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Aug: Rot:${(angle*57).toFixed(1)}° Sc:${scale.toFixed(2)} Br:${brightness.toFixed(2)}`, 10, this.height-10);
    }

    animate() {
        this.applyAugmentations();
        setTimeout(() => requestAnimationFrame(() => this.animate()), 1500); // Update every 1.5s
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RetinaGallery('retina-gallery');
    new AugmentationSimulator('aug-canvas', 'dr2.jpg');
});

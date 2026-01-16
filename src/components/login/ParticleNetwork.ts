export class ParticleNetwork {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: any[] = [];
    private mouse: { x: number | null; y: number | null } = { x: null, y: null };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not get canvas context");
        this.ctx = context;
        this.resize();
        this.init();

        window.addEventListener("resize", () => this.resize());
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener("mouseout", () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        this.particles = [];
        const particleCount = Math.min(
            window.innerWidth * 0.2,
            250,
        );

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 2,
                baseX: 0,
                baseY: 0,
            });
        }
    }

    animate() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
        );

        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;

            if (this.mouse.x != null && this.mouse.y != null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceRadius = 150;

                if (distance < forceRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force =
                        (forceRadius - distance) / forceRadius;
                    const directionX = forceDirectionX * force * 3;
                    const directionY = forceDirectionY * force * 3;

                    p.x += directionX;
                    p.y += directionY;
                }
            }

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Configuración Neon Sutil
            this.ctx.shadowBlur = 8; // Glow suave
            this.ctx.shadowColor = "rgba(59, 130, 246, 0.5)"; // Azul brillante tenue

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            // Núcleo más brillante y "cyber"
            this.ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
            this.ctx.fill();

            // Reset shadow para las líneas (para que no se vean borrosas)
            this.ctx.shadowBlur = 0;

            for (
                let j = index + 1;
                j < this.particles.length;
                j++
            ) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 - distance / 1000})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

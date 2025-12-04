class SpinWheel {
  constructor(canvas, segments) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.segments = segments;
    this.angle = 0;
    this.spinning = false;
    this.onSpinEnd = null;
  }

  draw() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const anglePerSegment = (2 * Math.PI) / this.segments.length;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.segments.forEach((seg, i) => {
      const startAngle = this.angle + i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = seg.color;
      this.ctx.fill();
      this.ctx.stroke();

      // Label
      const labelAngle = startAngle + anglePerSegment / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(seg.name, labelX, labelY);
    });

    // Pointer
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius - 10);
    this.ctx.lineTo(centerX - 10, centerY - radius);
    this.ctx.lineTo(centerX + 10, centerY - radius);
    this.ctx.closePath();
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
  }

  spin(duration = 3000, onEnd) {
    if (this.spinning) return;
    this.spinning = true;
    this.onSpinEnd = onEnd;
    const startTime = Date.now();
    const startAngle = this.angle;
    const totalRotation = Math.PI * 2 * 5 + Math.random() * Math.PI * 2; // Random spin

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out
      this.angle = startAngle + totalRotation * easedProgress;
      this.draw();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.spinning = false;
        if (this.onSpinEnd) this.onSpinEnd();
      }
    };
    animate();
  }

  getWinningSegment() {
    const anglePerSegment = (2 * Math.PI) / this.segments.length;
    const normalizedAngle = (this.angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = Math.floor((2 * Math.PI - normalizedAngle) / anglePerSegment) % this.segments.length;
    return this.segments[winningIndex];
  }
}
// ============ SPIDER CHART ============
class SpiderChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.chart = null;
    this.api = new ProfileDataAPI();
  }

  // ===== LOAD DATA =====
  async loadData() {
    try {
      const container = this.canvas.parentElement;
      container.innerHTML = `
        <div class="loading" style="min-height: 300px;">
          <div class="spinner"></div>
          <p>Memuat data kompetensi...</p>
        </div>
      `;

      const data = await this.api.getChartData();
      
      // Render chart
      this.render(data);
    } catch (error) {
      console.error('Error load chart:', error);
      this.canvas.parentElement.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--gray);">
          <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 15px; color: var(--danger);"></i>
          <h3>Gagal Memuat Chart</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
            <i class="fas fa-sync"></i> Coba Lagi
          </button>
        </div>
      `;
    }
  }

  // ===== RENDER =====
  render(data) {
    if (!data || !data.labels || data.labels.length === 0) {
      this.canvas.parentElement.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--gray);">
          <i class="fas fa-chart-pie" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
          <h3>Belum Ada Data Kompetensi</h3>
          <p>Data dimensi kompetensi belum tersedia untuk ASN ini.</p>
        </div>
      `;
      return;
    }

    // Hapus loading
    this.canvas.parentElement.innerHTML = '';
    this.canvas.parentElement.appendChild(this.canvas);

    // Gunakan CDN Chart.js jika belum ada
    if (typeof Chart === 'undefined') {
      this.loadChartJs(() => this.renderChart(data));
    } else {
      this.renderChart(data);
    }
  }

  // ===== RENDER CHART =====
  renderChart(data) {
    if (this.chart) {
      this.chart.destroy();
    }

    const colors = [
      'rgba(37, 99, 235, 0.8)',
      'rgba(124, 58, 237, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ];

    const datasets = data.datasets.map((dataset, index) => ({
      label: dataset.label || 'Kompetensi',
      data: dataset.data,
      backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
      borderColor: colors[index % colors.length],
      borderWidth: 2,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }));

    this.chart = new Chart(this.canvas, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12,
                weight: '600'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.r || 0;
                return `${label}: ${value.toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              font: {
                size: 12,
                weight: '600'
              },
              color: '#1e293b'
            }
          }
        }
      }
    });
  }

  // ===== LOAD CHART.JS =====
  loadChartJs(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }
}

window.SpiderChart = SpiderChart;

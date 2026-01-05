import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neon-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center">
      <div class="neon-loader">
        <!-- Círculo exterior con segmentos -->
        <svg class="loader-ring" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Anillo base -->
          <circle class="ring-base" cx="100" cy="100" r="80" />
          
          <!-- Segmentos animados -->
          <circle class="ring-segment segment-1" cx="100" cy="100" r="80" />
          <circle class="ring-segment segment-2" cx="100" cy="100" r="80" />
          <circle class="ring-segment segment-3" cx="100" cy="100" r="80" />
          
          <!-- Partículas orbitales -->
          <circle class="particle particle-1" r="3" />
          <circle class="particle particle-2" r="2" />
          <circle class="particle particle-3" r="2.5" />
        </svg>
        
        <!-- Centro brillante -->
        <div class="loader-core">
          <div class="core-inner"></div>
          <div class="core-glow"></div>
        </div>
        
        <!-- Rayos radiales -->
        <div class="rays-container">
          <div class="ray ray-1"></div>
          <div class="ray ray-2"></div>
          <div class="ray ray-3"></div>
          <div class="ray ray-4"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .neon-loader {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .loader-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      animation: rotate 3s linear infinite;
    }

    .ring-base {
      fill: none;
      stroke: rgba(59, 130, 246, 0.1);
      stroke-width: 2;
    }

    .ring-segment {
      fill: none;
      stroke: #3b82f6;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 20 480;
      filter: drop-shadow(0 0 8px #3b82f6) drop-shadow(0 0 15px #3b82f6);
    }

    .segment-1 {
      stroke-dashoffset: 0;
      animation: dash 2s ease-in-out infinite;
    }

    .segment-2 {
      stroke-dashoffset: -170;
      animation: dash 2s ease-in-out infinite 0.3s;
      opacity: 0.8;
    }

    .segment-3 {
      stroke-dashoffset: -340;
      animation: dash 2s ease-in-out infinite 0.6s;
      opacity: 0.6;
    }

    .particle {
      fill: #60a5fa;
      filter: drop-shadow(0 0 4px #60a5fa);
    }

    .particle-1 {
      animation: orbit 2s linear infinite;
    }

    .particle-2 {
      animation: orbit 2.5s linear infinite reverse;
    }

    .particle-3 {
      animation: orbit 3s linear infinite;
    }

    .loader-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
    }

    .core-inner {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, #fff 0%, #60a5fa 50%, transparent 70%);
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .core-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(8px);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .rays-container {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      animation: rotate 4s linear infinite reverse;
    }

    .ray {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2px;
      height: 40px;
      background: linear-gradient(to bottom, #60a5fa, transparent);
      transform-origin: center top;
      filter: drop-shadow(0 0 4px #3b82f6);
      animation: fadeRay 2s ease-in-out infinite;
    }

    .ray-1 {
      transform: translate(-50%, -50%) rotate(0deg);
    }

    .ray-2 {
      transform: translate(-50%, -50%) rotate(90deg);
      animation-delay: 0.5s;
    }

    .ray-3 {
      transform: translate(-50%, -50%) rotate(180deg);
      animation-delay: 1s;
    }

    .ray-4 {
      transform: translate(-50%, -50%) rotate(270deg);
      animation-delay: 1.5s;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes dash {
      0%, 100% {
        stroke-dasharray: 20 480;
      }
      50% {
        stroke-dasharray: 150 350;
      }
    }

    @keyframes orbit {
      0% {
        cx: 180;
        cy: 100;
      }
      25% {
        cx: 100;
        cy: 20;
      }
      50% {
        cx: 20;
        cy: 100;
      }
      75% {
        cx: 100;
        cy: 180;
      }
      100% {
        cx: 180;
        cy: 100;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }

    @keyframes fadeRay {
      0%, 100% {
        opacity: 0.3;
        height: 40px;
      }
      50% {
        opacity: 1;
        height: 50px;
      }
    }
  `]
})
export class NeonLoaderComponent {}

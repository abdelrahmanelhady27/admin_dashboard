import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div
      class="skeleton"
      [class.skeleton--circle]="variant === 'circle'"
      [class.skeleton--text]="variant === 'text'"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius">
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }
    .skeleton--circle { border-radius: 50%; }
    .skeleton--text { border-radius: 4px; }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() variant: 'rect' | 'circle' | 'text' = 'rect';
  @Input() radius = '';
}

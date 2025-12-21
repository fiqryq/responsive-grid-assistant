import type { GridSettings } from "../types";

export class GridOverlay {
  private container: HTMLElement | null = null;
  private settings: GridSettings;
  private resizeObserver: ResizeObserver | null = null;

  constructor(settings: GridSettings) {
    this.settings = settings;
  }

  create(): void {
    console.log('GridOverlay.create() called');
    this.remove();

    this.container = document.createElement("div");
    this.container.id = "grid-assistant-overlay";
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      justify-content: center;
      opacity: ${this.settings.opacity};
      background: rgba(255, 0, 0, 0.1);
    `;

    console.log('Creating overlay container:', this.container);
    this.updateGrid();
    document.body.appendChild(this.container);
    console.log('Overlay added to body, checking if it exists:', document.getElementById('grid-assistant-overlay'));

    this.setupResizeObserver();
  }

  update(settings: GridSettings): void {
    this.settings = settings;

    if (this.container) {
      this.updateGrid();
      this.container.style.opacity = settings.opacity.toString();
    }
  }

  remove(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private updateGrid(): void {
    if (!this.container) return;

    const gridContainer = document.createElement("div");
    gridContainer.style.cssText = `
      display: flex;
      width: 100%;
      max-width: ${this.settings.maxWidth}px;
      height: 100%;
      gap: ${this.settings.gutter}px;
      padding: 0 ${this.settings.margin}px;
    `;

    for (let i = 0; i < this.settings.columns; i++) {
      const column = document.createElement("div");
      column.style.cssText = `
        flex: 1;
        height: 100%;
        background-color: ${this.settings.color};
        opacity: 0.1;
      `;
      gridContainer.appendChild(column);
    }

    this.container.innerHTML = "";
    this.container.appendChild(gridContainer);

    if (this.settings.showGrid) {
      this.addGridLines();
    }
  }

  private addGridLines(): void {
    if (!this.container) return;

    const gridLines = document.createElement("div");
    gridLines.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    const viewportWidth = window.innerWidth;
    const containerWidth = Math.min(viewportWidth, this.settings.maxWidth);
    const containerLeft = (viewportWidth - containerWidth) / 2;

    const totalGutterWidth = (this.settings.columns - 1) * this.settings.gutter;
    const totalMarginWidth = this.settings.margin * 2;
    const availableWidth = containerWidth - totalGutterWidth - totalMarginWidth;
    const columnWidth = availableWidth / this.settings.columns;

    for (let i = 0; i <= this.settings.columns; i++) {
      const line = document.createElement("div");
      const position =
        containerLeft +
        this.settings.margin +
        i * (columnWidth + this.settings.gutter);

      line.style.cssText = `
        position: absolute;
        top: 0;
        left: ${position}px;
        width: 1px;
        height: 100%;
        background-color: ${this.settings.color};
        opacity: 0.3;
      `;
      gridLines.appendChild(line);
    }

    this.container.appendChild(gridLines);
  }

  private setupResizeObserver(): void {
    if (!this.container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateGrid();
    });

    this.resizeObserver.observe(document.body);
  }
}

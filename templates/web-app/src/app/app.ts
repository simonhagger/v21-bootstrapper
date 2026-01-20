import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";

/**
 * Root application component
 * - Standalone component with CommonModule and RouterOutlet
 * - RouterOutlet displays routed content
 */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ["./app.css"],
})
export class AppComponent {
  title = "acme-web";
}

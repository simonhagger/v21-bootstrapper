import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Responsive Service
 *
 * Provides comprehensive responsive design and platform detection using Angular CDK.
 * Applies semantic classes to <html> element for responsive styling and platform detection.
 *
 * **CDK Integration:**
 * - BreakpointObserver: Tailwind CSS v4 breakpoint detection (xs/sm/md/lg/xl/2xl)
 * - Platform service: SSR-safe platform checks (isBrowser, etc.)
 * - UserAgent parsing: Reliable browser and OS detection with SSR checks
 *
 * **Tailwind Breakpoints:**
 * - xs: default (< 640px)
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 *
 * **Available Observables:**
 * Breakpoints: isSm$, isMd$, isLg$, isXl$, is2xl$, currentBreakpoint$
 * Devices: isMobile$, isTablet$, isDesktop$
 * Orientation: isPortrait$, isLandscape$
 * Complete state: state$ (all properties in ResponsiveState)
 *
 * **HTML Classes Applied:**
 * Breakpoints: bp-xs, bp-sm, bp-md, bp-lg, bp-xl, bp-2xl
 * Devices: mobile, tablet, desktop
 * Orientation: orientation-portrait, orientation-landscape
 * Platform: platform-[os], browser-[browser], os-[os]
 * Touch: touch-enabled, touch-disabled
 * Color scheme: prefers-dark, prefers-light
 */

export type TailwindBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveState {
  breakpoint: TailwindBreakpoint;
  isMobile: boolean;        // xs, sm
  isTablet: boolean;        // md, lg
  isDesktop: boolean;       // xl, 2xl
  isPortrait: boolean;
  isLandscape: boolean;
  isTouchEnabled: boolean;
  platform: 'mobile' | 'tablet' | 'desktop';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'other';
  prefersDark: boolean;
}

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private breakpointObserver = inject(BreakpointObserver);
  private cdkPlatform = inject(Platform);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Tailwind CSS v4 breakpoint definitions (aligned with Tailwind)
  private readonly TAILWIND_BREAKPOINTS = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  };

  // Breakpoint observables (Tailwind-aligned)
  readonly isSm$ = this.observe(this.TAILWIND_BREAKPOINTS.sm);
  readonly isMd$ = this.observe(this.TAILWIND_BREAKPOINTS.md);
  readonly isLg$ = this.observe(this.TAILWIND_BREAKPOINTS.lg);
  readonly isXl$ = this.observe(this.TAILWIND_BREAKPOINTS.xl);
  readonly is2xl$ = this.observe(this.TAILWIND_BREAKPOINTS['2xl']);

  // Device type observables
  readonly isMobile$: Observable<boolean> = this.observe(
    `(max-width: 639px)` // xs only
  );

  readonly isTablet$: Observable<boolean> = this.observe(
    `(min-width: 768px) and (max-width: 1023px)` // md, lg
  );

  readonly isDesktop$: Observable<boolean> = this.observe(
    `(min-width: 1024px)` // lg and up
  );

  // Orientation
  readonly isPortrait$ = this.observe('(orientation: portrait)');
  readonly isLandscape$ = this.observe('(orientation: landscape)');

  // Current breakpoint (Tailwind-aligned)
  readonly currentBreakpoint$: Observable<TailwindBreakpoint> = this.breakpointObserver
    .observe([
      this.TAILWIND_BREAKPOINTS.sm,
      this.TAILWIND_BREAKPOINTS.md,
      this.TAILWIND_BREAKPOINTS.lg,
      this.TAILWIND_BREAKPOINTS.xl,
      this.TAILWIND_BREAKPOINTS['2xl'],
    ])
    .pipe(
      map(result => {
        // Check from largest to smallest to avoid overlap
        if (result.breakpoints[this.TAILWIND_BREAKPOINTS['2xl']]) return '2xl';
        if (result.breakpoints[this.TAILWIND_BREAKPOINTS.xl]) return 'xl';
        if (result.breakpoints[this.TAILWIND_BREAKPOINTS.lg]) return 'lg';
        if (result.breakpoints[this.TAILWIND_BREAKPOINTS.md]) return 'md';
        if (result.breakpoints[this.TAILWIND_BREAKPOINTS.sm]) return 'sm';
        return 'xs'; // default
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );

  // Complete responsive state
  readonly state$: Observable<ResponsiveState> = this.currentBreakpoint$.pipe(
    map(breakpoint => {
      const isMobile = !this.checkMatch(this.TAILWIND_BREAKPOINTS.sm);
      const isTablet = this.checkMatch(this.TAILWIND_BREAKPOINTS.md) &&
                      !this.checkMatch(this.TAILWIND_BREAKPOINTS.lg);
      const isDesktop = this.checkMatch(this.TAILWIND_BREAKPOINTS.lg);

      return {
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait: this.isBrowser && this.checkMatch('(orientation: portrait)'),
        isLandscape: this.isBrowser && this.checkMatch('(orientation: landscape)'),
        isTouchEnabled: this.isBrowser && this.detectTouch(),
        platform: (isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile') as 'mobile' | 'tablet' | 'desktop',
        browser: this.detectBrowser(),
        os: this.detectOS(),
        prefersDark: this.isBrowser && this.getPrefersDark(),
      };
    }),
    shareReplay(1)
  );

  constructor() {
    if (this.isBrowser) {
      this.applyClassesToHtml();
    }
  }

  private observe(mediaQuery: string): Observable<boolean> {
    return this.breakpointObserver.observe(mediaQuery).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private checkMatch(mediaQuery: string): boolean {
    return this.breakpointObserver.isMatched(mediaQuery);
  }

  private applyClassesToHtml(): void {
    const html = document.documentElement;

    // Apply Tailwind breakpoint classes
    this.currentBreakpoint$.subscribe(bp => {
      html.classList.remove('bp-xs', 'bp-sm', 'bp-md', 'bp-lg', 'bp-xl', 'bp-2xl');
      html.classList.add(`bp-${bp}`);
    });

    // Apply device type classes
    this.isMobile$.subscribe(match => {
      html.classList.toggle('mobile', match);
    });

    this.isTablet$.subscribe(match => {
      html.classList.toggle('tablet', match);
    });

    this.isDesktop$.subscribe(match => {
      html.classList.toggle('desktop', match);
    });

    // Apply orientation classes
    this.isPortrait$.subscribe(match => {
      html.classList.toggle('orientation-portrait', match);
      html.classList.toggle('orientation-landscape', !match);
    });

    // Apply platform classes (static, detected once)
    const platform = this.detectPlatform();
    html.classList.add(`platform-${platform}`);

    // Apply browser classes (static, detected once)
    const browser = this.detectBrowser();
    html.classList.add(`browser-${browser}`);

    // Apply OS classes (static, detected once)
    const os = this.detectOS();
    html.classList.add(`os-${os}`);

    // Apply touch classes
    const touchEnabled = this.detectTouch();
    html.classList.toggle('touch-enabled', touchEnabled);
    html.classList.toggle('touch-disabled', !touchEnabled);

    // Apply color scheme preference (dynamic)
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateColorScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      html.classList.toggle('prefers-dark', e.matches);
      html.classList.toggle('prefers-light', !e.matches);
    };
    updateColorScheme(darkModeQuery);
    darkModeQuery.addEventListener('change', updateColorScheme);
  }

  private detectTouch(): boolean {
    if (!this.cdkPlatform.isBrowser) return false;
    // eslint-disable-next-line no-undef
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private detectPlatform(): 'mobile' | 'tablet' | 'desktop' {
    if (this.checkMatch(this.TAILWIND_BREAKPOINTS.lg)) return 'desktop';
    if (this.checkMatch(this.TAILWIND_BREAKPOINTS.md)) return 'tablet';
    return 'mobile';
  }

  private detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
    // Use Platform service for SSR safety, userAgent parsing for detection
    if (!this.cdkPlatform.isBrowser) return 'other';
    // eslint-disable-next-line no-undef
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('edg/')) return 'edge';
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
    return 'other';
  }

  private detectOS(): 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'other' {
    // Use Platform service for SSR safety, userAgent parsing for detection
    if (!this.cdkPlatform.isBrowser) return 'other';
    // eslint-disable-next-line no-undef
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('android')) return 'android';
    return 'other';
  }

  private getPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

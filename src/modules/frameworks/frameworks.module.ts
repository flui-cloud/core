import { Module } from '@nestjs/common';
import { FrameworkCoreModule } from './framework-core';
import { NextJsDetectorModule } from './detectors/nextjs';
import { AngularDetectorModule } from './detectors/angular';
import { NestJsDetectorModule } from './detectors/nestjs';
import { ReactRouterDetectorModule } from './detectors/react-router';
import { RemixDetectorModule } from './detectors/remix';
import { NuxtDetectorModule } from './detectors/nuxt';
import { SvelteKitDetectorModule } from './detectors/svelte-kit';
import { ReactViteDetectorModule } from './detectors/react-vite';
import { AstroDetectorModule } from './detectors/astro';
import { VueViteDetectorModule } from './detectors/vue-vite';
import { TanStackStartDetectorModule } from './detectors/tanstack-start';
import { FastHtmlDetectorModule } from './detectors/fasthtml';
import { FastApiDetectorModule } from './detectors/fastapi';
import { DjangoDetectorModule } from './detectors/django';
import { RailsDetectorModule } from './detectors/rails';
import { SpringBootDetectorModule } from './detectors/spring-boot';
import { LaravelDetectorModule } from './detectors/laravel';
import { GoDetectorModule } from './detectors/go';
import { FlaskDetectorModule } from './detectors/flask';
import { AspNetCoreDetectorModule } from './detectors/aspnet-core';
import { PhoenixDetectorModule } from './detectors/phoenix';
import { ExpressDetectorModule } from './detectors/express';
import { StaticHtmlDetectorModule } from './detectors/static-html';
import { GenericNodeDetectorModule } from './detectors/generic-node';
import { GenericPythonDetectorModule } from './detectors/generic-python';

/**
 * Frameworks Module
 * Aggregates all framework detection and deployment functionality
 */
@Module({
  imports: [
    FrameworkCoreModule,
    // Detector modules (registered in priority order — higher priority wins on conflict)
    NextJsDetectorModule, // Priority: 85
    AngularDetectorModule, // Priority: 80
    ReactRouterDetectorModule, // Priority: 77
    RemixDetectorModule, // Priority: 76
    NestJsDetectorModule, // Priority: 75
    NuxtDetectorModule, // Priority: 74
    SvelteKitDetectorModule, // Priority: 73
    ReactViteDetectorModule, // Priority: 72
    AstroDetectorModule, // Priority: 71
    VueViteDetectorModule, // Priority: 70
    TanStackStartDetectorModule, // Priority: 68
    FastApiDetectorModule, // Priority: 67
    FastHtmlDetectorModule, // Priority: 66
    DjangoDetectorModule, // Priority: 65
    RailsDetectorModule, // Priority: 64
    SpringBootDetectorModule, // Priority: 63
    LaravelDetectorModule, // Priority: 61
    GoDetectorModule, // Priority: 62 (NOTE: Go > Laravel)
    FlaskDetectorModule, // Priority: 60
    AspNetCoreDetectorModule, // Priority: 59
    PhoenixDetectorModule, // Priority: 58
    ExpressDetectorModule, // Priority: 55
    StaticHtmlDetectorModule, // Priority: 40
    GenericNodeDetectorModule, // Priority: 30
    GenericPythonDetectorModule, // Priority: 25
  ],
  exports: [FrameworkCoreModule],
})
export class FrameworksModule {}

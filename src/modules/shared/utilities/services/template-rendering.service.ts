import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateRenderingService {
  private readonly logger = new Logger(TemplateRenderingService.name);

  constructor() {
    this.registerHelpers();
  }

  renderHandlebars(template: string, context: Record<string, any>): string {
    try {
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error('Failed to render Handlebars template', error.stack);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  validateTemplate(template: string): boolean {
    try {
      Handlebars.compile(template);
      return true;
    } catch (error) {
      this.logger.warn(`Template validation failed: ${error.message}`);
      return false;
    }
  }

  private registerHelpers(): void {
    Handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    Handlebars.registerHelper('ne', function (a, b) {
      return a !== b;
    });

    Handlebars.registerHelper('lt', function (a, b) {
      return a < b;
    });

    Handlebars.registerHelper('gt', function (a, b) {
      return a > b;
    });

    Handlebars.registerHelper('and', function (...args) {
      args.pop();
      return args.every(Boolean);
    });

    Handlebars.registerHelper('or', function (...args) {
      args.pop();
      return args.some(Boolean);
    });

    Handlebars.registerHelper('uppercase', function (str: string) {
      return str ? str.toUpperCase() : '';
    });

    Handlebars.registerHelper('lowercase', function (str: string) {
      return str ? str.toLowerCase() : '';
    });

    Handlebars.registerHelper('default', function (value, defaultValue) {
      return value ?? defaultValue;
    });

    Handlebars.registerHelper('json', function (context) {
      return JSON.stringify(context, null, 2);
    });

    Handlebars.registerHelper(
      'replace',
      function (str: string, search: string, replace: string) {
        if (!str || typeof str !== 'string') return str;
        return str.replaceAll(new RegExp(search, 'g'), replace);
      },
    );

    Handlebars.registerHelper('trim', function (str: string) {
      return str ? str.trim() : '';
    });

    Handlebars.registerHelper(
      'split',
      function (str: string, delimiter: string) {
        if (!str || typeof str !== 'string') return [];
        return str.split(delimiter);
      },
    );

    Handlebars.registerHelper('join', function (arr: any[], delimiter: string) {
      if (!Array.isArray(arr)) return '';
      return arr.join(delimiter);
    });
  }

  precompileTemplate(template: string): HandlebarsTemplateDelegate {
    try {
      return Handlebars.compile(template);
    } catch (error) {
      this.logger.error('Failed to precompile template', error.stack);
      throw new Error(`Template precompilation failed: ${error.message}`);
    }
  }

  renderPrecompiled(
    compiledTemplate: HandlebarsTemplateDelegate,
    context: Record<string, any>,
  ): string {
    try {
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error('Failed to render precompiled template', error.stack);
      throw new Error(
        `Precompiled template rendering failed: ${error.message}`,
      );
    }
  }
}

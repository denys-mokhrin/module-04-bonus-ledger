import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule, CONTEXT_MODULES } from './app.module';

describe('AppModule', () => {
  it('wires exactly the five bounded contexts from docs/bc-map.md', () => {
    expect(CONTEXT_MODULES.map((m) => m.name)).toEqual([
      'IdentityModule',
      'IntegrationsModule',
      'ContributionModule',
      'BonusReviewModule',
      'BillingModule',
    ]);
    const imports: unknown[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);
    for (const contextModule of CONTEXT_MODULES) expect(imports).toContain(contextModule);
  });
});

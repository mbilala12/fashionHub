import { Page, ConsoleMessage } from '@playwright/test';

export type ConsoleSummary = {
  errors: ConsoleMessage[];
  warnings: ConsoleMessage[];
  others: ConsoleMessage[];
};

export async function watchConsole(page: Page): Promise<ConsoleSummary> {
  const errors: ConsoleMessage[] = [];
  const warnings: ConsoleMessage[] = [];
  const others: ConsoleMessage[] = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error') errors.push(msg);
    else if (type === 'warning') warnings.push(msg);
    else others.push(msg);
  });
  return { errors, warnings, others };
}

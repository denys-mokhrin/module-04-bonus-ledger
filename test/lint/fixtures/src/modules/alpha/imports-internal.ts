// (a) FORBIDDEN: another context's non-public path
import { betaService } from '../beta/internal/service';

export const leak = betaService;

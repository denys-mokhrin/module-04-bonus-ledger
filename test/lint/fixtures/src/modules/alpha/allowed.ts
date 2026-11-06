// ALLOWED: own internals, another context's public/, src/shared
import { sharedValue } from '../../shared/ok';
import { betaPublic } from '../beta/public';
import { alphaService } from './internal/service';

export const allowed = sharedValue + betaPublic + alphaService;

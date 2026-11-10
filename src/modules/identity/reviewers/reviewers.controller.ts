import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/validation';
import type { Reviewer } from './reviewer';
import { ReviewersService } from './reviewers.service';

const createReviewerBody = z.object({
  // Temporary: the tenant comes from the request body until auth exists; auth will supply companyId instead.
  companyId: z.uuid(),
  displayName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

@Controller('reviewers')
export class ReviewersController {
  constructor(private readonly reviewers: ReviewersService) {}

  @Post()
  @HttpCode(201)
  create(
    @Body(new ZodValidationPipe(createReviewerBody)) body: z.output<typeof createReviewerBody>,
  ): Promise<Reviewer> {
    return this.reviewers.create(body);
  }

  @Get(':id')
  get(@Param('id', new ZodValidationPipe(z.uuid())) id: string): Promise<Reviewer> {
    return this.reviewers.get(id);
  }
}

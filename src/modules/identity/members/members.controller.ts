import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/validation';
import { MEMBER_ROLES } from './member';
import type { Member } from './member';
import { MembersService } from './members.service';

const createMemberBody = z.object({
  // Temporary: the tenant comes from the request body until auth exists; auth will supply companyId instead.
  companyId: z.uuid(),
  teamId: z.uuid(),
  displayName: z.string().trim().min(1),
  role: z.enum(MEMBER_ROLES),
});

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createMemberBody)) body: z.output<typeof createMemberBody>): Promise<Member> {
    return this.members.create(body);
  }

  @Get(':id')
  get(@Param('id', new ZodValidationPipe(z.uuid())) id: string): Promise<Member> {
    return this.members.get(id);
  }
}

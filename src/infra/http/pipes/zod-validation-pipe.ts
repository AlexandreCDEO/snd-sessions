import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(', ')
        throw new BadRequestException({
          message: 'Dados inválidos',
          statusCode: 400,
          erros: errorMessages,
        })
      }

      throw new BadRequestException('Dados inválidos')
    }
    return value
  }
}

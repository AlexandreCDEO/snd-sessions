import { UseCaseError } from 'src/core/entities/use-case-error'

export class InvalidCurrentPasswordError extends Error implements UseCaseError {
  constructor() {
    super('Senha Atual inválida. Verifique!')
  }
}

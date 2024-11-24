import { UseCaseError } from 'src/core/entities/use-case-error'

export class NewPasswordEqualError extends Error implements UseCaseError {
  constructor() {
    super('A nova senha deve ser diferente a senha atual. Verifique!')
  }
}

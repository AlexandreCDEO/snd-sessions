import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordOnlyNumbersError extends Error implements UseCaseError {
  constructor() {
    super('A senha deve conter apenas números. Verifique!')
  }
}

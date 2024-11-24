import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordRecentlyUsedError extends Error implements UseCaseError {
  constructor(numberOfDays: number) {
    super(
      `A nova senha já foi utilizada nos últimos ${numberOfDays} dias. Escolha uma senha diferente.`,
    )
  }
}

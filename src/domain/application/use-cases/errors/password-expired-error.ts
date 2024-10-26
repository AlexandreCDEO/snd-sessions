import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordExpiredError extends Error implements UseCaseError {
  constructor() {
    super('Senha expirada. Verfifique!')
  }
}

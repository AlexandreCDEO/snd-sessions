import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordMissmatchError extends Error implements UseCaseError {
  constructor() {
    super('A nova senha e a confirmação de senha não são iguais.')
  }
}

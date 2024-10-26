import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordIsEmptyError extends Error implements UseCaseError {
  constructor() {
    super('Você não está autorizado à utilizar este sistema')
  }
}

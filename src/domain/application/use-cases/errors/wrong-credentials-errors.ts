import { UseCaseError } from 'src/core/entities/use-case-error'

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Credenciais inválidas. Verifique!')
  }
}

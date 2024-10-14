import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordEncryptionError extends Error implements UseCaseError {
  constructor() {
    super('Erro no processe de criptografia de senha. Tente mais tarde.')
  }
}

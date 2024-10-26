import { UseCaseError } from 'src/core/entities/use-case-error'

export class UserOccurrencyError extends Error implements UseCaseError {
  constructor() {
    super(
      'Ocorreu um erro inesperado ao gravar ocorrência do usuário, tente novamente mais tarde!',
    )
  }
}

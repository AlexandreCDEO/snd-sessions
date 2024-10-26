import { UseCaseError } from 'src/core/entities/use-case-error'

export class StudentBlockedError extends Error implements UseCaseError {
  constructor() {
    super(
      'Usuário BLOQUEADO. Entre em contato com a área responsável pela administração do controle de acesso.',
    )
  }
}

import { UseCaseError } from 'src/core/entities/use-case-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Recurso não encontrado.')
  }
}

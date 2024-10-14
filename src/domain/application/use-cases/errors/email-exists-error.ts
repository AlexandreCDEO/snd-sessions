import { UseCaseError } from 'src/core/entities/use-case-error'

export class EmailExistsError extends Error implements UseCaseError {
  constructor() {
    super('Já existe um usuário cadastrado com este email. Verifique!')
  }
}

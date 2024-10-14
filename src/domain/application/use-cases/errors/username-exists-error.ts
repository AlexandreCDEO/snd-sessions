import { UseCaseError } from 'src/core/entities/use-case-error'

export class UsernameExistsError extends Error implements UseCaseError {
  constructor() {
    super('Já existe um usuário cadastrado com este usuário. Verifique!')
  }
}

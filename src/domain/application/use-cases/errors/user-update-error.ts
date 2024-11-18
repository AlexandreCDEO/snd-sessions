import { UseCaseError } from 'src/core/entities/use-case-error'

export class UserUpdateError extends Error implements UseCaseError {
  constructor() {
    super('Error ao atualizar os dados do usuário. Tente novamente')
  }
}

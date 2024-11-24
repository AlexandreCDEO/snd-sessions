import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordComplexityError extends Error implements UseCaseError {
  constructor() {
    super(
      'A senha deve conter números, letras e caracteres especiais. Verifique!',
    )
  }
}

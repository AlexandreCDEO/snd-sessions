import { UseCaseError } from 'src/core/entities/use-case-error'

export class MinumunNumberDigitsForPasswordError
  extends Error
  implements UseCaseError
{
  constructor(minimunDigits: number) {
    super(`Nova senha deve conter no minimo ${minimunDigits} caracteres.`)
  }
}

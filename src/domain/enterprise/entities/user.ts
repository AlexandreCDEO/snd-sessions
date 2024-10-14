import { UserStatus } from 'src/core/enums/user-status'
import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'
import { randomInt } from 'crypto'

interface UserProps {
  id: number
  name: string
  email: string
  username: string
  password: string
  createdAt: Date
  status: UserStatus
  temporaryPassword: boolean
  isBlocked: boolean
  active: boolean
}

export class User extends Entity<UserProps> {
  get id() {
    return this.props.id
  }

  get username() {
    return this.props.username
  }

  get password() {
    return this.props.password
  }

  get isActive() {
    return this.props.active
  }

  get isBlocked() {
    return this.props.isBlocked
  }

  get createdAt() {
    return this.props.createdAt
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get temporaryPassword() {
    return this.props.temporaryPassword
  }

  get status() {
    return this.props.status
  }

  static create(
    props: Optional<
      UserProps,
      | 'id'
      | 'createdAt'
      | 'status'
      | 'temporaryPassword'
      | 'isBlocked'
      | 'active'
    >,
  ) {
    const user = new User({
      ...props,
      id: props.id ?? randomInt(100, 999999),
      createdAt: props.createdAt ?? new Date(),
      status: props.status ?? UserStatus.ACTIVE,
      temporaryPassword: props.temporaryPassword ?? false,
      isBlocked: props.isBlocked ?? false,
      active: props.active ?? true,
    })

    return user
  }
}

export abstract class SecUserPassRepository {
  abstract searchByUserId(userId: number): Promise<Date | null>
  abstract isPasswordReusable(
    userId: number,
    newPassword: string,
    numberOfDays: number,
  ): Promise<boolean>
}

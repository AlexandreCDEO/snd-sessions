export abstract class SecUserPassRepository {
  abstract searchByUserId(userId: number): Promise<Date | null>
}

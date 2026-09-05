
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Admin
 * 
 */
export type Admin = $Result.DefaultSelection<Prisma.$AdminPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model SystemLog
 * 
 */
export type SystemLog = $Result.DefaultSelection<Prisma.$SystemLogPayload>
/**
 * Model MilkCategory
 * 
 */
export type MilkCategory = $Result.DefaultSelection<Prisma.$MilkCategoryPayload>
/**
 * Model MilkProduction
 * 
 */
export type MilkProduction = $Result.DefaultSelection<Prisma.$MilkProductionPayload>
/**
 * Model PackagedProduct
 * 
 */
export type PackagedProduct = $Result.DefaultSelection<Prisma.$PackagedProductPayload>
/**
 * Model MilkPackaging
 * 
 */
export type MilkPackaging = $Result.DefaultSelection<Prisma.$MilkPackagingPayload>
/**
 * Model MilkOutflow
 * 
 */
export type MilkOutflow = $Result.DefaultSelection<Prisma.$MilkOutflowPayload>
/**
 * Model MilkSale
 * 
 */
export type MilkSale = $Result.DefaultSelection<Prisma.$MilkSalePayload>
/**
 * Model Piutang
 * 
 */
export type Piutang = $Result.DefaultSelection<Prisma.$PiutangPayload>
/**
 * Model PelunasanPiutang
 * 
 */
export type PelunasanPiutang = $Result.DefaultSelection<Prisma.$PelunasanPiutangPayload>
/**
 * Model BastDocument
 * 
 */
export type BastDocument = $Result.DefaultSelection<Prisma.$BastDocumentPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Admins
 * const admins = await prisma.admin.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Admins
   * const admins = await prisma.admin.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.admin`: Exposes CRUD operations for the **Admin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Admins
    * const admins = await prisma.admin.findMany()
    * ```
    */
  get admin(): Prisma.AdminDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.systemLog`: Exposes CRUD operations for the **SystemLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemLogs
    * const systemLogs = await prisma.systemLog.findMany()
    * ```
    */
  get systemLog(): Prisma.SystemLogDelegate<ExtArgs>;

  /**
   * `prisma.milkCategory`: Exposes CRUD operations for the **MilkCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MilkCategories
    * const milkCategories = await prisma.milkCategory.findMany()
    * ```
    */
  get milkCategory(): Prisma.MilkCategoryDelegate<ExtArgs>;

  /**
   * `prisma.milkProduction`: Exposes CRUD operations for the **MilkProduction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MilkProductions
    * const milkProductions = await prisma.milkProduction.findMany()
    * ```
    */
  get milkProduction(): Prisma.MilkProductionDelegate<ExtArgs>;

  /**
   * `prisma.packagedProduct`: Exposes CRUD operations for the **PackagedProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PackagedProducts
    * const packagedProducts = await prisma.packagedProduct.findMany()
    * ```
    */
  get packagedProduct(): Prisma.PackagedProductDelegate<ExtArgs>;

  /**
   * `prisma.milkPackaging`: Exposes CRUD operations for the **MilkPackaging** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MilkPackagings
    * const milkPackagings = await prisma.milkPackaging.findMany()
    * ```
    */
  get milkPackaging(): Prisma.MilkPackagingDelegate<ExtArgs>;

  /**
   * `prisma.milkOutflow`: Exposes CRUD operations for the **MilkOutflow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MilkOutflows
    * const milkOutflows = await prisma.milkOutflow.findMany()
    * ```
    */
  get milkOutflow(): Prisma.MilkOutflowDelegate<ExtArgs>;

  /**
   * `prisma.milkSale`: Exposes CRUD operations for the **MilkSale** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MilkSales
    * const milkSales = await prisma.milkSale.findMany()
    * ```
    */
  get milkSale(): Prisma.MilkSaleDelegate<ExtArgs>;

  /**
   * `prisma.piutang`: Exposes CRUD operations for the **Piutang** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Piutangs
    * const piutangs = await prisma.piutang.findMany()
    * ```
    */
  get piutang(): Prisma.PiutangDelegate<ExtArgs>;

  /**
   * `prisma.pelunasanPiutang`: Exposes CRUD operations for the **PelunasanPiutang** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PelunasanPiutangs
    * const pelunasanPiutangs = await prisma.pelunasanPiutang.findMany()
    * ```
    */
  get pelunasanPiutang(): Prisma.PelunasanPiutangDelegate<ExtArgs>;

  /**
   * `prisma.bastDocument`: Exposes CRUD operations for the **BastDocument** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BastDocuments
    * const bastDocuments = await prisma.bastDocument.findMany()
    * ```
    */
  get bastDocument(): Prisma.BastDocumentDelegate<ExtArgs>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Admin: 'Admin',
    User: 'User',
    SystemLog: 'SystemLog',
    MilkCategory: 'MilkCategory',
    MilkProduction: 'MilkProduction',
    PackagedProduct: 'PackagedProduct',
    MilkPackaging: 'MilkPackaging',
    MilkOutflow: 'MilkOutflow',
    MilkSale: 'MilkSale',
    Piutang: 'Piutang',
    PelunasanPiutang: 'PelunasanPiutang',
    BastDocument: 'BastDocument',
    Notification: 'Notification'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "admin" | "user" | "systemLog" | "milkCategory" | "milkProduction" | "packagedProduct" | "milkPackaging" | "milkOutflow" | "milkSale" | "piutang" | "pelunasanPiutang" | "bastDocument" | "notification"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Admin: {
        payload: Prisma.$AdminPayload<ExtArgs>
        fields: Prisma.AdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findFirst: {
            args: Prisma.AdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findMany: {
            args: Prisma.AdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          create: {
            args: Prisma.AdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          createMany: {
            args: Prisma.AdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          update: {
            args: Prisma.AdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          deleteMany: {
            args: Prisma.AdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          aggregate: {
            args: Prisma.AdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmin>
          }
          groupBy: {
            args: Prisma.AdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminCountArgs<ExtArgs>
            result: $Utils.Optional<AdminCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      SystemLog: {
        payload: Prisma.$SystemLogPayload<ExtArgs>
        fields: Prisma.SystemLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findFirst: {
            args: Prisma.SystemLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findMany: {
            args: Prisma.SystemLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>[]
          }
          create: {
            args: Prisma.SystemLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          createMany: {
            args: Prisma.SystemLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SystemLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          update: {
            args: Prisma.SystemLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          deleteMany: {
            args: Prisma.SystemLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          aggregate: {
            args: Prisma.SystemLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemLog>
          }
          groupBy: {
            args: Prisma.SystemLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemLogCountArgs<ExtArgs>
            result: $Utils.Optional<SystemLogCountAggregateOutputType> | number
          }
        }
      }
      MilkCategory: {
        payload: Prisma.$MilkCategoryPayload<ExtArgs>
        fields: Prisma.MilkCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MilkCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MilkCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          findFirst: {
            args: Prisma.MilkCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MilkCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          findMany: {
            args: Prisma.MilkCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>[]
          }
          create: {
            args: Prisma.MilkCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          createMany: {
            args: Prisma.MilkCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MilkCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          update: {
            args: Prisma.MilkCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          deleteMany: {
            args: Prisma.MilkCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MilkCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MilkCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkCategoryPayload>
          }
          aggregate: {
            args: Prisma.MilkCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMilkCategory>
          }
          groupBy: {
            args: Prisma.MilkCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<MilkCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.MilkCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<MilkCategoryCountAggregateOutputType> | number
          }
        }
      }
      MilkProduction: {
        payload: Prisma.$MilkProductionPayload<ExtArgs>
        fields: Prisma.MilkProductionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MilkProductionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MilkProductionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          findFirst: {
            args: Prisma.MilkProductionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MilkProductionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          findMany: {
            args: Prisma.MilkProductionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>[]
          }
          create: {
            args: Prisma.MilkProductionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          createMany: {
            args: Prisma.MilkProductionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MilkProductionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          update: {
            args: Prisma.MilkProductionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          deleteMany: {
            args: Prisma.MilkProductionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MilkProductionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MilkProductionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkProductionPayload>
          }
          aggregate: {
            args: Prisma.MilkProductionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMilkProduction>
          }
          groupBy: {
            args: Prisma.MilkProductionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MilkProductionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MilkProductionCountArgs<ExtArgs>
            result: $Utils.Optional<MilkProductionCountAggregateOutputType> | number
          }
        }
      }
      PackagedProduct: {
        payload: Prisma.$PackagedProductPayload<ExtArgs>
        fields: Prisma.PackagedProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackagedProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackagedProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          findFirst: {
            args: Prisma.PackagedProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackagedProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          findMany: {
            args: Prisma.PackagedProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>[]
          }
          create: {
            args: Prisma.PackagedProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          createMany: {
            args: Prisma.PackagedProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PackagedProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          update: {
            args: Prisma.PackagedProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          deleteMany: {
            args: Prisma.PackagedProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackagedProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PackagedProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagedProductPayload>
          }
          aggregate: {
            args: Prisma.PackagedProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackagedProduct>
          }
          groupBy: {
            args: Prisma.PackagedProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackagedProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackagedProductCountArgs<ExtArgs>
            result: $Utils.Optional<PackagedProductCountAggregateOutputType> | number
          }
        }
      }
      MilkPackaging: {
        payload: Prisma.$MilkPackagingPayload<ExtArgs>
        fields: Prisma.MilkPackagingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MilkPackagingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MilkPackagingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          findFirst: {
            args: Prisma.MilkPackagingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MilkPackagingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          findMany: {
            args: Prisma.MilkPackagingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>[]
          }
          create: {
            args: Prisma.MilkPackagingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          createMany: {
            args: Prisma.MilkPackagingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MilkPackagingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          update: {
            args: Prisma.MilkPackagingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          deleteMany: {
            args: Prisma.MilkPackagingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MilkPackagingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MilkPackagingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkPackagingPayload>
          }
          aggregate: {
            args: Prisma.MilkPackagingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMilkPackaging>
          }
          groupBy: {
            args: Prisma.MilkPackagingGroupByArgs<ExtArgs>
            result: $Utils.Optional<MilkPackagingGroupByOutputType>[]
          }
          count: {
            args: Prisma.MilkPackagingCountArgs<ExtArgs>
            result: $Utils.Optional<MilkPackagingCountAggregateOutputType> | number
          }
        }
      }
      MilkOutflow: {
        payload: Prisma.$MilkOutflowPayload<ExtArgs>
        fields: Prisma.MilkOutflowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MilkOutflowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MilkOutflowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          findFirst: {
            args: Prisma.MilkOutflowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MilkOutflowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          findMany: {
            args: Prisma.MilkOutflowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>[]
          }
          create: {
            args: Prisma.MilkOutflowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          createMany: {
            args: Prisma.MilkOutflowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MilkOutflowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          update: {
            args: Prisma.MilkOutflowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          deleteMany: {
            args: Prisma.MilkOutflowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MilkOutflowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MilkOutflowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkOutflowPayload>
          }
          aggregate: {
            args: Prisma.MilkOutflowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMilkOutflow>
          }
          groupBy: {
            args: Prisma.MilkOutflowGroupByArgs<ExtArgs>
            result: $Utils.Optional<MilkOutflowGroupByOutputType>[]
          }
          count: {
            args: Prisma.MilkOutflowCountArgs<ExtArgs>
            result: $Utils.Optional<MilkOutflowCountAggregateOutputType> | number
          }
        }
      }
      MilkSale: {
        payload: Prisma.$MilkSalePayload<ExtArgs>
        fields: Prisma.MilkSaleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MilkSaleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MilkSaleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          findFirst: {
            args: Prisma.MilkSaleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MilkSaleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          findMany: {
            args: Prisma.MilkSaleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>[]
          }
          create: {
            args: Prisma.MilkSaleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          createMany: {
            args: Prisma.MilkSaleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MilkSaleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          update: {
            args: Prisma.MilkSaleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          deleteMany: {
            args: Prisma.MilkSaleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MilkSaleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MilkSaleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MilkSalePayload>
          }
          aggregate: {
            args: Prisma.MilkSaleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMilkSale>
          }
          groupBy: {
            args: Prisma.MilkSaleGroupByArgs<ExtArgs>
            result: $Utils.Optional<MilkSaleGroupByOutputType>[]
          }
          count: {
            args: Prisma.MilkSaleCountArgs<ExtArgs>
            result: $Utils.Optional<MilkSaleCountAggregateOutputType> | number
          }
        }
      }
      Piutang: {
        payload: Prisma.$PiutangPayload<ExtArgs>
        fields: Prisma.PiutangFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PiutangFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PiutangFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          findFirst: {
            args: Prisma.PiutangFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PiutangFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          findMany: {
            args: Prisma.PiutangFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>[]
          }
          create: {
            args: Prisma.PiutangCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          createMany: {
            args: Prisma.PiutangCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PiutangDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          update: {
            args: Prisma.PiutangUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          deleteMany: {
            args: Prisma.PiutangDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PiutangUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PiutangUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PiutangPayload>
          }
          aggregate: {
            args: Prisma.PiutangAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePiutang>
          }
          groupBy: {
            args: Prisma.PiutangGroupByArgs<ExtArgs>
            result: $Utils.Optional<PiutangGroupByOutputType>[]
          }
          count: {
            args: Prisma.PiutangCountArgs<ExtArgs>
            result: $Utils.Optional<PiutangCountAggregateOutputType> | number
          }
        }
      }
      PelunasanPiutang: {
        payload: Prisma.$PelunasanPiutangPayload<ExtArgs>
        fields: Prisma.PelunasanPiutangFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PelunasanPiutangFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PelunasanPiutangFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          findFirst: {
            args: Prisma.PelunasanPiutangFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PelunasanPiutangFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          findMany: {
            args: Prisma.PelunasanPiutangFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>[]
          }
          create: {
            args: Prisma.PelunasanPiutangCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          createMany: {
            args: Prisma.PelunasanPiutangCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PelunasanPiutangDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          update: {
            args: Prisma.PelunasanPiutangUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          deleteMany: {
            args: Prisma.PelunasanPiutangDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PelunasanPiutangUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PelunasanPiutangUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PelunasanPiutangPayload>
          }
          aggregate: {
            args: Prisma.PelunasanPiutangAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePelunasanPiutang>
          }
          groupBy: {
            args: Prisma.PelunasanPiutangGroupByArgs<ExtArgs>
            result: $Utils.Optional<PelunasanPiutangGroupByOutputType>[]
          }
          count: {
            args: Prisma.PelunasanPiutangCountArgs<ExtArgs>
            result: $Utils.Optional<PelunasanPiutangCountAggregateOutputType> | number
          }
        }
      }
      BastDocument: {
        payload: Prisma.$BastDocumentPayload<ExtArgs>
        fields: Prisma.BastDocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BastDocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BastDocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          findFirst: {
            args: Prisma.BastDocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BastDocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          findMany: {
            args: Prisma.BastDocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>[]
          }
          create: {
            args: Prisma.BastDocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          createMany: {
            args: Prisma.BastDocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BastDocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          update: {
            args: Prisma.BastDocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          deleteMany: {
            args: Prisma.BastDocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BastDocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BastDocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BastDocumentPayload>
          }
          aggregate: {
            args: Prisma.BastDocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBastDocument>
          }
          groupBy: {
            args: Prisma.BastDocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<BastDocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.BastDocumentCountArgs<ExtArgs>
            result: $Utils.Optional<BastDocumentCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    logs: number
    productions: number
    packagings: number
    outflows: number
    sales: number
    bastDocuments: number
    packagedProducts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | UserCountOutputTypeCountLogsArgs
    productions?: boolean | UserCountOutputTypeCountProductionsArgs
    packagings?: boolean | UserCountOutputTypeCountPackagingsArgs
    outflows?: boolean | UserCountOutputTypeCountOutflowsArgs
    sales?: boolean | UserCountOutputTypeCountSalesArgs
    bastDocuments?: boolean | UserCountOutputTypeCountBastDocumentsArgs
    packagedProducts?: boolean | UserCountOutputTypeCountPackagedProductsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemLogWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProductionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkProductionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPackagingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkPackagingWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOutflowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkOutflowWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkSaleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBastDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BastDocumentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPackagedProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackagedProductWhereInput
  }


  /**
   * Count Type MilkCategoryCountOutputType
   */

  export type MilkCategoryCountOutputType = {
    productions: number
    packagings: number
    outflows: number
  }

  export type MilkCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    productions?: boolean | MilkCategoryCountOutputTypeCountProductionsArgs
    packagings?: boolean | MilkCategoryCountOutputTypeCountPackagingsArgs
    outflows?: boolean | MilkCategoryCountOutputTypeCountOutflowsArgs
  }

  // Custom InputTypes
  /**
   * MilkCategoryCountOutputType without action
   */
  export type MilkCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategoryCountOutputType
     */
    select?: MilkCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MilkCategoryCountOutputType without action
   */
  export type MilkCategoryCountOutputTypeCountProductionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkProductionWhereInput
  }

  /**
   * MilkCategoryCountOutputType without action
   */
  export type MilkCategoryCountOutputTypeCountPackagingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkPackagingWhereInput
  }

  /**
   * MilkCategoryCountOutputType without action
   */
  export type MilkCategoryCountOutputTypeCountOutflowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkOutflowWhereInput
  }


  /**
   * Count Type PiutangCountOutputType
   */

  export type PiutangCountOutputType = {
    pelunasan: number
  }

  export type PiutangCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pelunasan?: boolean | PiutangCountOutputTypeCountPelunasanArgs
  }

  // Custom InputTypes
  /**
   * PiutangCountOutputType without action
   */
  export type PiutangCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PiutangCountOutputType
     */
    select?: PiutangCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PiutangCountOutputType without action
   */
  export type PiutangCountOutputTypeCountPelunasanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PelunasanPiutangWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Admin
   */

  export type AggregateAdmin = {
    _count: AdminCountAggregateOutputType | null
    _avg: AdminAvgAggregateOutputType | null
    _sum: AdminSumAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  export type AdminAvgAggregateOutputType = {
    id: number | null
  }

  export type AdminSumAggregateOutputType = {
    id: number | null
  }

  export type AdminMinAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    role: string | null
    record_flag: string | null
  }

  export type AdminMaxAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    role: string | null
    record_flag: string | null
  }

  export type AdminCountAggregateOutputType = {
    id: number
    username: number
    password: number
    role: number
    record_flag: number
    _all: number
  }


  export type AdminAvgAggregateInputType = {
    id?: true
  }

  export type AdminSumAggregateInputType = {
    id?: true
  }

  export type AdminMinAggregateInputType = {
    id?: true
    username?: true
    password?: true
    role?: true
    record_flag?: true
  }

  export type AdminMaxAggregateInputType = {
    id?: true
    username?: true
    password?: true
    role?: true
    record_flag?: true
  }

  export type AdminCountAggregateInputType = {
    id?: true
    username?: true
    password?: true
    role?: true
    record_flag?: true
    _all?: true
  }

  export type AdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admin to aggregate.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Admins
    **/
    _count?: true | AdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AdminAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AdminSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminMaxAggregateInputType
  }

  export type GetAdminAggregateType<T extends AdminAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmin[P]>
      : GetScalarType<T[P], AggregateAdmin[P]>
  }




  export type AdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminWhereInput
    orderBy?: AdminOrderByWithAggregationInput | AdminOrderByWithAggregationInput[]
    by: AdminScalarFieldEnum[] | AdminScalarFieldEnum
    having?: AdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminCountAggregateInputType | true
    _avg?: AdminAvgAggregateInputType
    _sum?: AdminSumAggregateInputType
    _min?: AdminMinAggregateInputType
    _max?: AdminMaxAggregateInputType
  }

  export type AdminGroupByOutputType = {
    id: number
    username: string | null
    password: string | null
    role: string | null
    record_flag: string | null
    _count: AdminCountAggregateOutputType | null
    _avg: AdminAvgAggregateOutputType | null
    _sum: AdminSumAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  type GetAdminGroupByPayload<T extends AdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminGroupByOutputType[P]>
            : GetScalarType<T[P], AdminGroupByOutputType[P]>
        }
      >
    >


  export type AdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    role?: boolean
    record_flag?: boolean
  }, ExtArgs["result"]["admin"]>


  export type AdminSelectScalar = {
    id?: boolean
    username?: boolean
    password?: boolean
    role?: boolean
    record_flag?: boolean
  }


  export type $AdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Admin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string | null
      password: string | null
      role: string | null
      record_flag: string | null
    }, ExtArgs["result"]["admin"]>
    composites: {}
  }

  type AdminGetPayload<S extends boolean | null | undefined | AdminDefaultArgs> = $Result.GetResult<Prisma.$AdminPayload, S>

  type AdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AdminFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AdminCountAggregateInputType | true
    }

  export interface AdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Admin'], meta: { name: 'Admin' } }
    /**
     * Find zero or one Admin that matches the filter.
     * @param {AdminFindUniqueArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminFindUniqueArgs>(args: SelectSubset<T, AdminFindUniqueArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Admin that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AdminFindUniqueOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Admin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminFindFirstArgs>(args?: SelectSubset<T, AdminFindFirstArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Admin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Admins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Admins
     * const admins = await prisma.admin.findMany()
     * 
     * // Get first 10 Admins
     * const admins = await prisma.admin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminWithIdOnly = await prisma.admin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminFindManyArgs>(args?: SelectSubset<T, AdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Admin.
     * @param {AdminCreateArgs} args - Arguments to create a Admin.
     * @example
     * // Create one Admin
     * const Admin = await prisma.admin.create({
     *   data: {
     *     // ... data to create a Admin
     *   }
     * })
     * 
     */
    create<T extends AdminCreateArgs>(args: SelectSubset<T, AdminCreateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Admins.
     * @param {AdminCreateManyArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admin = await prisma.admin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminCreateManyArgs>(args?: SelectSubset<T, AdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Admin.
     * @param {AdminDeleteArgs} args - Arguments to delete one Admin.
     * @example
     * // Delete one Admin
     * const Admin = await prisma.admin.delete({
     *   where: {
     *     // ... filter to delete one Admin
     *   }
     * })
     * 
     */
    delete<T extends AdminDeleteArgs>(args: SelectSubset<T, AdminDeleteArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Admin.
     * @param {AdminUpdateArgs} args - Arguments to update one Admin.
     * @example
     * // Update one Admin
     * const admin = await prisma.admin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminUpdateArgs>(args: SelectSubset<T, AdminUpdateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Admins.
     * @param {AdminDeleteManyArgs} args - Arguments to filter Admins to delete.
     * @example
     * // Delete a few Admins
     * const { count } = await prisma.admin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminDeleteManyArgs>(args?: SelectSubset<T, AdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Admins
     * const admin = await prisma.admin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminUpdateManyArgs>(args: SelectSubset<T, AdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Admin.
     * @param {AdminUpsertArgs} args - Arguments to update or create a Admin.
     * @example
     * // Update or create a Admin
     * const admin = await prisma.admin.upsert({
     *   create: {
     *     // ... data to create a Admin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Admin we want to update
     *   }
     * })
     */
    upsert<T extends AdminUpsertArgs>(args: SelectSubset<T, AdminUpsertArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminCountArgs} args - Arguments to filter Admins to count.
     * @example
     * // Count the number of Admins
     * const count = await prisma.admin.count({
     *   where: {
     *     // ... the filter for the Admins we want to count
     *   }
     * })
    **/
    count<T extends AdminCountArgs>(
      args?: Subset<T, AdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminAggregateArgs>(args: Subset<T, AdminAggregateArgs>): Prisma.PrismaPromise<GetAdminAggregateType<T>>

    /**
     * Group by Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminGroupByArgs['orderBy'] }
        : { orderBy?: AdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Admin model
   */
  readonly fields: AdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Admin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Admin model
   */ 
  interface AdminFieldRefs {
    readonly id: FieldRef<"Admin", 'Int'>
    readonly username: FieldRef<"Admin", 'String'>
    readonly password: FieldRef<"Admin", 'String'>
    readonly role: FieldRef<"Admin", 'String'>
    readonly record_flag: FieldRef<"Admin", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Admin findUnique
   */
  export type AdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findUniqueOrThrow
   */
  export type AdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findFirst
   */
  export type AdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findFirstOrThrow
   */
  export type AdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findMany
   */
  export type AdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admins to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin create
   */
  export type AdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The data needed to create a Admin.
     */
    data?: XOR<AdminCreateInput, AdminUncheckedCreateInput>
  }

  /**
   * Admin createMany
   */
  export type AdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Admins.
     */
    data: AdminCreateManyInput | AdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Admin update
   */
  export type AdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The data needed to update a Admin.
     */
    data: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
    /**
     * Choose, which Admin to update.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin updateMany
   */
  export type AdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Admins.
     */
    data: XOR<AdminUpdateManyMutationInput, AdminUncheckedUpdateManyInput>
    /**
     * Filter which Admins to update
     */
    where?: AdminWhereInput
  }

  /**
   * Admin upsert
   */
  export type AdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The filter to search for the Admin to update in case it exists.
     */
    where: AdminWhereUniqueInput
    /**
     * In case the Admin found by the `where` argument doesn't exist, create a new Admin with this data.
     */
    create: XOR<AdminCreateInput, AdminUncheckedCreateInput>
    /**
     * In case the Admin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
  }

  /**
   * Admin delete
   */
  export type AdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter which Admin to delete.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin deleteMany
   */
  export type AdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admins to delete
     */
    where?: AdminWhereInput
  }

  /**
   * Admin without action
   */
  export type AdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    role: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    logs?: boolean | User$logsArgs<ExtArgs>
    productions?: boolean | User$productionsArgs<ExtArgs>
    packagings?: boolean | User$packagingsArgs<ExtArgs>
    outflows?: boolean | User$outflowsArgs<ExtArgs>
    sales?: boolean | User$salesArgs<ExtArgs>
    bastDocuments?: boolean | User$bastDocumentsArgs<ExtArgs>
    packagedProducts?: boolean | User$packagedProductsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>


  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | User$logsArgs<ExtArgs>
    productions?: boolean | User$productionsArgs<ExtArgs>
    packagings?: boolean | User$packagingsArgs<ExtArgs>
    outflows?: boolean | User$outflowsArgs<ExtArgs>
    sales?: boolean | User$salesArgs<ExtArgs>
    bastDocuments?: boolean | User$bastDocumentsArgs<ExtArgs>
    packagedProducts?: boolean | User$packagedProductsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      logs: Prisma.$SystemLogPayload<ExtArgs>[]
      productions: Prisma.$MilkProductionPayload<ExtArgs>[]
      packagings: Prisma.$MilkPackagingPayload<ExtArgs>[]
      outflows: Prisma.$MilkOutflowPayload<ExtArgs>[]
      sales: Prisma.$MilkSalePayload<ExtArgs>[]
      bastDocuments: Prisma.$BastDocumentPayload<ExtArgs>[]
      packagedProducts: Prisma.$PackagedProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      role: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    logs<T extends User$logsArgs<ExtArgs> = {}>(args?: Subset<T, User$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findMany"> | Null>
    productions<T extends User$productionsArgs<ExtArgs> = {}>(args?: Subset<T, User$productionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findMany"> | Null>
    packagings<T extends User$packagingsArgs<ExtArgs> = {}>(args?: Subset<T, User$packagingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findMany"> | Null>
    outflows<T extends User$outflowsArgs<ExtArgs> = {}>(args?: Subset<T, User$outflowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findMany"> | Null>
    sales<T extends User$salesArgs<ExtArgs> = {}>(args?: Subset<T, User$salesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findMany"> | Null>
    bastDocuments<T extends User$bastDocumentsArgs<ExtArgs> = {}>(args?: Subset<T, User$bastDocumentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findMany"> | Null>
    packagedProducts<T extends User$packagedProductsArgs<ExtArgs> = {}>(args?: Subset<T, User$packagedProductsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.logs
   */
  export type User$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    where?: SystemLogWhereInput
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    cursor?: SystemLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * User.productions
   */
  export type User$productionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    where?: MilkProductionWhereInput
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    cursor?: MilkProductionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkProductionScalarFieldEnum | MilkProductionScalarFieldEnum[]
  }

  /**
   * User.packagings
   */
  export type User$packagingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    where?: MilkPackagingWhereInput
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    cursor?: MilkPackagingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkPackagingScalarFieldEnum | MilkPackagingScalarFieldEnum[]
  }

  /**
   * User.outflows
   */
  export type User$outflowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    where?: MilkOutflowWhereInput
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    cursor?: MilkOutflowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkOutflowScalarFieldEnum | MilkOutflowScalarFieldEnum[]
  }

  /**
   * User.sales
   */
  export type User$salesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    where?: MilkSaleWhereInput
    orderBy?: MilkSaleOrderByWithRelationInput | MilkSaleOrderByWithRelationInput[]
    cursor?: MilkSaleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkSaleScalarFieldEnum | MilkSaleScalarFieldEnum[]
  }

  /**
   * User.bastDocuments
   */
  export type User$bastDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    where?: BastDocumentWhereInput
    orderBy?: BastDocumentOrderByWithRelationInput | BastDocumentOrderByWithRelationInput[]
    cursor?: BastDocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BastDocumentScalarFieldEnum | BastDocumentScalarFieldEnum[]
  }

  /**
   * User.packagedProducts
   */
  export type User$packagedProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    where?: PackagedProductWhereInput
    orderBy?: PackagedProductOrderByWithRelationInput | PackagedProductOrderByWithRelationInput[]
    cursor?: PackagedProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackagedProductScalarFieldEnum | PackagedProductScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model SystemLog
   */

  export type AggregateSystemLog = {
    _count: SystemLogCountAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  export type SystemLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    userEmail: string | null
    action: string | null
    level: string | null
    details: string | null
    createdAt: Date | null
  }

  export type SystemLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    userEmail: string | null
    action: string | null
    level: string | null
    details: string | null
    createdAt: Date | null
  }

  export type SystemLogCountAggregateOutputType = {
    id: number
    userId: number
    userEmail: number
    action: number
    level: number
    details: number
    createdAt: number
    _all: number
  }


  export type SystemLogMinAggregateInputType = {
    id?: true
    userId?: true
    userEmail?: true
    action?: true
    level?: true
    details?: true
    createdAt?: true
  }

  export type SystemLogMaxAggregateInputType = {
    id?: true
    userId?: true
    userEmail?: true
    action?: true
    level?: true
    details?: true
    createdAt?: true
  }

  export type SystemLogCountAggregateInputType = {
    id?: true
    userId?: true
    userEmail?: true
    action?: true
    level?: true
    details?: true
    createdAt?: true
    _all?: true
  }

  export type SystemLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLog to aggregate.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemLogs
    **/
    _count?: true | SystemLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemLogMaxAggregateInputType
  }

  export type GetSystemLogAggregateType<T extends SystemLogAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemLog[P]>
      : GetScalarType<T[P], AggregateSystemLog[P]>
  }




  export type SystemLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemLogWhereInput
    orderBy?: SystemLogOrderByWithAggregationInput | SystemLogOrderByWithAggregationInput[]
    by: SystemLogScalarFieldEnum[] | SystemLogScalarFieldEnum
    having?: SystemLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemLogCountAggregateInputType | true
    _min?: SystemLogMinAggregateInputType
    _max?: SystemLogMaxAggregateInputType
  }

  export type SystemLogGroupByOutputType = {
    id: string
    userId: string | null
    userEmail: string
    action: string
    level: string
    details: string | null
    createdAt: Date
    _count: SystemLogCountAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  type GetSystemLogGroupByPayload<T extends SystemLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
            : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
        }
      >
    >


  export type SystemLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    userEmail?: boolean
    action?: boolean
    level?: boolean
    details?: boolean
    createdAt?: boolean
    user?: boolean | SystemLog$userArgs<ExtArgs>
  }, ExtArgs["result"]["systemLog"]>


  export type SystemLogSelectScalar = {
    id?: boolean
    userId?: boolean
    userEmail?: boolean
    action?: boolean
    level?: boolean
    details?: boolean
    createdAt?: boolean
  }

  export type SystemLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | SystemLog$userArgs<ExtArgs>
  }

  export type $SystemLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      userEmail: string
      action: string
      level: string
      details: string | null
      createdAt: Date
    }, ExtArgs["result"]["systemLog"]>
    composites: {}
  }

  type SystemLogGetPayload<S extends boolean | null | undefined | SystemLogDefaultArgs> = $Result.GetResult<Prisma.$SystemLogPayload, S>

  type SystemLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SystemLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SystemLogCountAggregateInputType | true
    }

  export interface SystemLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemLog'], meta: { name: 'SystemLog' } }
    /**
     * Find zero or one SystemLog that matches the filter.
     * @param {SystemLogFindUniqueArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemLogFindUniqueArgs>(args: SelectSubset<T, SystemLogFindUniqueArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SystemLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SystemLogFindUniqueOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemLogFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SystemLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemLogFindFirstArgs>(args?: SelectSubset<T, SystemLogFindFirstArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SystemLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemLogFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SystemLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemLogs
     * const systemLogs = await prisma.systemLog.findMany()
     * 
     * // Get first 10 SystemLogs
     * const systemLogs = await prisma.systemLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemLogWithIdOnly = await prisma.systemLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemLogFindManyArgs>(args?: SelectSubset<T, SystemLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SystemLog.
     * @param {SystemLogCreateArgs} args - Arguments to create a SystemLog.
     * @example
     * // Create one SystemLog
     * const SystemLog = await prisma.systemLog.create({
     *   data: {
     *     // ... data to create a SystemLog
     *   }
     * })
     * 
     */
    create<T extends SystemLogCreateArgs>(args: SelectSubset<T, SystemLogCreateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SystemLogs.
     * @param {SystemLogCreateManyArgs} args - Arguments to create many SystemLogs.
     * @example
     * // Create many SystemLogs
     * const systemLog = await prisma.systemLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemLogCreateManyArgs>(args?: SelectSubset<T, SystemLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SystemLog.
     * @param {SystemLogDeleteArgs} args - Arguments to delete one SystemLog.
     * @example
     * // Delete one SystemLog
     * const SystemLog = await prisma.systemLog.delete({
     *   where: {
     *     // ... filter to delete one SystemLog
     *   }
     * })
     * 
     */
    delete<T extends SystemLogDeleteArgs>(args: SelectSubset<T, SystemLogDeleteArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SystemLog.
     * @param {SystemLogUpdateArgs} args - Arguments to update one SystemLog.
     * @example
     * // Update one SystemLog
     * const systemLog = await prisma.systemLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemLogUpdateArgs>(args: SelectSubset<T, SystemLogUpdateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SystemLogs.
     * @param {SystemLogDeleteManyArgs} args - Arguments to filter SystemLogs to delete.
     * @example
     * // Delete a few SystemLogs
     * const { count } = await prisma.systemLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemLogDeleteManyArgs>(args?: SelectSubset<T, SystemLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemLogs
     * const systemLog = await prisma.systemLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemLogUpdateManyArgs>(args: SelectSubset<T, SystemLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemLog.
     * @param {SystemLogUpsertArgs} args - Arguments to update or create a SystemLog.
     * @example
     * // Update or create a SystemLog
     * const systemLog = await prisma.systemLog.upsert({
     *   create: {
     *     // ... data to create a SystemLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemLog we want to update
     *   }
     * })
     */
    upsert<T extends SystemLogUpsertArgs>(args: SelectSubset<T, SystemLogUpsertArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogCountArgs} args - Arguments to filter SystemLogs to count.
     * @example
     * // Count the number of SystemLogs
     * const count = await prisma.systemLog.count({
     *   where: {
     *     // ... the filter for the SystemLogs we want to count
     *   }
     * })
    **/
    count<T extends SystemLogCountArgs>(
      args?: Subset<T, SystemLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemLogAggregateArgs>(args: Subset<T, SystemLogAggregateArgs>): Prisma.PrismaPromise<GetSystemLogAggregateType<T>>

    /**
     * Group by SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemLogGroupByArgs['orderBy'] }
        : { orderBy?: SystemLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemLog model
   */
  readonly fields: SystemLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends SystemLog$userArgs<ExtArgs> = {}>(args?: Subset<T, SystemLog$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemLog model
   */ 
  interface SystemLogFieldRefs {
    readonly id: FieldRef<"SystemLog", 'String'>
    readonly userId: FieldRef<"SystemLog", 'String'>
    readonly userEmail: FieldRef<"SystemLog", 'String'>
    readonly action: FieldRef<"SystemLog", 'String'>
    readonly level: FieldRef<"SystemLog", 'String'>
    readonly details: FieldRef<"SystemLog", 'String'>
    readonly createdAt: FieldRef<"SystemLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemLog findUnique
   */
  export type SystemLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findUniqueOrThrow
   */
  export type SystemLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findFirst
   */
  export type SystemLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findFirstOrThrow
   */
  export type SystemLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findMany
   */
  export type SystemLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter, which SystemLogs to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog create
   */
  export type SystemLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * The data needed to create a SystemLog.
     */
    data: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
  }

  /**
   * SystemLog createMany
   */
  export type SystemLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemLogs.
     */
    data: SystemLogCreateManyInput | SystemLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemLog update
   */
  export type SystemLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * The data needed to update a SystemLog.
     */
    data: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
    /**
     * Choose, which SystemLog to update.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog updateMany
   */
  export type SystemLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemLogs.
     */
    data: XOR<SystemLogUpdateManyMutationInput, SystemLogUncheckedUpdateManyInput>
    /**
     * Filter which SystemLogs to update
     */
    where?: SystemLogWhereInput
  }

  /**
   * SystemLog upsert
   */
  export type SystemLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * The filter to search for the SystemLog to update in case it exists.
     */
    where: SystemLogWhereUniqueInput
    /**
     * In case the SystemLog found by the `where` argument doesn't exist, create a new SystemLog with this data.
     */
    create: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
    /**
     * In case the SystemLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
  }

  /**
   * SystemLog delete
   */
  export type SystemLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
    /**
     * Filter which SystemLog to delete.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog deleteMany
   */
  export type SystemLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLogs to delete
     */
    where?: SystemLogWhereInput
  }

  /**
   * SystemLog.user
   */
  export type SystemLog$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * SystemLog without action
   */
  export type SystemLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemLogInclude<ExtArgs> | null
  }


  /**
   * Model MilkCategory
   */

  export type AggregateMilkCategory = {
    _count: MilkCategoryCountAggregateOutputType | null
    _min: MilkCategoryMinAggregateOutputType | null
    _max: MilkCategoryMaxAggregateOutputType | null
  }

  export type MilkCategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    productType: string | null
    animalType: string | null
    defaultPackaging: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkCategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    productType: string | null
    animalType: string | null
    defaultPackaging: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkCategoryCountAggregateOutputType = {
    id: number
    name: number
    code: number
    productType: number
    animalType: number
    defaultPackaging: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MilkCategoryMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    productType?: true
    animalType?: true
    defaultPackaging?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    productType?: true
    animalType?: true
    defaultPackaging?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkCategoryCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    productType?: true
    animalType?: true
    defaultPackaging?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MilkCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkCategory to aggregate.
     */
    where?: MilkCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkCategories to fetch.
     */
    orderBy?: MilkCategoryOrderByWithRelationInput | MilkCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MilkCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MilkCategories
    **/
    _count?: true | MilkCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MilkCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MilkCategoryMaxAggregateInputType
  }

  export type GetMilkCategoryAggregateType<T extends MilkCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateMilkCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMilkCategory[P]>
      : GetScalarType<T[P], AggregateMilkCategory[P]>
  }




  export type MilkCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkCategoryWhereInput
    orderBy?: MilkCategoryOrderByWithAggregationInput | MilkCategoryOrderByWithAggregationInput[]
    by: MilkCategoryScalarFieldEnum[] | MilkCategoryScalarFieldEnum
    having?: MilkCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MilkCategoryCountAggregateInputType | true
    _min?: MilkCategoryMinAggregateInputType
    _max?: MilkCategoryMaxAggregateInputType
  }

  export type MilkCategoryGroupByOutputType = {
    id: string
    name: string
    code: string
    productType: string
    animalType: string
    defaultPackaging: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: MilkCategoryCountAggregateOutputType | null
    _min: MilkCategoryMinAggregateOutputType | null
    _max: MilkCategoryMaxAggregateOutputType | null
  }

  type GetMilkCategoryGroupByPayload<T extends MilkCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MilkCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MilkCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MilkCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], MilkCategoryGroupByOutputType[P]>
        }
      >
    >


  export type MilkCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    productType?: boolean
    animalType?: boolean
    defaultPackaging?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    productions?: boolean | MilkCategory$productionsArgs<ExtArgs>
    packagings?: boolean | MilkCategory$packagingsArgs<ExtArgs>
    outflows?: boolean | MilkCategory$outflowsArgs<ExtArgs>
    _count?: boolean | MilkCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["milkCategory"]>


  export type MilkCategorySelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    productType?: boolean
    animalType?: boolean
    defaultPackaging?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MilkCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    productions?: boolean | MilkCategory$productionsArgs<ExtArgs>
    packagings?: boolean | MilkCategory$packagingsArgs<ExtArgs>
    outflows?: boolean | MilkCategory$outflowsArgs<ExtArgs>
    _count?: boolean | MilkCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $MilkCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MilkCategory"
    objects: {
      productions: Prisma.$MilkProductionPayload<ExtArgs>[]
      packagings: Prisma.$MilkPackagingPayload<ExtArgs>[]
      outflows: Prisma.$MilkOutflowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      productType: string
      animalType: string
      defaultPackaging: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["milkCategory"]>
    composites: {}
  }

  type MilkCategoryGetPayload<S extends boolean | null | undefined | MilkCategoryDefaultArgs> = $Result.GetResult<Prisma.$MilkCategoryPayload, S>

  type MilkCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MilkCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MilkCategoryCountAggregateInputType | true
    }

  export interface MilkCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MilkCategory'], meta: { name: 'MilkCategory' } }
    /**
     * Find zero or one MilkCategory that matches the filter.
     * @param {MilkCategoryFindUniqueArgs} args - Arguments to find a MilkCategory
     * @example
     * // Get one MilkCategory
     * const milkCategory = await prisma.milkCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MilkCategoryFindUniqueArgs>(args: SelectSubset<T, MilkCategoryFindUniqueArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MilkCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MilkCategoryFindUniqueOrThrowArgs} args - Arguments to find a MilkCategory
     * @example
     * // Get one MilkCategory
     * const milkCategory = await prisma.milkCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MilkCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, MilkCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MilkCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryFindFirstArgs} args - Arguments to find a MilkCategory
     * @example
     * // Get one MilkCategory
     * const milkCategory = await prisma.milkCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MilkCategoryFindFirstArgs>(args?: SelectSubset<T, MilkCategoryFindFirstArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MilkCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryFindFirstOrThrowArgs} args - Arguments to find a MilkCategory
     * @example
     * // Get one MilkCategory
     * const milkCategory = await prisma.milkCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MilkCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, MilkCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MilkCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MilkCategories
     * const milkCategories = await prisma.milkCategory.findMany()
     * 
     * // Get first 10 MilkCategories
     * const milkCategories = await prisma.milkCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const milkCategoryWithIdOnly = await prisma.milkCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MilkCategoryFindManyArgs>(args?: SelectSubset<T, MilkCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MilkCategory.
     * @param {MilkCategoryCreateArgs} args - Arguments to create a MilkCategory.
     * @example
     * // Create one MilkCategory
     * const MilkCategory = await prisma.milkCategory.create({
     *   data: {
     *     // ... data to create a MilkCategory
     *   }
     * })
     * 
     */
    create<T extends MilkCategoryCreateArgs>(args: SelectSubset<T, MilkCategoryCreateArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MilkCategories.
     * @param {MilkCategoryCreateManyArgs} args - Arguments to create many MilkCategories.
     * @example
     * // Create many MilkCategories
     * const milkCategory = await prisma.milkCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MilkCategoryCreateManyArgs>(args?: SelectSubset<T, MilkCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MilkCategory.
     * @param {MilkCategoryDeleteArgs} args - Arguments to delete one MilkCategory.
     * @example
     * // Delete one MilkCategory
     * const MilkCategory = await prisma.milkCategory.delete({
     *   where: {
     *     // ... filter to delete one MilkCategory
     *   }
     * })
     * 
     */
    delete<T extends MilkCategoryDeleteArgs>(args: SelectSubset<T, MilkCategoryDeleteArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MilkCategory.
     * @param {MilkCategoryUpdateArgs} args - Arguments to update one MilkCategory.
     * @example
     * // Update one MilkCategory
     * const milkCategory = await prisma.milkCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MilkCategoryUpdateArgs>(args: SelectSubset<T, MilkCategoryUpdateArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MilkCategories.
     * @param {MilkCategoryDeleteManyArgs} args - Arguments to filter MilkCategories to delete.
     * @example
     * // Delete a few MilkCategories
     * const { count } = await prisma.milkCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MilkCategoryDeleteManyArgs>(args?: SelectSubset<T, MilkCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MilkCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MilkCategories
     * const milkCategory = await prisma.milkCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MilkCategoryUpdateManyArgs>(args: SelectSubset<T, MilkCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MilkCategory.
     * @param {MilkCategoryUpsertArgs} args - Arguments to update or create a MilkCategory.
     * @example
     * // Update or create a MilkCategory
     * const milkCategory = await prisma.milkCategory.upsert({
     *   create: {
     *     // ... data to create a MilkCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MilkCategory we want to update
     *   }
     * })
     */
    upsert<T extends MilkCategoryUpsertArgs>(args: SelectSubset<T, MilkCategoryUpsertArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MilkCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryCountArgs} args - Arguments to filter MilkCategories to count.
     * @example
     * // Count the number of MilkCategories
     * const count = await prisma.milkCategory.count({
     *   where: {
     *     // ... the filter for the MilkCategories we want to count
     *   }
     * })
    **/
    count<T extends MilkCategoryCountArgs>(
      args?: Subset<T, MilkCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MilkCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MilkCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MilkCategoryAggregateArgs>(args: Subset<T, MilkCategoryAggregateArgs>): Prisma.PrismaPromise<GetMilkCategoryAggregateType<T>>

    /**
     * Group by MilkCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MilkCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MilkCategoryGroupByArgs['orderBy'] }
        : { orderBy?: MilkCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MilkCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMilkCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MilkCategory model
   */
  readonly fields: MilkCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MilkCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MilkCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    productions<T extends MilkCategory$productionsArgs<ExtArgs> = {}>(args?: Subset<T, MilkCategory$productionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findMany"> | Null>
    packagings<T extends MilkCategory$packagingsArgs<ExtArgs> = {}>(args?: Subset<T, MilkCategory$packagingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findMany"> | Null>
    outflows<T extends MilkCategory$outflowsArgs<ExtArgs> = {}>(args?: Subset<T, MilkCategory$outflowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MilkCategory model
   */ 
  interface MilkCategoryFieldRefs {
    readonly id: FieldRef<"MilkCategory", 'String'>
    readonly name: FieldRef<"MilkCategory", 'String'>
    readonly code: FieldRef<"MilkCategory", 'String'>
    readonly productType: FieldRef<"MilkCategory", 'String'>
    readonly animalType: FieldRef<"MilkCategory", 'String'>
    readonly defaultPackaging: FieldRef<"MilkCategory", 'String'>
    readonly description: FieldRef<"MilkCategory", 'String'>
    readonly createdAt: FieldRef<"MilkCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"MilkCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MilkCategory findUnique
   */
  export type MilkCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter, which MilkCategory to fetch.
     */
    where: MilkCategoryWhereUniqueInput
  }

  /**
   * MilkCategory findUniqueOrThrow
   */
  export type MilkCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter, which MilkCategory to fetch.
     */
    where: MilkCategoryWhereUniqueInput
  }

  /**
   * MilkCategory findFirst
   */
  export type MilkCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter, which MilkCategory to fetch.
     */
    where?: MilkCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkCategories to fetch.
     */
    orderBy?: MilkCategoryOrderByWithRelationInput | MilkCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkCategories.
     */
    cursor?: MilkCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkCategories.
     */
    distinct?: MilkCategoryScalarFieldEnum | MilkCategoryScalarFieldEnum[]
  }

  /**
   * MilkCategory findFirstOrThrow
   */
  export type MilkCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter, which MilkCategory to fetch.
     */
    where?: MilkCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkCategories to fetch.
     */
    orderBy?: MilkCategoryOrderByWithRelationInput | MilkCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkCategories.
     */
    cursor?: MilkCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkCategories.
     */
    distinct?: MilkCategoryScalarFieldEnum | MilkCategoryScalarFieldEnum[]
  }

  /**
   * MilkCategory findMany
   */
  export type MilkCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter, which MilkCategories to fetch.
     */
    where?: MilkCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkCategories to fetch.
     */
    orderBy?: MilkCategoryOrderByWithRelationInput | MilkCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MilkCategories.
     */
    cursor?: MilkCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkCategories.
     */
    skip?: number
    distinct?: MilkCategoryScalarFieldEnum | MilkCategoryScalarFieldEnum[]
  }

  /**
   * MilkCategory create
   */
  export type MilkCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a MilkCategory.
     */
    data: XOR<MilkCategoryCreateInput, MilkCategoryUncheckedCreateInput>
  }

  /**
   * MilkCategory createMany
   */
  export type MilkCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MilkCategories.
     */
    data: MilkCategoryCreateManyInput | MilkCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MilkCategory update
   */
  export type MilkCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a MilkCategory.
     */
    data: XOR<MilkCategoryUpdateInput, MilkCategoryUncheckedUpdateInput>
    /**
     * Choose, which MilkCategory to update.
     */
    where: MilkCategoryWhereUniqueInput
  }

  /**
   * MilkCategory updateMany
   */
  export type MilkCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MilkCategories.
     */
    data: XOR<MilkCategoryUpdateManyMutationInput, MilkCategoryUncheckedUpdateManyInput>
    /**
     * Filter which MilkCategories to update
     */
    where?: MilkCategoryWhereInput
  }

  /**
   * MilkCategory upsert
   */
  export type MilkCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the MilkCategory to update in case it exists.
     */
    where: MilkCategoryWhereUniqueInput
    /**
     * In case the MilkCategory found by the `where` argument doesn't exist, create a new MilkCategory with this data.
     */
    create: XOR<MilkCategoryCreateInput, MilkCategoryUncheckedCreateInput>
    /**
     * In case the MilkCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MilkCategoryUpdateInput, MilkCategoryUncheckedUpdateInput>
  }

  /**
   * MilkCategory delete
   */
  export type MilkCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    /**
     * Filter which MilkCategory to delete.
     */
    where: MilkCategoryWhereUniqueInput
  }

  /**
   * MilkCategory deleteMany
   */
  export type MilkCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkCategories to delete
     */
    where?: MilkCategoryWhereInput
  }

  /**
   * MilkCategory.productions
   */
  export type MilkCategory$productionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    where?: MilkProductionWhereInput
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    cursor?: MilkProductionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkProductionScalarFieldEnum | MilkProductionScalarFieldEnum[]
  }

  /**
   * MilkCategory.packagings
   */
  export type MilkCategory$packagingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    where?: MilkPackagingWhereInput
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    cursor?: MilkPackagingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkPackagingScalarFieldEnum | MilkPackagingScalarFieldEnum[]
  }

  /**
   * MilkCategory.outflows
   */
  export type MilkCategory$outflowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    where?: MilkOutflowWhereInput
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    cursor?: MilkOutflowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MilkOutflowScalarFieldEnum | MilkOutflowScalarFieldEnum[]
  }

  /**
   * MilkCategory without action
   */
  export type MilkCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
  }


  /**
   * Model MilkProduction
   */

  export type AggregateMilkProduction = {
    _count: MilkProductionCountAggregateOutputType | null
    _avg: MilkProductionAvgAggregateOutputType | null
    _sum: MilkProductionSumAggregateOutputType | null
    _min: MilkProductionMinAggregateOutputType | null
    _max: MilkProductionMaxAggregateOutputType | null
  }

  export type MilkProductionAvgAggregateOutputType = {
    grossVolumeLiters: number | null
    produksi: number | null
    pedetVolumeLiters: number | null
    setorPedet: number | null
    afkirVolumeLiters: number | null
    rusakAfkir: number | null
    usageVolumeLiters: number | null
    rawVolumeLiters: number | null
    kirimKePI: number | null
    processedLiters: number | null
    packagedQty: number | null
  }

  export type MilkProductionSumAggregateOutputType = {
    grossVolumeLiters: number | null
    produksi: number | null
    pedetVolumeLiters: number | null
    setorPedet: number | null
    afkirVolumeLiters: number | null
    rusakAfkir: number | null
    usageVolumeLiters: number | null
    rawVolumeLiters: number | null
    kirimKePI: number | null
    processedLiters: number | null
    packagedQty: number | null
  }

  export type MilkProductionMinAggregateOutputType = {
    id: string | null
    date: Date | null
    tanggal: Date | null
    categoryId: string | null
    productType: string | null
    animalType: string | null
    packagingType: string | null
    grossVolumeLiters: number | null
    produksi: number | null
    pedetVolumeLiters: number | null
    setorPedet: number | null
    afkirVolumeLiters: number | null
    rusakAfkir: number | null
    usageType: string | null
    usageVolumeLiters: number | null
    rawVolumeLiters: number | null
    kirimKePI: number | null
    processedLiters: number | null
    packagedQty: number | null
    status: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkProductionMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    tanggal: Date | null
    categoryId: string | null
    productType: string | null
    animalType: string | null
    packagingType: string | null
    grossVolumeLiters: number | null
    produksi: number | null
    pedetVolumeLiters: number | null
    setorPedet: number | null
    afkirVolumeLiters: number | null
    rusakAfkir: number | null
    usageType: string | null
    usageVolumeLiters: number | null
    rawVolumeLiters: number | null
    kirimKePI: number | null
    processedLiters: number | null
    packagedQty: number | null
    status: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkProductionCountAggregateOutputType = {
    id: number
    date: number
    tanggal: number
    categoryId: number
    productType: number
    animalType: number
    packagingType: number
    grossVolumeLiters: number
    produksi: number
    pedetVolumeLiters: number
    setorPedet: number
    afkirVolumeLiters: number
    rusakAfkir: number
    usageType: number
    usageVolumeLiters: number
    rawVolumeLiters: number
    kirimKePI: number
    processedLiters: number
    packagedQty: number
    status: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MilkProductionAvgAggregateInputType = {
    grossVolumeLiters?: true
    produksi?: true
    pedetVolumeLiters?: true
    setorPedet?: true
    afkirVolumeLiters?: true
    rusakAfkir?: true
    usageVolumeLiters?: true
    rawVolumeLiters?: true
    kirimKePI?: true
    processedLiters?: true
    packagedQty?: true
  }

  export type MilkProductionSumAggregateInputType = {
    grossVolumeLiters?: true
    produksi?: true
    pedetVolumeLiters?: true
    setorPedet?: true
    afkirVolumeLiters?: true
    rusakAfkir?: true
    usageVolumeLiters?: true
    rawVolumeLiters?: true
    kirimKePI?: true
    processedLiters?: true
    packagedQty?: true
  }

  export type MilkProductionMinAggregateInputType = {
    id?: true
    date?: true
    tanggal?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    grossVolumeLiters?: true
    produksi?: true
    pedetVolumeLiters?: true
    setorPedet?: true
    afkirVolumeLiters?: true
    rusakAfkir?: true
    usageType?: true
    usageVolumeLiters?: true
    rawVolumeLiters?: true
    kirimKePI?: true
    processedLiters?: true
    packagedQty?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkProductionMaxAggregateInputType = {
    id?: true
    date?: true
    tanggal?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    grossVolumeLiters?: true
    produksi?: true
    pedetVolumeLiters?: true
    setorPedet?: true
    afkirVolumeLiters?: true
    rusakAfkir?: true
    usageType?: true
    usageVolumeLiters?: true
    rawVolumeLiters?: true
    kirimKePI?: true
    processedLiters?: true
    packagedQty?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkProductionCountAggregateInputType = {
    id?: true
    date?: true
    tanggal?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    grossVolumeLiters?: true
    produksi?: true
    pedetVolumeLiters?: true
    setorPedet?: true
    afkirVolumeLiters?: true
    rusakAfkir?: true
    usageType?: true
    usageVolumeLiters?: true
    rawVolumeLiters?: true
    kirimKePI?: true
    processedLiters?: true
    packagedQty?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MilkProductionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkProduction to aggregate.
     */
    where?: MilkProductionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkProductions to fetch.
     */
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MilkProductionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkProductions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkProductions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MilkProductions
    **/
    _count?: true | MilkProductionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MilkProductionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MilkProductionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MilkProductionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MilkProductionMaxAggregateInputType
  }

  export type GetMilkProductionAggregateType<T extends MilkProductionAggregateArgs> = {
        [P in keyof T & keyof AggregateMilkProduction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMilkProduction[P]>
      : GetScalarType<T[P], AggregateMilkProduction[P]>
  }




  export type MilkProductionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkProductionWhereInput
    orderBy?: MilkProductionOrderByWithAggregationInput | MilkProductionOrderByWithAggregationInput[]
    by: MilkProductionScalarFieldEnum[] | MilkProductionScalarFieldEnum
    having?: MilkProductionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MilkProductionCountAggregateInputType | true
    _avg?: MilkProductionAvgAggregateInputType
    _sum?: MilkProductionSumAggregateInputType
    _min?: MilkProductionMinAggregateInputType
    _max?: MilkProductionMaxAggregateInputType
  }

  export type MilkProductionGroupByOutputType = {
    id: string
    date: Date
    tanggal: Date
    categoryId: string | null
    productType: string
    animalType: string
    packagingType: string
    grossVolumeLiters: number
    produksi: number
    pedetVolumeLiters: number
    setorPedet: number
    afkirVolumeLiters: number
    rusakAfkir: number
    usageType: string | null
    usageVolumeLiters: number
    rawVolumeLiters: number
    kirimKePI: number
    processedLiters: number
    packagedQty: number
    status: string
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: MilkProductionCountAggregateOutputType | null
    _avg: MilkProductionAvgAggregateOutputType | null
    _sum: MilkProductionSumAggregateOutputType | null
    _min: MilkProductionMinAggregateOutputType | null
    _max: MilkProductionMaxAggregateOutputType | null
  }

  type GetMilkProductionGroupByPayload<T extends MilkProductionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MilkProductionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MilkProductionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MilkProductionGroupByOutputType[P]>
            : GetScalarType<T[P], MilkProductionGroupByOutputType[P]>
        }
      >
    >


  export type MilkProductionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    tanggal?: boolean
    categoryId?: boolean
    productType?: boolean
    animalType?: boolean
    packagingType?: boolean
    grossVolumeLiters?: boolean
    produksi?: boolean
    pedetVolumeLiters?: boolean
    setorPedet?: boolean
    afkirVolumeLiters?: boolean
    rusakAfkir?: boolean
    usageType?: boolean
    usageVolumeLiters?: boolean
    rawVolumeLiters?: boolean
    kirimKePI?: boolean
    processedLiters?: boolean
    packagedQty?: boolean
    status?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | MilkProduction$categoryArgs<ExtArgs>
    createdBy?: boolean | MilkProduction$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["milkProduction"]>


  export type MilkProductionSelectScalar = {
    id?: boolean
    date?: boolean
    tanggal?: boolean
    categoryId?: boolean
    productType?: boolean
    animalType?: boolean
    packagingType?: boolean
    grossVolumeLiters?: boolean
    produksi?: boolean
    pedetVolumeLiters?: boolean
    setorPedet?: boolean
    afkirVolumeLiters?: boolean
    rusakAfkir?: boolean
    usageType?: boolean
    usageVolumeLiters?: boolean
    rawVolumeLiters?: boolean
    kirimKePI?: boolean
    processedLiters?: boolean
    packagedQty?: boolean
    status?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MilkProductionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | MilkProduction$categoryArgs<ExtArgs>
    createdBy?: boolean | MilkProduction$createdByArgs<ExtArgs>
  }

  export type $MilkProductionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MilkProduction"
    objects: {
      category: Prisma.$MilkCategoryPayload<ExtArgs> | null
      createdBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      tanggal: Date
      categoryId: string | null
      productType: string
      animalType: string
      packagingType: string
      grossVolumeLiters: number
      produksi: number
      pedetVolumeLiters: number
      setorPedet: number
      afkirVolumeLiters: number
      rusakAfkir: number
      usageType: string | null
      usageVolumeLiters: number
      rawVolumeLiters: number
      kirimKePI: number
      processedLiters: number
      packagedQty: number
      status: string
      notes: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["milkProduction"]>
    composites: {}
  }

  type MilkProductionGetPayload<S extends boolean | null | undefined | MilkProductionDefaultArgs> = $Result.GetResult<Prisma.$MilkProductionPayload, S>

  type MilkProductionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MilkProductionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MilkProductionCountAggregateInputType | true
    }

  export interface MilkProductionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MilkProduction'], meta: { name: 'MilkProduction' } }
    /**
     * Find zero or one MilkProduction that matches the filter.
     * @param {MilkProductionFindUniqueArgs} args - Arguments to find a MilkProduction
     * @example
     * // Get one MilkProduction
     * const milkProduction = await prisma.milkProduction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MilkProductionFindUniqueArgs>(args: SelectSubset<T, MilkProductionFindUniqueArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MilkProduction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MilkProductionFindUniqueOrThrowArgs} args - Arguments to find a MilkProduction
     * @example
     * // Get one MilkProduction
     * const milkProduction = await prisma.milkProduction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MilkProductionFindUniqueOrThrowArgs>(args: SelectSubset<T, MilkProductionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MilkProduction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionFindFirstArgs} args - Arguments to find a MilkProduction
     * @example
     * // Get one MilkProduction
     * const milkProduction = await prisma.milkProduction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MilkProductionFindFirstArgs>(args?: SelectSubset<T, MilkProductionFindFirstArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MilkProduction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionFindFirstOrThrowArgs} args - Arguments to find a MilkProduction
     * @example
     * // Get one MilkProduction
     * const milkProduction = await prisma.milkProduction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MilkProductionFindFirstOrThrowArgs>(args?: SelectSubset<T, MilkProductionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MilkProductions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MilkProductions
     * const milkProductions = await prisma.milkProduction.findMany()
     * 
     * // Get first 10 MilkProductions
     * const milkProductions = await prisma.milkProduction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const milkProductionWithIdOnly = await prisma.milkProduction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MilkProductionFindManyArgs>(args?: SelectSubset<T, MilkProductionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MilkProduction.
     * @param {MilkProductionCreateArgs} args - Arguments to create a MilkProduction.
     * @example
     * // Create one MilkProduction
     * const MilkProduction = await prisma.milkProduction.create({
     *   data: {
     *     // ... data to create a MilkProduction
     *   }
     * })
     * 
     */
    create<T extends MilkProductionCreateArgs>(args: SelectSubset<T, MilkProductionCreateArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MilkProductions.
     * @param {MilkProductionCreateManyArgs} args - Arguments to create many MilkProductions.
     * @example
     * // Create many MilkProductions
     * const milkProduction = await prisma.milkProduction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MilkProductionCreateManyArgs>(args?: SelectSubset<T, MilkProductionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MilkProduction.
     * @param {MilkProductionDeleteArgs} args - Arguments to delete one MilkProduction.
     * @example
     * // Delete one MilkProduction
     * const MilkProduction = await prisma.milkProduction.delete({
     *   where: {
     *     // ... filter to delete one MilkProduction
     *   }
     * })
     * 
     */
    delete<T extends MilkProductionDeleteArgs>(args: SelectSubset<T, MilkProductionDeleteArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MilkProduction.
     * @param {MilkProductionUpdateArgs} args - Arguments to update one MilkProduction.
     * @example
     * // Update one MilkProduction
     * const milkProduction = await prisma.milkProduction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MilkProductionUpdateArgs>(args: SelectSubset<T, MilkProductionUpdateArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MilkProductions.
     * @param {MilkProductionDeleteManyArgs} args - Arguments to filter MilkProductions to delete.
     * @example
     * // Delete a few MilkProductions
     * const { count } = await prisma.milkProduction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MilkProductionDeleteManyArgs>(args?: SelectSubset<T, MilkProductionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MilkProductions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MilkProductions
     * const milkProduction = await prisma.milkProduction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MilkProductionUpdateManyArgs>(args: SelectSubset<T, MilkProductionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MilkProduction.
     * @param {MilkProductionUpsertArgs} args - Arguments to update or create a MilkProduction.
     * @example
     * // Update or create a MilkProduction
     * const milkProduction = await prisma.milkProduction.upsert({
     *   create: {
     *     // ... data to create a MilkProduction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MilkProduction we want to update
     *   }
     * })
     */
    upsert<T extends MilkProductionUpsertArgs>(args: SelectSubset<T, MilkProductionUpsertArgs<ExtArgs>>): Prisma__MilkProductionClient<$Result.GetResult<Prisma.$MilkProductionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MilkProductions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionCountArgs} args - Arguments to filter MilkProductions to count.
     * @example
     * // Count the number of MilkProductions
     * const count = await prisma.milkProduction.count({
     *   where: {
     *     // ... the filter for the MilkProductions we want to count
     *   }
     * })
    **/
    count<T extends MilkProductionCountArgs>(
      args?: Subset<T, MilkProductionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MilkProductionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MilkProduction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MilkProductionAggregateArgs>(args: Subset<T, MilkProductionAggregateArgs>): Prisma.PrismaPromise<GetMilkProductionAggregateType<T>>

    /**
     * Group by MilkProduction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkProductionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MilkProductionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MilkProductionGroupByArgs['orderBy'] }
        : { orderBy?: MilkProductionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MilkProductionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMilkProductionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MilkProduction model
   */
  readonly fields: MilkProductionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MilkProduction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MilkProductionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends MilkProduction$categoryArgs<ExtArgs> = {}>(args?: Subset<T, MilkProduction$categoryArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    createdBy<T extends MilkProduction$createdByArgs<ExtArgs> = {}>(args?: Subset<T, MilkProduction$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MilkProduction model
   */ 
  interface MilkProductionFieldRefs {
    readonly id: FieldRef<"MilkProduction", 'String'>
    readonly date: FieldRef<"MilkProduction", 'DateTime'>
    readonly tanggal: FieldRef<"MilkProduction", 'DateTime'>
    readonly categoryId: FieldRef<"MilkProduction", 'String'>
    readonly productType: FieldRef<"MilkProduction", 'String'>
    readonly animalType: FieldRef<"MilkProduction", 'String'>
    readonly packagingType: FieldRef<"MilkProduction", 'String'>
    readonly grossVolumeLiters: FieldRef<"MilkProduction", 'Float'>
    readonly produksi: FieldRef<"MilkProduction", 'Float'>
    readonly pedetVolumeLiters: FieldRef<"MilkProduction", 'Float'>
    readonly setorPedet: FieldRef<"MilkProduction", 'Float'>
    readonly afkirVolumeLiters: FieldRef<"MilkProduction", 'Float'>
    readonly rusakAfkir: FieldRef<"MilkProduction", 'Float'>
    readonly usageType: FieldRef<"MilkProduction", 'String'>
    readonly usageVolumeLiters: FieldRef<"MilkProduction", 'Float'>
    readonly rawVolumeLiters: FieldRef<"MilkProduction", 'Float'>
    readonly kirimKePI: FieldRef<"MilkProduction", 'Float'>
    readonly processedLiters: FieldRef<"MilkProduction", 'Float'>
    readonly packagedQty: FieldRef<"MilkProduction", 'Int'>
    readonly status: FieldRef<"MilkProduction", 'String'>
    readonly notes: FieldRef<"MilkProduction", 'String'>
    readonly createdById: FieldRef<"MilkProduction", 'String'>
    readonly createdAt: FieldRef<"MilkProduction", 'DateTime'>
    readonly updatedAt: FieldRef<"MilkProduction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MilkProduction findUnique
   */
  export type MilkProductionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter, which MilkProduction to fetch.
     */
    where: MilkProductionWhereUniqueInput
  }

  /**
   * MilkProduction findUniqueOrThrow
   */
  export type MilkProductionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter, which MilkProduction to fetch.
     */
    where: MilkProductionWhereUniqueInput
  }

  /**
   * MilkProduction findFirst
   */
  export type MilkProductionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter, which MilkProduction to fetch.
     */
    where?: MilkProductionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkProductions to fetch.
     */
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkProductions.
     */
    cursor?: MilkProductionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkProductions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkProductions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkProductions.
     */
    distinct?: MilkProductionScalarFieldEnum | MilkProductionScalarFieldEnum[]
  }

  /**
   * MilkProduction findFirstOrThrow
   */
  export type MilkProductionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter, which MilkProduction to fetch.
     */
    where?: MilkProductionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkProductions to fetch.
     */
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkProductions.
     */
    cursor?: MilkProductionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkProductions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkProductions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkProductions.
     */
    distinct?: MilkProductionScalarFieldEnum | MilkProductionScalarFieldEnum[]
  }

  /**
   * MilkProduction findMany
   */
  export type MilkProductionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter, which MilkProductions to fetch.
     */
    where?: MilkProductionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkProductions to fetch.
     */
    orderBy?: MilkProductionOrderByWithRelationInput | MilkProductionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MilkProductions.
     */
    cursor?: MilkProductionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkProductions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkProductions.
     */
    skip?: number
    distinct?: MilkProductionScalarFieldEnum | MilkProductionScalarFieldEnum[]
  }

  /**
   * MilkProduction create
   */
  export type MilkProductionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * The data needed to create a MilkProduction.
     */
    data: XOR<MilkProductionCreateInput, MilkProductionUncheckedCreateInput>
  }

  /**
   * MilkProduction createMany
   */
  export type MilkProductionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MilkProductions.
     */
    data: MilkProductionCreateManyInput | MilkProductionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MilkProduction update
   */
  export type MilkProductionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * The data needed to update a MilkProduction.
     */
    data: XOR<MilkProductionUpdateInput, MilkProductionUncheckedUpdateInput>
    /**
     * Choose, which MilkProduction to update.
     */
    where: MilkProductionWhereUniqueInput
  }

  /**
   * MilkProduction updateMany
   */
  export type MilkProductionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MilkProductions.
     */
    data: XOR<MilkProductionUpdateManyMutationInput, MilkProductionUncheckedUpdateManyInput>
    /**
     * Filter which MilkProductions to update
     */
    where?: MilkProductionWhereInput
  }

  /**
   * MilkProduction upsert
   */
  export type MilkProductionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * The filter to search for the MilkProduction to update in case it exists.
     */
    where: MilkProductionWhereUniqueInput
    /**
     * In case the MilkProduction found by the `where` argument doesn't exist, create a new MilkProduction with this data.
     */
    create: XOR<MilkProductionCreateInput, MilkProductionUncheckedCreateInput>
    /**
     * In case the MilkProduction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MilkProductionUpdateInput, MilkProductionUncheckedUpdateInput>
  }

  /**
   * MilkProduction delete
   */
  export type MilkProductionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
    /**
     * Filter which MilkProduction to delete.
     */
    where: MilkProductionWhereUniqueInput
  }

  /**
   * MilkProduction deleteMany
   */
  export type MilkProductionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkProductions to delete
     */
    where?: MilkProductionWhereInput
  }

  /**
   * MilkProduction.category
   */
  export type MilkProduction$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    where?: MilkCategoryWhereInput
  }

  /**
   * MilkProduction.createdBy
   */
  export type MilkProduction$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * MilkProduction without action
   */
  export type MilkProductionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkProduction
     */
    select?: MilkProductionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkProductionInclude<ExtArgs> | null
  }


  /**
   * Model PackagedProduct
   */

  export type AggregatePackagedProduct = {
    _count: PackagedProductCountAggregateOutputType | null
    _avg: PackagedProductAvgAggregateOutputType | null
    _sum: PackagedProductSumAggregateOutputType | null
    _min: PackagedProductMinAggregateOutputType | null
    _max: PackagedProductMaxAggregateOutputType | null
  }

  export type PackagedProductAvgAggregateOutputType = {
    jumlah: number | null
  }

  export type PackagedProductSumAggregateOutputType = {
    jumlah: number | null
  }

  export type PackagedProductMinAggregateOutputType = {
    id: string | null
    tanggal: Date | null
    jenisProduk: string | null
    kemasan: string | null
    jumlah: number | null
    status: string | null
    receivedAt: Date | null
    receivedByName: string | null
    condition: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PackagedProductMaxAggregateOutputType = {
    id: string | null
    tanggal: Date | null
    jenisProduk: string | null
    kemasan: string | null
    jumlah: number | null
    status: string | null
    receivedAt: Date | null
    receivedByName: string | null
    condition: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PackagedProductCountAggregateOutputType = {
    id: number
    tanggal: number
    jenisProduk: number
    kemasan: number
    jumlah: number
    status: number
    receivedAt: number
    receivedByName: number
    condition: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PackagedProductAvgAggregateInputType = {
    jumlah?: true
  }

  export type PackagedProductSumAggregateInputType = {
    jumlah?: true
  }

  export type PackagedProductMinAggregateInputType = {
    id?: true
    tanggal?: true
    jenisProduk?: true
    kemasan?: true
    jumlah?: true
    status?: true
    receivedAt?: true
    receivedByName?: true
    condition?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PackagedProductMaxAggregateInputType = {
    id?: true
    tanggal?: true
    jenisProduk?: true
    kemasan?: true
    jumlah?: true
    status?: true
    receivedAt?: true
    receivedByName?: true
    condition?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PackagedProductCountAggregateInputType = {
    id?: true
    tanggal?: true
    jenisProduk?: true
    kemasan?: true
    jumlah?: true
    status?: true
    receivedAt?: true
    receivedByName?: true
    condition?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PackagedProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackagedProduct to aggregate.
     */
    where?: PackagedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackagedProducts to fetch.
     */
    orderBy?: PackagedProductOrderByWithRelationInput | PackagedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackagedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackagedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackagedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PackagedProducts
    **/
    _count?: true | PackagedProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackagedProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackagedProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackagedProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackagedProductMaxAggregateInputType
  }

  export type GetPackagedProductAggregateType<T extends PackagedProductAggregateArgs> = {
        [P in keyof T & keyof AggregatePackagedProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackagedProduct[P]>
      : GetScalarType<T[P], AggregatePackagedProduct[P]>
  }




  export type PackagedProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackagedProductWhereInput
    orderBy?: PackagedProductOrderByWithAggregationInput | PackagedProductOrderByWithAggregationInput[]
    by: PackagedProductScalarFieldEnum[] | PackagedProductScalarFieldEnum
    having?: PackagedProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackagedProductCountAggregateInputType | true
    _avg?: PackagedProductAvgAggregateInputType
    _sum?: PackagedProductSumAggregateInputType
    _min?: PackagedProductMinAggregateInputType
    _max?: PackagedProductMaxAggregateInputType
  }

  export type PackagedProductGroupByOutputType = {
    id: string
    tanggal: Date
    jenisProduk: string
    kemasan: string
    jumlah: number
    status: string
    receivedAt: Date | null
    receivedByName: string | null
    condition: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: PackagedProductCountAggregateOutputType | null
    _avg: PackagedProductAvgAggregateOutputType | null
    _sum: PackagedProductSumAggregateOutputType | null
    _min: PackagedProductMinAggregateOutputType | null
    _max: PackagedProductMaxAggregateOutputType | null
  }

  type GetPackagedProductGroupByPayload<T extends PackagedProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackagedProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackagedProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackagedProductGroupByOutputType[P]>
            : GetScalarType<T[P], PackagedProductGroupByOutputType[P]>
        }
      >
    >


  export type PackagedProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jenisProduk?: boolean
    kemasan?: boolean
    jumlah?: boolean
    status?: boolean
    receivedAt?: boolean
    receivedByName?: boolean
    condition?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean | PackagedProduct$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["packagedProduct"]>


  export type PackagedProductSelectScalar = {
    id?: boolean
    tanggal?: boolean
    jenisProduk?: boolean
    kemasan?: boolean
    jumlah?: boolean
    status?: boolean
    receivedAt?: boolean
    receivedByName?: boolean
    condition?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PackagedProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | PackagedProduct$createdByArgs<ExtArgs>
  }

  export type $PackagedProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PackagedProduct"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tanggal: Date
      jenisProduk: string
      kemasan: string
      jumlah: number
      status: string
      receivedAt: Date | null
      receivedByName: string | null
      condition: string | null
      notes: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["packagedProduct"]>
    composites: {}
  }

  type PackagedProductGetPayload<S extends boolean | null | undefined | PackagedProductDefaultArgs> = $Result.GetResult<Prisma.$PackagedProductPayload, S>

  type PackagedProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PackagedProductFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PackagedProductCountAggregateInputType | true
    }

  export interface PackagedProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PackagedProduct'], meta: { name: 'PackagedProduct' } }
    /**
     * Find zero or one PackagedProduct that matches the filter.
     * @param {PackagedProductFindUniqueArgs} args - Arguments to find a PackagedProduct
     * @example
     * // Get one PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackagedProductFindUniqueArgs>(args: SelectSubset<T, PackagedProductFindUniqueArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PackagedProduct that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PackagedProductFindUniqueOrThrowArgs} args - Arguments to find a PackagedProduct
     * @example
     * // Get one PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackagedProductFindUniqueOrThrowArgs>(args: SelectSubset<T, PackagedProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PackagedProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductFindFirstArgs} args - Arguments to find a PackagedProduct
     * @example
     * // Get one PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackagedProductFindFirstArgs>(args?: SelectSubset<T, PackagedProductFindFirstArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PackagedProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductFindFirstOrThrowArgs} args - Arguments to find a PackagedProduct
     * @example
     * // Get one PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackagedProductFindFirstOrThrowArgs>(args?: SelectSubset<T, PackagedProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PackagedProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PackagedProducts
     * const packagedProducts = await prisma.packagedProduct.findMany()
     * 
     * // Get first 10 PackagedProducts
     * const packagedProducts = await prisma.packagedProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const packagedProductWithIdOnly = await prisma.packagedProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PackagedProductFindManyArgs>(args?: SelectSubset<T, PackagedProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PackagedProduct.
     * @param {PackagedProductCreateArgs} args - Arguments to create a PackagedProduct.
     * @example
     * // Create one PackagedProduct
     * const PackagedProduct = await prisma.packagedProduct.create({
     *   data: {
     *     // ... data to create a PackagedProduct
     *   }
     * })
     * 
     */
    create<T extends PackagedProductCreateArgs>(args: SelectSubset<T, PackagedProductCreateArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PackagedProducts.
     * @param {PackagedProductCreateManyArgs} args - Arguments to create many PackagedProducts.
     * @example
     * // Create many PackagedProducts
     * const packagedProduct = await prisma.packagedProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackagedProductCreateManyArgs>(args?: SelectSubset<T, PackagedProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PackagedProduct.
     * @param {PackagedProductDeleteArgs} args - Arguments to delete one PackagedProduct.
     * @example
     * // Delete one PackagedProduct
     * const PackagedProduct = await prisma.packagedProduct.delete({
     *   where: {
     *     // ... filter to delete one PackagedProduct
     *   }
     * })
     * 
     */
    delete<T extends PackagedProductDeleteArgs>(args: SelectSubset<T, PackagedProductDeleteArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PackagedProduct.
     * @param {PackagedProductUpdateArgs} args - Arguments to update one PackagedProduct.
     * @example
     * // Update one PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackagedProductUpdateArgs>(args: SelectSubset<T, PackagedProductUpdateArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PackagedProducts.
     * @param {PackagedProductDeleteManyArgs} args - Arguments to filter PackagedProducts to delete.
     * @example
     * // Delete a few PackagedProducts
     * const { count } = await prisma.packagedProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackagedProductDeleteManyArgs>(args?: SelectSubset<T, PackagedProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackagedProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PackagedProducts
     * const packagedProduct = await prisma.packagedProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackagedProductUpdateManyArgs>(args: SelectSubset<T, PackagedProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PackagedProduct.
     * @param {PackagedProductUpsertArgs} args - Arguments to update or create a PackagedProduct.
     * @example
     * // Update or create a PackagedProduct
     * const packagedProduct = await prisma.packagedProduct.upsert({
     *   create: {
     *     // ... data to create a PackagedProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PackagedProduct we want to update
     *   }
     * })
     */
    upsert<T extends PackagedProductUpsertArgs>(args: SelectSubset<T, PackagedProductUpsertArgs<ExtArgs>>): Prisma__PackagedProductClient<$Result.GetResult<Prisma.$PackagedProductPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PackagedProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductCountArgs} args - Arguments to filter PackagedProducts to count.
     * @example
     * // Count the number of PackagedProducts
     * const count = await prisma.packagedProduct.count({
     *   where: {
     *     // ... the filter for the PackagedProducts we want to count
     *   }
     * })
    **/
    count<T extends PackagedProductCountArgs>(
      args?: Subset<T, PackagedProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackagedProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PackagedProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackagedProductAggregateArgs>(args: Subset<T, PackagedProductAggregateArgs>): Prisma.PrismaPromise<GetPackagedProductAggregateType<T>>

    /**
     * Group by PackagedProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackagedProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackagedProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackagedProductGroupByArgs['orderBy'] }
        : { orderBy?: PackagedProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackagedProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackagedProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PackagedProduct model
   */
  readonly fields: PackagedProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PackagedProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackagedProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends PackagedProduct$createdByArgs<ExtArgs> = {}>(args?: Subset<T, PackagedProduct$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PackagedProduct model
   */ 
  interface PackagedProductFieldRefs {
    readonly id: FieldRef<"PackagedProduct", 'String'>
    readonly tanggal: FieldRef<"PackagedProduct", 'DateTime'>
    readonly jenisProduk: FieldRef<"PackagedProduct", 'String'>
    readonly kemasan: FieldRef<"PackagedProduct", 'String'>
    readonly jumlah: FieldRef<"PackagedProduct", 'Float'>
    readonly status: FieldRef<"PackagedProduct", 'String'>
    readonly receivedAt: FieldRef<"PackagedProduct", 'DateTime'>
    readonly receivedByName: FieldRef<"PackagedProduct", 'String'>
    readonly condition: FieldRef<"PackagedProduct", 'String'>
    readonly notes: FieldRef<"PackagedProduct", 'String'>
    readonly createdById: FieldRef<"PackagedProduct", 'String'>
    readonly createdAt: FieldRef<"PackagedProduct", 'DateTime'>
    readonly updatedAt: FieldRef<"PackagedProduct", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PackagedProduct findUnique
   */
  export type PackagedProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter, which PackagedProduct to fetch.
     */
    where: PackagedProductWhereUniqueInput
  }

  /**
   * PackagedProduct findUniqueOrThrow
   */
  export type PackagedProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter, which PackagedProduct to fetch.
     */
    where: PackagedProductWhereUniqueInput
  }

  /**
   * PackagedProduct findFirst
   */
  export type PackagedProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter, which PackagedProduct to fetch.
     */
    where?: PackagedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackagedProducts to fetch.
     */
    orderBy?: PackagedProductOrderByWithRelationInput | PackagedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackagedProducts.
     */
    cursor?: PackagedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackagedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackagedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackagedProducts.
     */
    distinct?: PackagedProductScalarFieldEnum | PackagedProductScalarFieldEnum[]
  }

  /**
   * PackagedProduct findFirstOrThrow
   */
  export type PackagedProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter, which PackagedProduct to fetch.
     */
    where?: PackagedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackagedProducts to fetch.
     */
    orderBy?: PackagedProductOrderByWithRelationInput | PackagedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackagedProducts.
     */
    cursor?: PackagedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackagedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackagedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackagedProducts.
     */
    distinct?: PackagedProductScalarFieldEnum | PackagedProductScalarFieldEnum[]
  }

  /**
   * PackagedProduct findMany
   */
  export type PackagedProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter, which PackagedProducts to fetch.
     */
    where?: PackagedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackagedProducts to fetch.
     */
    orderBy?: PackagedProductOrderByWithRelationInput | PackagedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PackagedProducts.
     */
    cursor?: PackagedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackagedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackagedProducts.
     */
    skip?: number
    distinct?: PackagedProductScalarFieldEnum | PackagedProductScalarFieldEnum[]
  }

  /**
   * PackagedProduct create
   */
  export type PackagedProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * The data needed to create a PackagedProduct.
     */
    data: XOR<PackagedProductCreateInput, PackagedProductUncheckedCreateInput>
  }

  /**
   * PackagedProduct createMany
   */
  export type PackagedProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PackagedProducts.
     */
    data: PackagedProductCreateManyInput | PackagedProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PackagedProduct update
   */
  export type PackagedProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * The data needed to update a PackagedProduct.
     */
    data: XOR<PackagedProductUpdateInput, PackagedProductUncheckedUpdateInput>
    /**
     * Choose, which PackagedProduct to update.
     */
    where: PackagedProductWhereUniqueInput
  }

  /**
   * PackagedProduct updateMany
   */
  export type PackagedProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PackagedProducts.
     */
    data: XOR<PackagedProductUpdateManyMutationInput, PackagedProductUncheckedUpdateManyInput>
    /**
     * Filter which PackagedProducts to update
     */
    where?: PackagedProductWhereInput
  }

  /**
   * PackagedProduct upsert
   */
  export type PackagedProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * The filter to search for the PackagedProduct to update in case it exists.
     */
    where: PackagedProductWhereUniqueInput
    /**
     * In case the PackagedProduct found by the `where` argument doesn't exist, create a new PackagedProduct with this data.
     */
    create: XOR<PackagedProductCreateInput, PackagedProductUncheckedCreateInput>
    /**
     * In case the PackagedProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackagedProductUpdateInput, PackagedProductUncheckedUpdateInput>
  }

  /**
   * PackagedProduct delete
   */
  export type PackagedProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
    /**
     * Filter which PackagedProduct to delete.
     */
    where: PackagedProductWhereUniqueInput
  }

  /**
   * PackagedProduct deleteMany
   */
  export type PackagedProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackagedProducts to delete
     */
    where?: PackagedProductWhereInput
  }

  /**
   * PackagedProduct.createdBy
   */
  export type PackagedProduct$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * PackagedProduct without action
   */
  export type PackagedProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackagedProduct
     */
    select?: PackagedProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackagedProductInclude<ExtArgs> | null
  }


  /**
   * Model MilkPackaging
   */

  export type AggregateMilkPackaging = {
    _count: MilkPackagingCountAggregateOutputType | null
    _avg: MilkPackagingAvgAggregateOutputType | null
    _sum: MilkPackagingSumAggregateOutputType | null
    _min: MilkPackagingMinAggregateOutputType | null
    _max: MilkPackagingMaxAggregateOutputType | null
  }

  export type MilkPackagingAvgAggregateOutputType = {
    processedAmount: number | null
    processedLiters: number | null
    botolQty: number | null
    cupQty: number | null
    plastikBantalQty: number | null
    totalPackagedQty: number | null
    quantitySent: number | null
    quantityReceived: number | null
  }

  export type MilkPackagingSumAggregateOutputType = {
    processedAmount: number | null
    processedLiters: number | null
    botolQty: number | null
    cupQty: number | null
    plastikBantalQty: number | null
    totalPackagedQty: number | null
    quantitySent: number | null
    quantityReceived: number | null
  }

  export type MilkPackagingMinAggregateOutputType = {
    id: string | null
    date: Date | null
    productCategory: string | null
    productSubtype: string | null
    origin: string | null
    variant: string | null
    animalType: string | null
    categoryId: string | null
    processedAmount: number | null
    processedUnit: string | null
    processedLiters: number | null
    packagingDetails: string | null
    packagingType: string | null
    packageSize: string | null
    botolQty: number | null
    cupQty: number | null
    plastikBantalQty: number | null
    totalPackagedQty: number | null
    status: string | null
    sentAt: Date | null
    sentById: string | null
    sentByName: string | null
    receivedAt: Date | null
    receivedById: string | null
    receivedByName: string | null
    quantitySent: number | null
    quantityReceived: number | null
    condition: string | null
    receptionNotes: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkPackagingMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    productCategory: string | null
    productSubtype: string | null
    origin: string | null
    variant: string | null
    animalType: string | null
    categoryId: string | null
    processedAmount: number | null
    processedUnit: string | null
    processedLiters: number | null
    packagingDetails: string | null
    packagingType: string | null
    packageSize: string | null
    botolQty: number | null
    cupQty: number | null
    plastikBantalQty: number | null
    totalPackagedQty: number | null
    status: string | null
    sentAt: Date | null
    sentById: string | null
    sentByName: string | null
    receivedAt: Date | null
    receivedById: string | null
    receivedByName: string | null
    quantitySent: number | null
    quantityReceived: number | null
    condition: string | null
    receptionNotes: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkPackagingCountAggregateOutputType = {
    id: number
    date: number
    productCategory: number
    productSubtype: number
    origin: number
    variant: number
    animalType: number
    categoryId: number
    processedAmount: number
    processedUnit: number
    processedLiters: number
    packagingDetails: number
    packagingType: number
    packageSize: number
    botolQty: number
    cupQty: number
    plastikBantalQty: number
    totalPackagedQty: number
    status: number
    sentAt: number
    sentById: number
    sentByName: number
    receivedAt: number
    receivedById: number
    receivedByName: number
    quantitySent: number
    quantityReceived: number
    condition: number
    receptionNotes: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MilkPackagingAvgAggregateInputType = {
    processedAmount?: true
    processedLiters?: true
    botolQty?: true
    cupQty?: true
    plastikBantalQty?: true
    totalPackagedQty?: true
    quantitySent?: true
    quantityReceived?: true
  }

  export type MilkPackagingSumAggregateInputType = {
    processedAmount?: true
    processedLiters?: true
    botolQty?: true
    cupQty?: true
    plastikBantalQty?: true
    totalPackagedQty?: true
    quantitySent?: true
    quantityReceived?: true
  }

  export type MilkPackagingMinAggregateInputType = {
    id?: true
    date?: true
    productCategory?: true
    productSubtype?: true
    origin?: true
    variant?: true
    animalType?: true
    categoryId?: true
    processedAmount?: true
    processedUnit?: true
    processedLiters?: true
    packagingDetails?: true
    packagingType?: true
    packageSize?: true
    botolQty?: true
    cupQty?: true
    plastikBantalQty?: true
    totalPackagedQty?: true
    status?: true
    sentAt?: true
    sentById?: true
    sentByName?: true
    receivedAt?: true
    receivedById?: true
    receivedByName?: true
    quantitySent?: true
    quantityReceived?: true
    condition?: true
    receptionNotes?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkPackagingMaxAggregateInputType = {
    id?: true
    date?: true
    productCategory?: true
    productSubtype?: true
    origin?: true
    variant?: true
    animalType?: true
    categoryId?: true
    processedAmount?: true
    processedUnit?: true
    processedLiters?: true
    packagingDetails?: true
    packagingType?: true
    packageSize?: true
    botolQty?: true
    cupQty?: true
    plastikBantalQty?: true
    totalPackagedQty?: true
    status?: true
    sentAt?: true
    sentById?: true
    sentByName?: true
    receivedAt?: true
    receivedById?: true
    receivedByName?: true
    quantitySent?: true
    quantityReceived?: true
    condition?: true
    receptionNotes?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkPackagingCountAggregateInputType = {
    id?: true
    date?: true
    productCategory?: true
    productSubtype?: true
    origin?: true
    variant?: true
    animalType?: true
    categoryId?: true
    processedAmount?: true
    processedUnit?: true
    processedLiters?: true
    packagingDetails?: true
    packagingType?: true
    packageSize?: true
    botolQty?: true
    cupQty?: true
    plastikBantalQty?: true
    totalPackagedQty?: true
    status?: true
    sentAt?: true
    sentById?: true
    sentByName?: true
    receivedAt?: true
    receivedById?: true
    receivedByName?: true
    quantitySent?: true
    quantityReceived?: true
    condition?: true
    receptionNotes?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MilkPackagingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkPackaging to aggregate.
     */
    where?: MilkPackagingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkPackagings to fetch.
     */
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MilkPackagingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkPackagings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkPackagings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MilkPackagings
    **/
    _count?: true | MilkPackagingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MilkPackagingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MilkPackagingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MilkPackagingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MilkPackagingMaxAggregateInputType
  }

  export type GetMilkPackagingAggregateType<T extends MilkPackagingAggregateArgs> = {
        [P in keyof T & keyof AggregateMilkPackaging]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMilkPackaging[P]>
      : GetScalarType<T[P], AggregateMilkPackaging[P]>
  }




  export type MilkPackagingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkPackagingWhereInput
    orderBy?: MilkPackagingOrderByWithAggregationInput | MilkPackagingOrderByWithAggregationInput[]
    by: MilkPackagingScalarFieldEnum[] | MilkPackagingScalarFieldEnum
    having?: MilkPackagingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MilkPackagingCountAggregateInputType | true
    _avg?: MilkPackagingAvgAggregateInputType
    _sum?: MilkPackagingSumAggregateInputType
    _min?: MilkPackagingMinAggregateInputType
    _max?: MilkPackagingMaxAggregateInputType
  }

  export type MilkPackagingGroupByOutputType = {
    id: string
    date: Date
    productCategory: string
    productSubtype: string | null
    origin: string
    variant: string | null
    animalType: string
    categoryId: string | null
    processedAmount: number
    processedUnit: string
    processedLiters: number
    packagingDetails: string | null
    packagingType: string | null
    packageSize: string | null
    botolQty: number
    cupQty: number
    plastikBantalQty: number
    totalPackagedQty: number
    status: string
    sentAt: Date | null
    sentById: string | null
    sentByName: string | null
    receivedAt: Date | null
    receivedById: string | null
    receivedByName: string | null
    quantitySent: number
    quantityReceived: number
    condition: string | null
    receptionNotes: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: MilkPackagingCountAggregateOutputType | null
    _avg: MilkPackagingAvgAggregateOutputType | null
    _sum: MilkPackagingSumAggregateOutputType | null
    _min: MilkPackagingMinAggregateOutputType | null
    _max: MilkPackagingMaxAggregateOutputType | null
  }

  type GetMilkPackagingGroupByPayload<T extends MilkPackagingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MilkPackagingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MilkPackagingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MilkPackagingGroupByOutputType[P]>
            : GetScalarType<T[P], MilkPackagingGroupByOutputType[P]>
        }
      >
    >


  export type MilkPackagingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    productCategory?: boolean
    productSubtype?: boolean
    origin?: boolean
    variant?: boolean
    animalType?: boolean
    categoryId?: boolean
    processedAmount?: boolean
    processedUnit?: boolean
    processedLiters?: boolean
    packagingDetails?: boolean
    packagingType?: boolean
    packageSize?: boolean
    botolQty?: boolean
    cupQty?: boolean
    plastikBantalQty?: boolean
    totalPackagedQty?: boolean
    status?: boolean
    sentAt?: boolean
    sentById?: boolean
    sentByName?: boolean
    receivedAt?: boolean
    receivedById?: boolean
    receivedByName?: boolean
    quantitySent?: boolean
    quantityReceived?: boolean
    condition?: boolean
    receptionNotes?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | MilkPackaging$categoryArgs<ExtArgs>
    createdBy?: boolean | MilkPackaging$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["milkPackaging"]>


  export type MilkPackagingSelectScalar = {
    id?: boolean
    date?: boolean
    productCategory?: boolean
    productSubtype?: boolean
    origin?: boolean
    variant?: boolean
    animalType?: boolean
    categoryId?: boolean
    processedAmount?: boolean
    processedUnit?: boolean
    processedLiters?: boolean
    packagingDetails?: boolean
    packagingType?: boolean
    packageSize?: boolean
    botolQty?: boolean
    cupQty?: boolean
    plastikBantalQty?: boolean
    totalPackagedQty?: boolean
    status?: boolean
    sentAt?: boolean
    sentById?: boolean
    sentByName?: boolean
    receivedAt?: boolean
    receivedById?: boolean
    receivedByName?: boolean
    quantitySent?: boolean
    quantityReceived?: boolean
    condition?: boolean
    receptionNotes?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MilkPackagingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | MilkPackaging$categoryArgs<ExtArgs>
    createdBy?: boolean | MilkPackaging$createdByArgs<ExtArgs>
  }

  export type $MilkPackagingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MilkPackaging"
    objects: {
      category: Prisma.$MilkCategoryPayload<ExtArgs> | null
      createdBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      productCategory: string
      productSubtype: string | null
      origin: string
      variant: string | null
      animalType: string
      categoryId: string | null
      processedAmount: number
      processedUnit: string
      processedLiters: number
      packagingDetails: string | null
      packagingType: string | null
      packageSize: string | null
      botolQty: number
      cupQty: number
      plastikBantalQty: number
      totalPackagedQty: number
      status: string
      sentAt: Date | null
      sentById: string | null
      sentByName: string | null
      receivedAt: Date | null
      receivedById: string | null
      receivedByName: string | null
      quantitySent: number
      quantityReceived: number
      condition: string | null
      receptionNotes: string | null
      notes: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["milkPackaging"]>
    composites: {}
  }

  type MilkPackagingGetPayload<S extends boolean | null | undefined | MilkPackagingDefaultArgs> = $Result.GetResult<Prisma.$MilkPackagingPayload, S>

  type MilkPackagingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MilkPackagingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MilkPackagingCountAggregateInputType | true
    }

  export interface MilkPackagingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MilkPackaging'], meta: { name: 'MilkPackaging' } }
    /**
     * Find zero or one MilkPackaging that matches the filter.
     * @param {MilkPackagingFindUniqueArgs} args - Arguments to find a MilkPackaging
     * @example
     * // Get one MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MilkPackagingFindUniqueArgs>(args: SelectSubset<T, MilkPackagingFindUniqueArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MilkPackaging that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MilkPackagingFindUniqueOrThrowArgs} args - Arguments to find a MilkPackaging
     * @example
     * // Get one MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MilkPackagingFindUniqueOrThrowArgs>(args: SelectSubset<T, MilkPackagingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MilkPackaging that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingFindFirstArgs} args - Arguments to find a MilkPackaging
     * @example
     * // Get one MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MilkPackagingFindFirstArgs>(args?: SelectSubset<T, MilkPackagingFindFirstArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MilkPackaging that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingFindFirstOrThrowArgs} args - Arguments to find a MilkPackaging
     * @example
     * // Get one MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MilkPackagingFindFirstOrThrowArgs>(args?: SelectSubset<T, MilkPackagingFindFirstOrThrowArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MilkPackagings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MilkPackagings
     * const milkPackagings = await prisma.milkPackaging.findMany()
     * 
     * // Get first 10 MilkPackagings
     * const milkPackagings = await prisma.milkPackaging.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const milkPackagingWithIdOnly = await prisma.milkPackaging.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MilkPackagingFindManyArgs>(args?: SelectSubset<T, MilkPackagingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MilkPackaging.
     * @param {MilkPackagingCreateArgs} args - Arguments to create a MilkPackaging.
     * @example
     * // Create one MilkPackaging
     * const MilkPackaging = await prisma.milkPackaging.create({
     *   data: {
     *     // ... data to create a MilkPackaging
     *   }
     * })
     * 
     */
    create<T extends MilkPackagingCreateArgs>(args: SelectSubset<T, MilkPackagingCreateArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MilkPackagings.
     * @param {MilkPackagingCreateManyArgs} args - Arguments to create many MilkPackagings.
     * @example
     * // Create many MilkPackagings
     * const milkPackaging = await prisma.milkPackaging.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MilkPackagingCreateManyArgs>(args?: SelectSubset<T, MilkPackagingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MilkPackaging.
     * @param {MilkPackagingDeleteArgs} args - Arguments to delete one MilkPackaging.
     * @example
     * // Delete one MilkPackaging
     * const MilkPackaging = await prisma.milkPackaging.delete({
     *   where: {
     *     // ... filter to delete one MilkPackaging
     *   }
     * })
     * 
     */
    delete<T extends MilkPackagingDeleteArgs>(args: SelectSubset<T, MilkPackagingDeleteArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MilkPackaging.
     * @param {MilkPackagingUpdateArgs} args - Arguments to update one MilkPackaging.
     * @example
     * // Update one MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MilkPackagingUpdateArgs>(args: SelectSubset<T, MilkPackagingUpdateArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MilkPackagings.
     * @param {MilkPackagingDeleteManyArgs} args - Arguments to filter MilkPackagings to delete.
     * @example
     * // Delete a few MilkPackagings
     * const { count } = await prisma.milkPackaging.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MilkPackagingDeleteManyArgs>(args?: SelectSubset<T, MilkPackagingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MilkPackagings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MilkPackagings
     * const milkPackaging = await prisma.milkPackaging.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MilkPackagingUpdateManyArgs>(args: SelectSubset<T, MilkPackagingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MilkPackaging.
     * @param {MilkPackagingUpsertArgs} args - Arguments to update or create a MilkPackaging.
     * @example
     * // Update or create a MilkPackaging
     * const milkPackaging = await prisma.milkPackaging.upsert({
     *   create: {
     *     // ... data to create a MilkPackaging
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MilkPackaging we want to update
     *   }
     * })
     */
    upsert<T extends MilkPackagingUpsertArgs>(args: SelectSubset<T, MilkPackagingUpsertArgs<ExtArgs>>): Prisma__MilkPackagingClient<$Result.GetResult<Prisma.$MilkPackagingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MilkPackagings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingCountArgs} args - Arguments to filter MilkPackagings to count.
     * @example
     * // Count the number of MilkPackagings
     * const count = await prisma.milkPackaging.count({
     *   where: {
     *     // ... the filter for the MilkPackagings we want to count
     *   }
     * })
    **/
    count<T extends MilkPackagingCountArgs>(
      args?: Subset<T, MilkPackagingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MilkPackagingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MilkPackaging.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MilkPackagingAggregateArgs>(args: Subset<T, MilkPackagingAggregateArgs>): Prisma.PrismaPromise<GetMilkPackagingAggregateType<T>>

    /**
     * Group by MilkPackaging.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkPackagingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MilkPackagingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MilkPackagingGroupByArgs['orderBy'] }
        : { orderBy?: MilkPackagingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MilkPackagingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMilkPackagingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MilkPackaging model
   */
  readonly fields: MilkPackagingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MilkPackaging.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MilkPackagingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends MilkPackaging$categoryArgs<ExtArgs> = {}>(args?: Subset<T, MilkPackaging$categoryArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    createdBy<T extends MilkPackaging$createdByArgs<ExtArgs> = {}>(args?: Subset<T, MilkPackaging$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MilkPackaging model
   */ 
  interface MilkPackagingFieldRefs {
    readonly id: FieldRef<"MilkPackaging", 'String'>
    readonly date: FieldRef<"MilkPackaging", 'DateTime'>
    readonly productCategory: FieldRef<"MilkPackaging", 'String'>
    readonly productSubtype: FieldRef<"MilkPackaging", 'String'>
    readonly origin: FieldRef<"MilkPackaging", 'String'>
    readonly variant: FieldRef<"MilkPackaging", 'String'>
    readonly animalType: FieldRef<"MilkPackaging", 'String'>
    readonly categoryId: FieldRef<"MilkPackaging", 'String'>
    readonly processedAmount: FieldRef<"MilkPackaging", 'Float'>
    readonly processedUnit: FieldRef<"MilkPackaging", 'String'>
    readonly processedLiters: FieldRef<"MilkPackaging", 'Float'>
    readonly packagingDetails: FieldRef<"MilkPackaging", 'String'>
    readonly packagingType: FieldRef<"MilkPackaging", 'String'>
    readonly packageSize: FieldRef<"MilkPackaging", 'String'>
    readonly botolQty: FieldRef<"MilkPackaging", 'Int'>
    readonly cupQty: FieldRef<"MilkPackaging", 'Int'>
    readonly plastikBantalQty: FieldRef<"MilkPackaging", 'Int'>
    readonly totalPackagedQty: FieldRef<"MilkPackaging", 'Int'>
    readonly status: FieldRef<"MilkPackaging", 'String'>
    readonly sentAt: FieldRef<"MilkPackaging", 'DateTime'>
    readonly sentById: FieldRef<"MilkPackaging", 'String'>
    readonly sentByName: FieldRef<"MilkPackaging", 'String'>
    readonly receivedAt: FieldRef<"MilkPackaging", 'DateTime'>
    readonly receivedById: FieldRef<"MilkPackaging", 'String'>
    readonly receivedByName: FieldRef<"MilkPackaging", 'String'>
    readonly quantitySent: FieldRef<"MilkPackaging", 'Int'>
    readonly quantityReceived: FieldRef<"MilkPackaging", 'Int'>
    readonly condition: FieldRef<"MilkPackaging", 'String'>
    readonly receptionNotes: FieldRef<"MilkPackaging", 'String'>
    readonly notes: FieldRef<"MilkPackaging", 'String'>
    readonly createdById: FieldRef<"MilkPackaging", 'String'>
    readonly createdAt: FieldRef<"MilkPackaging", 'DateTime'>
    readonly updatedAt: FieldRef<"MilkPackaging", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MilkPackaging findUnique
   */
  export type MilkPackagingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter, which MilkPackaging to fetch.
     */
    where: MilkPackagingWhereUniqueInput
  }

  /**
   * MilkPackaging findUniqueOrThrow
   */
  export type MilkPackagingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter, which MilkPackaging to fetch.
     */
    where: MilkPackagingWhereUniqueInput
  }

  /**
   * MilkPackaging findFirst
   */
  export type MilkPackagingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter, which MilkPackaging to fetch.
     */
    where?: MilkPackagingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkPackagings to fetch.
     */
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkPackagings.
     */
    cursor?: MilkPackagingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkPackagings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkPackagings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkPackagings.
     */
    distinct?: MilkPackagingScalarFieldEnum | MilkPackagingScalarFieldEnum[]
  }

  /**
   * MilkPackaging findFirstOrThrow
   */
  export type MilkPackagingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter, which MilkPackaging to fetch.
     */
    where?: MilkPackagingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkPackagings to fetch.
     */
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkPackagings.
     */
    cursor?: MilkPackagingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkPackagings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkPackagings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkPackagings.
     */
    distinct?: MilkPackagingScalarFieldEnum | MilkPackagingScalarFieldEnum[]
  }

  /**
   * MilkPackaging findMany
   */
  export type MilkPackagingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter, which MilkPackagings to fetch.
     */
    where?: MilkPackagingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkPackagings to fetch.
     */
    orderBy?: MilkPackagingOrderByWithRelationInput | MilkPackagingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MilkPackagings.
     */
    cursor?: MilkPackagingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkPackagings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkPackagings.
     */
    skip?: number
    distinct?: MilkPackagingScalarFieldEnum | MilkPackagingScalarFieldEnum[]
  }

  /**
   * MilkPackaging create
   */
  export type MilkPackagingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * The data needed to create a MilkPackaging.
     */
    data: XOR<MilkPackagingCreateInput, MilkPackagingUncheckedCreateInput>
  }

  /**
   * MilkPackaging createMany
   */
  export type MilkPackagingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MilkPackagings.
     */
    data: MilkPackagingCreateManyInput | MilkPackagingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MilkPackaging update
   */
  export type MilkPackagingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * The data needed to update a MilkPackaging.
     */
    data: XOR<MilkPackagingUpdateInput, MilkPackagingUncheckedUpdateInput>
    /**
     * Choose, which MilkPackaging to update.
     */
    where: MilkPackagingWhereUniqueInput
  }

  /**
   * MilkPackaging updateMany
   */
  export type MilkPackagingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MilkPackagings.
     */
    data: XOR<MilkPackagingUpdateManyMutationInput, MilkPackagingUncheckedUpdateManyInput>
    /**
     * Filter which MilkPackagings to update
     */
    where?: MilkPackagingWhereInput
  }

  /**
   * MilkPackaging upsert
   */
  export type MilkPackagingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * The filter to search for the MilkPackaging to update in case it exists.
     */
    where: MilkPackagingWhereUniqueInput
    /**
     * In case the MilkPackaging found by the `where` argument doesn't exist, create a new MilkPackaging with this data.
     */
    create: XOR<MilkPackagingCreateInput, MilkPackagingUncheckedCreateInput>
    /**
     * In case the MilkPackaging was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MilkPackagingUpdateInput, MilkPackagingUncheckedUpdateInput>
  }

  /**
   * MilkPackaging delete
   */
  export type MilkPackagingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
    /**
     * Filter which MilkPackaging to delete.
     */
    where: MilkPackagingWhereUniqueInput
  }

  /**
   * MilkPackaging deleteMany
   */
  export type MilkPackagingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkPackagings to delete
     */
    where?: MilkPackagingWhereInput
  }

  /**
   * MilkPackaging.category
   */
  export type MilkPackaging$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkCategory
     */
    select?: MilkCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkCategoryInclude<ExtArgs> | null
    where?: MilkCategoryWhereInput
  }

  /**
   * MilkPackaging.createdBy
   */
  export type MilkPackaging$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * MilkPackaging without action
   */
  export type MilkPackagingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkPackaging
     */
    select?: MilkPackagingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkPackagingInclude<ExtArgs> | null
  }


  /**
   * Model MilkOutflow
   */

  export type AggregateMilkOutflow = {
    _count: MilkOutflowCountAggregateOutputType | null
    _avg: MilkOutflowAvgAggregateOutputType | null
    _sum: MilkOutflowSumAggregateOutputType | null
    _min: MilkOutflowMinAggregateOutputType | null
    _max: MilkOutflowMaxAggregateOutputType | null
  }

  export type MilkOutflowAvgAggregateOutputType = {
    quantity: number | null
  }

  export type MilkOutflowSumAggregateOutputType = {
    quantity: number | null
  }

  export type MilkOutflowMinAggregateOutputType = {
    id: string | null
    date: Date | null
    categoryId: string | null
    productType: string | null
    animalType: string | null
    packagingType: string | null
    quantity: number | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkOutflowMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    categoryId: string | null
    productType: string | null
    animalType: string | null
    packagingType: string | null
    quantity: number | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkOutflowCountAggregateOutputType = {
    id: number
    date: number
    categoryId: number
    productType: number
    animalType: number
    packagingType: number
    quantity: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MilkOutflowAvgAggregateInputType = {
    quantity?: true
  }

  export type MilkOutflowSumAggregateInputType = {
    quantity?: true
  }

  export type MilkOutflowMinAggregateInputType = {
    id?: true
    date?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    quantity?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkOutflowMaxAggregateInputType = {
    id?: true
    date?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    quantity?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkOutflowCountAggregateInputType = {
    id?: true
    date?: true
    categoryId?: true
    productType?: true
    animalType?: true
    packagingType?: true
    quantity?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MilkOutflowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkOutflow to aggregate.
     */
    where?: MilkOutflowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkOutflows to fetch.
     */
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MilkOutflowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkOutflows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkOutflows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MilkOutflows
    **/
    _count?: true | MilkOutflowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MilkOutflowAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MilkOutflowSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MilkOutflowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MilkOutflowMaxAggregateInputType
  }

  export type GetMilkOutflowAggregateType<T extends MilkOutflowAggregateArgs> = {
        [P in keyof T & keyof AggregateMilkOutflow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMilkOutflow[P]>
      : GetScalarType<T[P], AggregateMilkOutflow[P]>
  }




  export type MilkOutflowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkOutflowWhereInput
    orderBy?: MilkOutflowOrderByWithAggregationInput | MilkOutflowOrderByWithAggregationInput[]
    by: MilkOutflowScalarFieldEnum[] | MilkOutflowScalarFieldEnum
    having?: MilkOutflowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MilkOutflowCountAggregateInputType | true
    _avg?: MilkOutflowAvgAggregateInputType
    _sum?: MilkOutflowSumAggregateInputType
    _min?: MilkOutflowMinAggregateInputType
    _max?: MilkOutflowMaxAggregateInputType
  }

  export type MilkOutflowGroupByOutputType = {
    id: string
    date: Date
    categoryId: string
    productType: string
    animalType: string
    packagingType: string
    quantity: number
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: MilkOutflowCountAggregateOutputType | null
    _avg: MilkOutflowAvgAggregateOutputType | null
    _sum: MilkOutflowSumAggregateOutputType | null
    _min: MilkOutflowMinAggregateOutputType | null
    _max: MilkOutflowMaxAggregateOutputType | null
  }

  type GetMilkOutflowGroupByPayload<T extends MilkOutflowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MilkOutflowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MilkOutflowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MilkOutflowGroupByOutputType[P]>
            : GetScalarType<T[P], MilkOutflowGroupByOutputType[P]>
        }
      >
    >


  export type MilkOutflowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    categoryId?: boolean
    productType?: boolean
    animalType?: boolean
    packagingType?: boolean
    quantity?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | MilkCategoryDefaultArgs<ExtArgs>
    createdBy?: boolean | MilkOutflow$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["milkOutflow"]>


  export type MilkOutflowSelectScalar = {
    id?: boolean
    date?: boolean
    categoryId?: boolean
    productType?: boolean
    animalType?: boolean
    packagingType?: boolean
    quantity?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MilkOutflowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | MilkCategoryDefaultArgs<ExtArgs>
    createdBy?: boolean | MilkOutflow$createdByArgs<ExtArgs>
  }

  export type $MilkOutflowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MilkOutflow"
    objects: {
      category: Prisma.$MilkCategoryPayload<ExtArgs>
      createdBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      categoryId: string
      productType: string
      animalType: string
      packagingType: string
      quantity: number
      notes: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["milkOutflow"]>
    composites: {}
  }

  type MilkOutflowGetPayload<S extends boolean | null | undefined | MilkOutflowDefaultArgs> = $Result.GetResult<Prisma.$MilkOutflowPayload, S>

  type MilkOutflowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MilkOutflowFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MilkOutflowCountAggregateInputType | true
    }

  export interface MilkOutflowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MilkOutflow'], meta: { name: 'MilkOutflow' } }
    /**
     * Find zero or one MilkOutflow that matches the filter.
     * @param {MilkOutflowFindUniqueArgs} args - Arguments to find a MilkOutflow
     * @example
     * // Get one MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MilkOutflowFindUniqueArgs>(args: SelectSubset<T, MilkOutflowFindUniqueArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MilkOutflow that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MilkOutflowFindUniqueOrThrowArgs} args - Arguments to find a MilkOutflow
     * @example
     * // Get one MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MilkOutflowFindUniqueOrThrowArgs>(args: SelectSubset<T, MilkOutflowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MilkOutflow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowFindFirstArgs} args - Arguments to find a MilkOutflow
     * @example
     * // Get one MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MilkOutflowFindFirstArgs>(args?: SelectSubset<T, MilkOutflowFindFirstArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MilkOutflow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowFindFirstOrThrowArgs} args - Arguments to find a MilkOutflow
     * @example
     * // Get one MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MilkOutflowFindFirstOrThrowArgs>(args?: SelectSubset<T, MilkOutflowFindFirstOrThrowArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MilkOutflows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MilkOutflows
     * const milkOutflows = await prisma.milkOutflow.findMany()
     * 
     * // Get first 10 MilkOutflows
     * const milkOutflows = await prisma.milkOutflow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const milkOutflowWithIdOnly = await prisma.milkOutflow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MilkOutflowFindManyArgs>(args?: SelectSubset<T, MilkOutflowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MilkOutflow.
     * @param {MilkOutflowCreateArgs} args - Arguments to create a MilkOutflow.
     * @example
     * // Create one MilkOutflow
     * const MilkOutflow = await prisma.milkOutflow.create({
     *   data: {
     *     // ... data to create a MilkOutflow
     *   }
     * })
     * 
     */
    create<T extends MilkOutflowCreateArgs>(args: SelectSubset<T, MilkOutflowCreateArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MilkOutflows.
     * @param {MilkOutflowCreateManyArgs} args - Arguments to create many MilkOutflows.
     * @example
     * // Create many MilkOutflows
     * const milkOutflow = await prisma.milkOutflow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MilkOutflowCreateManyArgs>(args?: SelectSubset<T, MilkOutflowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MilkOutflow.
     * @param {MilkOutflowDeleteArgs} args - Arguments to delete one MilkOutflow.
     * @example
     * // Delete one MilkOutflow
     * const MilkOutflow = await prisma.milkOutflow.delete({
     *   where: {
     *     // ... filter to delete one MilkOutflow
     *   }
     * })
     * 
     */
    delete<T extends MilkOutflowDeleteArgs>(args: SelectSubset<T, MilkOutflowDeleteArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MilkOutflow.
     * @param {MilkOutflowUpdateArgs} args - Arguments to update one MilkOutflow.
     * @example
     * // Update one MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MilkOutflowUpdateArgs>(args: SelectSubset<T, MilkOutflowUpdateArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MilkOutflows.
     * @param {MilkOutflowDeleteManyArgs} args - Arguments to filter MilkOutflows to delete.
     * @example
     * // Delete a few MilkOutflows
     * const { count } = await prisma.milkOutflow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MilkOutflowDeleteManyArgs>(args?: SelectSubset<T, MilkOutflowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MilkOutflows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MilkOutflows
     * const milkOutflow = await prisma.milkOutflow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MilkOutflowUpdateManyArgs>(args: SelectSubset<T, MilkOutflowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MilkOutflow.
     * @param {MilkOutflowUpsertArgs} args - Arguments to update or create a MilkOutflow.
     * @example
     * // Update or create a MilkOutflow
     * const milkOutflow = await prisma.milkOutflow.upsert({
     *   create: {
     *     // ... data to create a MilkOutflow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MilkOutflow we want to update
     *   }
     * })
     */
    upsert<T extends MilkOutflowUpsertArgs>(args: SelectSubset<T, MilkOutflowUpsertArgs<ExtArgs>>): Prisma__MilkOutflowClient<$Result.GetResult<Prisma.$MilkOutflowPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MilkOutflows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowCountArgs} args - Arguments to filter MilkOutflows to count.
     * @example
     * // Count the number of MilkOutflows
     * const count = await prisma.milkOutflow.count({
     *   where: {
     *     // ... the filter for the MilkOutflows we want to count
     *   }
     * })
    **/
    count<T extends MilkOutflowCountArgs>(
      args?: Subset<T, MilkOutflowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MilkOutflowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MilkOutflow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MilkOutflowAggregateArgs>(args: Subset<T, MilkOutflowAggregateArgs>): Prisma.PrismaPromise<GetMilkOutflowAggregateType<T>>

    /**
     * Group by MilkOutflow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkOutflowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MilkOutflowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MilkOutflowGroupByArgs['orderBy'] }
        : { orderBy?: MilkOutflowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MilkOutflowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMilkOutflowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MilkOutflow model
   */
  readonly fields: MilkOutflowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MilkOutflow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MilkOutflowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends MilkCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MilkCategoryDefaultArgs<ExtArgs>>): Prisma__MilkCategoryClient<$Result.GetResult<Prisma.$MilkCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    createdBy<T extends MilkOutflow$createdByArgs<ExtArgs> = {}>(args?: Subset<T, MilkOutflow$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MilkOutflow model
   */ 
  interface MilkOutflowFieldRefs {
    readonly id: FieldRef<"MilkOutflow", 'String'>
    readonly date: FieldRef<"MilkOutflow", 'DateTime'>
    readonly categoryId: FieldRef<"MilkOutflow", 'String'>
    readonly productType: FieldRef<"MilkOutflow", 'String'>
    readonly animalType: FieldRef<"MilkOutflow", 'String'>
    readonly packagingType: FieldRef<"MilkOutflow", 'String'>
    readonly quantity: FieldRef<"MilkOutflow", 'Int'>
    readonly notes: FieldRef<"MilkOutflow", 'String'>
    readonly createdById: FieldRef<"MilkOutflow", 'String'>
    readonly createdAt: FieldRef<"MilkOutflow", 'DateTime'>
    readonly updatedAt: FieldRef<"MilkOutflow", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MilkOutflow findUnique
   */
  export type MilkOutflowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter, which MilkOutflow to fetch.
     */
    where: MilkOutflowWhereUniqueInput
  }

  /**
   * MilkOutflow findUniqueOrThrow
   */
  export type MilkOutflowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter, which MilkOutflow to fetch.
     */
    where: MilkOutflowWhereUniqueInput
  }

  /**
   * MilkOutflow findFirst
   */
  export type MilkOutflowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter, which MilkOutflow to fetch.
     */
    where?: MilkOutflowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkOutflows to fetch.
     */
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkOutflows.
     */
    cursor?: MilkOutflowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkOutflows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkOutflows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkOutflows.
     */
    distinct?: MilkOutflowScalarFieldEnum | MilkOutflowScalarFieldEnum[]
  }

  /**
   * MilkOutflow findFirstOrThrow
   */
  export type MilkOutflowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter, which MilkOutflow to fetch.
     */
    where?: MilkOutflowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkOutflows to fetch.
     */
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkOutflows.
     */
    cursor?: MilkOutflowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkOutflows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkOutflows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkOutflows.
     */
    distinct?: MilkOutflowScalarFieldEnum | MilkOutflowScalarFieldEnum[]
  }

  /**
   * MilkOutflow findMany
   */
  export type MilkOutflowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter, which MilkOutflows to fetch.
     */
    where?: MilkOutflowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkOutflows to fetch.
     */
    orderBy?: MilkOutflowOrderByWithRelationInput | MilkOutflowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MilkOutflows.
     */
    cursor?: MilkOutflowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkOutflows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkOutflows.
     */
    skip?: number
    distinct?: MilkOutflowScalarFieldEnum | MilkOutflowScalarFieldEnum[]
  }

  /**
   * MilkOutflow create
   */
  export type MilkOutflowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * The data needed to create a MilkOutflow.
     */
    data: XOR<MilkOutflowCreateInput, MilkOutflowUncheckedCreateInput>
  }

  /**
   * MilkOutflow createMany
   */
  export type MilkOutflowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MilkOutflows.
     */
    data: MilkOutflowCreateManyInput | MilkOutflowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MilkOutflow update
   */
  export type MilkOutflowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * The data needed to update a MilkOutflow.
     */
    data: XOR<MilkOutflowUpdateInput, MilkOutflowUncheckedUpdateInput>
    /**
     * Choose, which MilkOutflow to update.
     */
    where: MilkOutflowWhereUniqueInput
  }

  /**
   * MilkOutflow updateMany
   */
  export type MilkOutflowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MilkOutflows.
     */
    data: XOR<MilkOutflowUpdateManyMutationInput, MilkOutflowUncheckedUpdateManyInput>
    /**
     * Filter which MilkOutflows to update
     */
    where?: MilkOutflowWhereInput
  }

  /**
   * MilkOutflow upsert
   */
  export type MilkOutflowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * The filter to search for the MilkOutflow to update in case it exists.
     */
    where: MilkOutflowWhereUniqueInput
    /**
     * In case the MilkOutflow found by the `where` argument doesn't exist, create a new MilkOutflow with this data.
     */
    create: XOR<MilkOutflowCreateInput, MilkOutflowUncheckedCreateInput>
    /**
     * In case the MilkOutflow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MilkOutflowUpdateInput, MilkOutflowUncheckedUpdateInput>
  }

  /**
   * MilkOutflow delete
   */
  export type MilkOutflowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
    /**
     * Filter which MilkOutflow to delete.
     */
    where: MilkOutflowWhereUniqueInput
  }

  /**
   * MilkOutflow deleteMany
   */
  export type MilkOutflowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkOutflows to delete
     */
    where?: MilkOutflowWhereInput
  }

  /**
   * MilkOutflow.createdBy
   */
  export type MilkOutflow$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * MilkOutflow without action
   */
  export type MilkOutflowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkOutflow
     */
    select?: MilkOutflowSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkOutflowInclude<ExtArgs> | null
  }


  /**
   * Model MilkSale
   */

  export type AggregateMilkSale = {
    _count: MilkSaleCountAggregateOutputType | null
    _avg: MilkSaleAvgAggregateOutputType | null
    _sum: MilkSaleSumAggregateOutputType | null
    _min: MilkSaleMinAggregateOutputType | null
    _max: MilkSaleMaxAggregateOutputType | null
  }

  export type MilkSaleAvgAggregateOutputType = {
    jumlah: number | null
    hargaJual: number | null
    quantity: number | null
    unitPrice: number | null
    totalPrice: number | null
  }

  export type MilkSaleSumAggregateOutputType = {
    jumlah: number | null
    hargaJual: number | null
    quantity: number | null
    unitPrice: number | null
    totalPrice: number | null
  }

  export type MilkSaleMinAggregateOutputType = {
    id: string | null
    transactionId: string | null
    date: Date | null
    tanggal: Date | null
    sumber: string | null
    produkRefId: string | null
    jumlah: number | null
    pembeli: string | null
    hargaJual: number | null
    kategoriBayar: string | null
    catatan: string | null
    productCategory: string | null
    productSubtype: string | null
    variant: string | null
    packagingType: string | null
    quantity: number | null
    unitPrice: number | null
    totalPrice: number | null
    status: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkSaleMaxAggregateOutputType = {
    id: string | null
    transactionId: string | null
    date: Date | null
    tanggal: Date | null
    sumber: string | null
    produkRefId: string | null
    jumlah: number | null
    pembeli: string | null
    hargaJual: number | null
    kategoriBayar: string | null
    catatan: string | null
    productCategory: string | null
    productSubtype: string | null
    variant: string | null
    packagingType: string | null
    quantity: number | null
    unitPrice: number | null
    totalPrice: number | null
    status: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MilkSaleCountAggregateOutputType = {
    id: number
    transactionId: number
    date: number
    tanggal: number
    sumber: number
    produkRefId: number
    jumlah: number
    pembeli: number
    hargaJual: number
    kategoriBayar: number
    catatan: number
    productCategory: number
    productSubtype: number
    variant: number
    packagingType: number
    quantity: number
    unitPrice: number
    totalPrice: number
    status: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MilkSaleAvgAggregateInputType = {
    jumlah?: true
    hargaJual?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
  }

  export type MilkSaleSumAggregateInputType = {
    jumlah?: true
    hargaJual?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
  }

  export type MilkSaleMinAggregateInputType = {
    id?: true
    transactionId?: true
    date?: true
    tanggal?: true
    sumber?: true
    produkRefId?: true
    jumlah?: true
    pembeli?: true
    hargaJual?: true
    kategoriBayar?: true
    catatan?: true
    productCategory?: true
    productSubtype?: true
    variant?: true
    packagingType?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkSaleMaxAggregateInputType = {
    id?: true
    transactionId?: true
    date?: true
    tanggal?: true
    sumber?: true
    produkRefId?: true
    jumlah?: true
    pembeli?: true
    hargaJual?: true
    kategoriBayar?: true
    catatan?: true
    productCategory?: true
    productSubtype?: true
    variant?: true
    packagingType?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MilkSaleCountAggregateInputType = {
    id?: true
    transactionId?: true
    date?: true
    tanggal?: true
    sumber?: true
    produkRefId?: true
    jumlah?: true
    pembeli?: true
    hargaJual?: true
    kategoriBayar?: true
    catatan?: true
    productCategory?: true
    productSubtype?: true
    variant?: true
    packagingType?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    status?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MilkSaleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkSale to aggregate.
     */
    where?: MilkSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkSales to fetch.
     */
    orderBy?: MilkSaleOrderByWithRelationInput | MilkSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MilkSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MilkSales
    **/
    _count?: true | MilkSaleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MilkSaleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MilkSaleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MilkSaleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MilkSaleMaxAggregateInputType
  }

  export type GetMilkSaleAggregateType<T extends MilkSaleAggregateArgs> = {
        [P in keyof T & keyof AggregateMilkSale]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMilkSale[P]>
      : GetScalarType<T[P], AggregateMilkSale[P]>
  }




  export type MilkSaleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MilkSaleWhereInput
    orderBy?: MilkSaleOrderByWithAggregationInput | MilkSaleOrderByWithAggregationInput[]
    by: MilkSaleScalarFieldEnum[] | MilkSaleScalarFieldEnum
    having?: MilkSaleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MilkSaleCountAggregateInputType | true
    _avg?: MilkSaleAvgAggregateInputType
    _sum?: MilkSaleSumAggregateInputType
    _min?: MilkSaleMinAggregateInputType
    _max?: MilkSaleMaxAggregateInputType
  }

  export type MilkSaleGroupByOutputType = {
    id: string
    transactionId: string | null
    date: Date
    tanggal: Date
    sumber: string
    produkRefId: string | null
    jumlah: number
    pembeli: string
    hargaJual: number
    kategoriBayar: string
    catatan: string | null
    productCategory: string
    productSubtype: string | null
    variant: string | null
    packagingType: string
    quantity: number
    unitPrice: number
    totalPrice: number
    status: string
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: MilkSaleCountAggregateOutputType | null
    _avg: MilkSaleAvgAggregateOutputType | null
    _sum: MilkSaleSumAggregateOutputType | null
    _min: MilkSaleMinAggregateOutputType | null
    _max: MilkSaleMaxAggregateOutputType | null
  }

  type GetMilkSaleGroupByPayload<T extends MilkSaleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MilkSaleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MilkSaleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MilkSaleGroupByOutputType[P]>
            : GetScalarType<T[P], MilkSaleGroupByOutputType[P]>
        }
      >
    >


  export type MilkSaleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    date?: boolean
    tanggal?: boolean
    sumber?: boolean
    produkRefId?: boolean
    jumlah?: boolean
    pembeli?: boolean
    hargaJual?: boolean
    kategoriBayar?: boolean
    catatan?: boolean
    productCategory?: boolean
    productSubtype?: boolean
    variant?: boolean
    packagingType?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    status?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean | MilkSale$createdByArgs<ExtArgs>
    piutang?: boolean | MilkSale$piutangArgs<ExtArgs>
  }, ExtArgs["result"]["milkSale"]>


  export type MilkSaleSelectScalar = {
    id?: boolean
    transactionId?: boolean
    date?: boolean
    tanggal?: boolean
    sumber?: boolean
    produkRefId?: boolean
    jumlah?: boolean
    pembeli?: boolean
    hargaJual?: boolean
    kategoriBayar?: boolean
    catatan?: boolean
    productCategory?: boolean
    productSubtype?: boolean
    variant?: boolean
    packagingType?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    status?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MilkSaleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | MilkSale$createdByArgs<ExtArgs>
    piutang?: boolean | MilkSale$piutangArgs<ExtArgs>
  }

  export type $MilkSalePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MilkSale"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs> | null
      piutang: Prisma.$PiutangPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      transactionId: string | null
      date: Date
      tanggal: Date
      sumber: string
      produkRefId: string | null
      jumlah: number
      pembeli: string
      hargaJual: number
      kategoriBayar: string
      catatan: string | null
      productCategory: string
      productSubtype: string | null
      variant: string | null
      packagingType: string
      quantity: number
      unitPrice: number
      totalPrice: number
      status: string
      notes: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["milkSale"]>
    composites: {}
  }

  type MilkSaleGetPayload<S extends boolean | null | undefined | MilkSaleDefaultArgs> = $Result.GetResult<Prisma.$MilkSalePayload, S>

  type MilkSaleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MilkSaleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MilkSaleCountAggregateInputType | true
    }

  export interface MilkSaleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MilkSale'], meta: { name: 'MilkSale' } }
    /**
     * Find zero or one MilkSale that matches the filter.
     * @param {MilkSaleFindUniqueArgs} args - Arguments to find a MilkSale
     * @example
     * // Get one MilkSale
     * const milkSale = await prisma.milkSale.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MilkSaleFindUniqueArgs>(args: SelectSubset<T, MilkSaleFindUniqueArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MilkSale that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MilkSaleFindUniqueOrThrowArgs} args - Arguments to find a MilkSale
     * @example
     * // Get one MilkSale
     * const milkSale = await prisma.milkSale.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MilkSaleFindUniqueOrThrowArgs>(args: SelectSubset<T, MilkSaleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MilkSale that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleFindFirstArgs} args - Arguments to find a MilkSale
     * @example
     * // Get one MilkSale
     * const milkSale = await prisma.milkSale.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MilkSaleFindFirstArgs>(args?: SelectSubset<T, MilkSaleFindFirstArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MilkSale that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleFindFirstOrThrowArgs} args - Arguments to find a MilkSale
     * @example
     * // Get one MilkSale
     * const milkSale = await prisma.milkSale.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MilkSaleFindFirstOrThrowArgs>(args?: SelectSubset<T, MilkSaleFindFirstOrThrowArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MilkSales that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MilkSales
     * const milkSales = await prisma.milkSale.findMany()
     * 
     * // Get first 10 MilkSales
     * const milkSales = await prisma.milkSale.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const milkSaleWithIdOnly = await prisma.milkSale.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MilkSaleFindManyArgs>(args?: SelectSubset<T, MilkSaleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MilkSale.
     * @param {MilkSaleCreateArgs} args - Arguments to create a MilkSale.
     * @example
     * // Create one MilkSale
     * const MilkSale = await prisma.milkSale.create({
     *   data: {
     *     // ... data to create a MilkSale
     *   }
     * })
     * 
     */
    create<T extends MilkSaleCreateArgs>(args: SelectSubset<T, MilkSaleCreateArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MilkSales.
     * @param {MilkSaleCreateManyArgs} args - Arguments to create many MilkSales.
     * @example
     * // Create many MilkSales
     * const milkSale = await prisma.milkSale.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MilkSaleCreateManyArgs>(args?: SelectSubset<T, MilkSaleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MilkSale.
     * @param {MilkSaleDeleteArgs} args - Arguments to delete one MilkSale.
     * @example
     * // Delete one MilkSale
     * const MilkSale = await prisma.milkSale.delete({
     *   where: {
     *     // ... filter to delete one MilkSale
     *   }
     * })
     * 
     */
    delete<T extends MilkSaleDeleteArgs>(args: SelectSubset<T, MilkSaleDeleteArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MilkSale.
     * @param {MilkSaleUpdateArgs} args - Arguments to update one MilkSale.
     * @example
     * // Update one MilkSale
     * const milkSale = await prisma.milkSale.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MilkSaleUpdateArgs>(args: SelectSubset<T, MilkSaleUpdateArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MilkSales.
     * @param {MilkSaleDeleteManyArgs} args - Arguments to filter MilkSales to delete.
     * @example
     * // Delete a few MilkSales
     * const { count } = await prisma.milkSale.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MilkSaleDeleteManyArgs>(args?: SelectSubset<T, MilkSaleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MilkSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MilkSales
     * const milkSale = await prisma.milkSale.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MilkSaleUpdateManyArgs>(args: SelectSubset<T, MilkSaleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MilkSale.
     * @param {MilkSaleUpsertArgs} args - Arguments to update or create a MilkSale.
     * @example
     * // Update or create a MilkSale
     * const milkSale = await prisma.milkSale.upsert({
     *   create: {
     *     // ... data to create a MilkSale
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MilkSale we want to update
     *   }
     * })
     */
    upsert<T extends MilkSaleUpsertArgs>(args: SelectSubset<T, MilkSaleUpsertArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MilkSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleCountArgs} args - Arguments to filter MilkSales to count.
     * @example
     * // Count the number of MilkSales
     * const count = await prisma.milkSale.count({
     *   where: {
     *     // ... the filter for the MilkSales we want to count
     *   }
     * })
    **/
    count<T extends MilkSaleCountArgs>(
      args?: Subset<T, MilkSaleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MilkSaleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MilkSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MilkSaleAggregateArgs>(args: Subset<T, MilkSaleAggregateArgs>): Prisma.PrismaPromise<GetMilkSaleAggregateType<T>>

    /**
     * Group by MilkSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MilkSaleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MilkSaleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MilkSaleGroupByArgs['orderBy'] }
        : { orderBy?: MilkSaleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MilkSaleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMilkSaleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MilkSale model
   */
  readonly fields: MilkSaleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MilkSale.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MilkSaleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends MilkSale$createdByArgs<ExtArgs> = {}>(args?: Subset<T, MilkSale$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    piutang<T extends MilkSale$piutangArgs<ExtArgs> = {}>(args?: Subset<T, MilkSale$piutangArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MilkSale model
   */ 
  interface MilkSaleFieldRefs {
    readonly id: FieldRef<"MilkSale", 'String'>
    readonly transactionId: FieldRef<"MilkSale", 'String'>
    readonly date: FieldRef<"MilkSale", 'DateTime'>
    readonly tanggal: FieldRef<"MilkSale", 'DateTime'>
    readonly sumber: FieldRef<"MilkSale", 'String'>
    readonly produkRefId: FieldRef<"MilkSale", 'String'>
    readonly jumlah: FieldRef<"MilkSale", 'Float'>
    readonly pembeli: FieldRef<"MilkSale", 'String'>
    readonly hargaJual: FieldRef<"MilkSale", 'Float'>
    readonly kategoriBayar: FieldRef<"MilkSale", 'String'>
    readonly catatan: FieldRef<"MilkSale", 'String'>
    readonly productCategory: FieldRef<"MilkSale", 'String'>
    readonly productSubtype: FieldRef<"MilkSale", 'String'>
    readonly variant: FieldRef<"MilkSale", 'String'>
    readonly packagingType: FieldRef<"MilkSale", 'String'>
    readonly quantity: FieldRef<"MilkSale", 'Int'>
    readonly unitPrice: FieldRef<"MilkSale", 'Float'>
    readonly totalPrice: FieldRef<"MilkSale", 'Float'>
    readonly status: FieldRef<"MilkSale", 'String'>
    readonly notes: FieldRef<"MilkSale", 'String'>
    readonly createdById: FieldRef<"MilkSale", 'String'>
    readonly createdAt: FieldRef<"MilkSale", 'DateTime'>
    readonly updatedAt: FieldRef<"MilkSale", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MilkSale findUnique
   */
  export type MilkSaleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter, which MilkSale to fetch.
     */
    where: MilkSaleWhereUniqueInput
  }

  /**
   * MilkSale findUniqueOrThrow
   */
  export type MilkSaleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter, which MilkSale to fetch.
     */
    where: MilkSaleWhereUniqueInput
  }

  /**
   * MilkSale findFirst
   */
  export type MilkSaleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter, which MilkSale to fetch.
     */
    where?: MilkSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkSales to fetch.
     */
    orderBy?: MilkSaleOrderByWithRelationInput | MilkSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkSales.
     */
    cursor?: MilkSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkSales.
     */
    distinct?: MilkSaleScalarFieldEnum | MilkSaleScalarFieldEnum[]
  }

  /**
   * MilkSale findFirstOrThrow
   */
  export type MilkSaleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter, which MilkSale to fetch.
     */
    where?: MilkSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkSales to fetch.
     */
    orderBy?: MilkSaleOrderByWithRelationInput | MilkSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MilkSales.
     */
    cursor?: MilkSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MilkSales.
     */
    distinct?: MilkSaleScalarFieldEnum | MilkSaleScalarFieldEnum[]
  }

  /**
   * MilkSale findMany
   */
  export type MilkSaleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter, which MilkSales to fetch.
     */
    where?: MilkSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MilkSales to fetch.
     */
    orderBy?: MilkSaleOrderByWithRelationInput | MilkSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MilkSales.
     */
    cursor?: MilkSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MilkSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MilkSales.
     */
    skip?: number
    distinct?: MilkSaleScalarFieldEnum | MilkSaleScalarFieldEnum[]
  }

  /**
   * MilkSale create
   */
  export type MilkSaleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * The data needed to create a MilkSale.
     */
    data: XOR<MilkSaleCreateInput, MilkSaleUncheckedCreateInput>
  }

  /**
   * MilkSale createMany
   */
  export type MilkSaleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MilkSales.
     */
    data: MilkSaleCreateManyInput | MilkSaleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MilkSale update
   */
  export type MilkSaleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * The data needed to update a MilkSale.
     */
    data: XOR<MilkSaleUpdateInput, MilkSaleUncheckedUpdateInput>
    /**
     * Choose, which MilkSale to update.
     */
    where: MilkSaleWhereUniqueInput
  }

  /**
   * MilkSale updateMany
   */
  export type MilkSaleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MilkSales.
     */
    data: XOR<MilkSaleUpdateManyMutationInput, MilkSaleUncheckedUpdateManyInput>
    /**
     * Filter which MilkSales to update
     */
    where?: MilkSaleWhereInput
  }

  /**
   * MilkSale upsert
   */
  export type MilkSaleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * The filter to search for the MilkSale to update in case it exists.
     */
    where: MilkSaleWhereUniqueInput
    /**
     * In case the MilkSale found by the `where` argument doesn't exist, create a new MilkSale with this data.
     */
    create: XOR<MilkSaleCreateInput, MilkSaleUncheckedCreateInput>
    /**
     * In case the MilkSale was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MilkSaleUpdateInput, MilkSaleUncheckedUpdateInput>
  }

  /**
   * MilkSale delete
   */
  export type MilkSaleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
    /**
     * Filter which MilkSale to delete.
     */
    where: MilkSaleWhereUniqueInput
  }

  /**
   * MilkSale deleteMany
   */
  export type MilkSaleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MilkSales to delete
     */
    where?: MilkSaleWhereInput
  }

  /**
   * MilkSale.createdBy
   */
  export type MilkSale$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * MilkSale.piutang
   */
  export type MilkSale$piutangArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    where?: PiutangWhereInput
  }

  /**
   * MilkSale without action
   */
  export type MilkSaleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MilkSale
     */
    select?: MilkSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MilkSaleInclude<ExtArgs> | null
  }


  /**
   * Model Piutang
   */

  export type AggregatePiutang = {
    _count: PiutangCountAggregateOutputType | null
    _avg: PiutangAvgAggregateOutputType | null
    _sum: PiutangSumAggregateOutputType | null
    _min: PiutangMinAggregateOutputType | null
    _max: PiutangMaxAggregateOutputType | null
  }

  export type PiutangAvgAggregateOutputType = {
    jumlahAwal: number | null
    sisaPiutang: number | null
  }

  export type PiutangSumAggregateOutputType = {
    jumlahAwal: number | null
    sisaPiutang: number | null
  }

  export type PiutangMinAggregateOutputType = {
    id: string | null
    milkSaleId: string | null
    jumlahAwal: number | null
    sisaPiutang: number | null
    lunas: boolean | null
    createdAt: Date | null
  }

  export type PiutangMaxAggregateOutputType = {
    id: string | null
    milkSaleId: string | null
    jumlahAwal: number | null
    sisaPiutang: number | null
    lunas: boolean | null
    createdAt: Date | null
  }

  export type PiutangCountAggregateOutputType = {
    id: number
    milkSaleId: number
    jumlahAwal: number
    sisaPiutang: number
    lunas: number
    createdAt: number
    _all: number
  }


  export type PiutangAvgAggregateInputType = {
    jumlahAwal?: true
    sisaPiutang?: true
  }

  export type PiutangSumAggregateInputType = {
    jumlahAwal?: true
    sisaPiutang?: true
  }

  export type PiutangMinAggregateInputType = {
    id?: true
    milkSaleId?: true
    jumlahAwal?: true
    sisaPiutang?: true
    lunas?: true
    createdAt?: true
  }

  export type PiutangMaxAggregateInputType = {
    id?: true
    milkSaleId?: true
    jumlahAwal?: true
    sisaPiutang?: true
    lunas?: true
    createdAt?: true
  }

  export type PiutangCountAggregateInputType = {
    id?: true
    milkSaleId?: true
    jumlahAwal?: true
    sisaPiutang?: true
    lunas?: true
    createdAt?: true
    _all?: true
  }

  export type PiutangAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Piutang to aggregate.
     */
    where?: PiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Piutangs to fetch.
     */
    orderBy?: PiutangOrderByWithRelationInput | PiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Piutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Piutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Piutangs
    **/
    _count?: true | PiutangCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PiutangAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PiutangSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PiutangMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PiutangMaxAggregateInputType
  }

  export type GetPiutangAggregateType<T extends PiutangAggregateArgs> = {
        [P in keyof T & keyof AggregatePiutang]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePiutang[P]>
      : GetScalarType<T[P], AggregatePiutang[P]>
  }




  export type PiutangGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PiutangWhereInput
    orderBy?: PiutangOrderByWithAggregationInput | PiutangOrderByWithAggregationInput[]
    by: PiutangScalarFieldEnum[] | PiutangScalarFieldEnum
    having?: PiutangScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PiutangCountAggregateInputType | true
    _avg?: PiutangAvgAggregateInputType
    _sum?: PiutangSumAggregateInputType
    _min?: PiutangMinAggregateInputType
    _max?: PiutangMaxAggregateInputType
  }

  export type PiutangGroupByOutputType = {
    id: string
    milkSaleId: string
    jumlahAwal: number
    sisaPiutang: number
    lunas: boolean
    createdAt: Date
    _count: PiutangCountAggregateOutputType | null
    _avg: PiutangAvgAggregateOutputType | null
    _sum: PiutangSumAggregateOutputType | null
    _min: PiutangMinAggregateOutputType | null
    _max: PiutangMaxAggregateOutputType | null
  }

  type GetPiutangGroupByPayload<T extends PiutangGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PiutangGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PiutangGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PiutangGroupByOutputType[P]>
            : GetScalarType<T[P], PiutangGroupByOutputType[P]>
        }
      >
    >


  export type PiutangSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    milkSaleId?: boolean
    jumlahAwal?: boolean
    sisaPiutang?: boolean
    lunas?: boolean
    createdAt?: boolean
    milkSale?: boolean | MilkSaleDefaultArgs<ExtArgs>
    pelunasan?: boolean | Piutang$pelunasanArgs<ExtArgs>
    _count?: boolean | PiutangCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["piutang"]>


  export type PiutangSelectScalar = {
    id?: boolean
    milkSaleId?: boolean
    jumlahAwal?: boolean
    sisaPiutang?: boolean
    lunas?: boolean
    createdAt?: boolean
  }

  export type PiutangInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    milkSale?: boolean | MilkSaleDefaultArgs<ExtArgs>
    pelunasan?: boolean | Piutang$pelunasanArgs<ExtArgs>
    _count?: boolean | PiutangCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $PiutangPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Piutang"
    objects: {
      milkSale: Prisma.$MilkSalePayload<ExtArgs>
      pelunasan: Prisma.$PelunasanPiutangPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      milkSaleId: string
      jumlahAwal: number
      sisaPiutang: number
      lunas: boolean
      createdAt: Date
    }, ExtArgs["result"]["piutang"]>
    composites: {}
  }

  type PiutangGetPayload<S extends boolean | null | undefined | PiutangDefaultArgs> = $Result.GetResult<Prisma.$PiutangPayload, S>

  type PiutangCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PiutangFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PiutangCountAggregateInputType | true
    }

  export interface PiutangDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Piutang'], meta: { name: 'Piutang' } }
    /**
     * Find zero or one Piutang that matches the filter.
     * @param {PiutangFindUniqueArgs} args - Arguments to find a Piutang
     * @example
     * // Get one Piutang
     * const piutang = await prisma.piutang.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PiutangFindUniqueArgs>(args: SelectSubset<T, PiutangFindUniqueArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Piutang that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PiutangFindUniqueOrThrowArgs} args - Arguments to find a Piutang
     * @example
     * // Get one Piutang
     * const piutang = await prisma.piutang.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PiutangFindUniqueOrThrowArgs>(args: SelectSubset<T, PiutangFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Piutang that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangFindFirstArgs} args - Arguments to find a Piutang
     * @example
     * // Get one Piutang
     * const piutang = await prisma.piutang.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PiutangFindFirstArgs>(args?: SelectSubset<T, PiutangFindFirstArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Piutang that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangFindFirstOrThrowArgs} args - Arguments to find a Piutang
     * @example
     * // Get one Piutang
     * const piutang = await prisma.piutang.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PiutangFindFirstOrThrowArgs>(args?: SelectSubset<T, PiutangFindFirstOrThrowArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Piutangs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Piutangs
     * const piutangs = await prisma.piutang.findMany()
     * 
     * // Get first 10 Piutangs
     * const piutangs = await prisma.piutang.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const piutangWithIdOnly = await prisma.piutang.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PiutangFindManyArgs>(args?: SelectSubset<T, PiutangFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Piutang.
     * @param {PiutangCreateArgs} args - Arguments to create a Piutang.
     * @example
     * // Create one Piutang
     * const Piutang = await prisma.piutang.create({
     *   data: {
     *     // ... data to create a Piutang
     *   }
     * })
     * 
     */
    create<T extends PiutangCreateArgs>(args: SelectSubset<T, PiutangCreateArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Piutangs.
     * @param {PiutangCreateManyArgs} args - Arguments to create many Piutangs.
     * @example
     * // Create many Piutangs
     * const piutang = await prisma.piutang.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PiutangCreateManyArgs>(args?: SelectSubset<T, PiutangCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Piutang.
     * @param {PiutangDeleteArgs} args - Arguments to delete one Piutang.
     * @example
     * // Delete one Piutang
     * const Piutang = await prisma.piutang.delete({
     *   where: {
     *     // ... filter to delete one Piutang
     *   }
     * })
     * 
     */
    delete<T extends PiutangDeleteArgs>(args: SelectSubset<T, PiutangDeleteArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Piutang.
     * @param {PiutangUpdateArgs} args - Arguments to update one Piutang.
     * @example
     * // Update one Piutang
     * const piutang = await prisma.piutang.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PiutangUpdateArgs>(args: SelectSubset<T, PiutangUpdateArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Piutangs.
     * @param {PiutangDeleteManyArgs} args - Arguments to filter Piutangs to delete.
     * @example
     * // Delete a few Piutangs
     * const { count } = await prisma.piutang.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PiutangDeleteManyArgs>(args?: SelectSubset<T, PiutangDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Piutangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Piutangs
     * const piutang = await prisma.piutang.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PiutangUpdateManyArgs>(args: SelectSubset<T, PiutangUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Piutang.
     * @param {PiutangUpsertArgs} args - Arguments to update or create a Piutang.
     * @example
     * // Update or create a Piutang
     * const piutang = await prisma.piutang.upsert({
     *   create: {
     *     // ... data to create a Piutang
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Piutang we want to update
     *   }
     * })
     */
    upsert<T extends PiutangUpsertArgs>(args: SelectSubset<T, PiutangUpsertArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Piutangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangCountArgs} args - Arguments to filter Piutangs to count.
     * @example
     * // Count the number of Piutangs
     * const count = await prisma.piutang.count({
     *   where: {
     *     // ... the filter for the Piutangs we want to count
     *   }
     * })
    **/
    count<T extends PiutangCountArgs>(
      args?: Subset<T, PiutangCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PiutangCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Piutang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PiutangAggregateArgs>(args: Subset<T, PiutangAggregateArgs>): Prisma.PrismaPromise<GetPiutangAggregateType<T>>

    /**
     * Group by Piutang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PiutangGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PiutangGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PiutangGroupByArgs['orderBy'] }
        : { orderBy?: PiutangGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PiutangGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPiutangGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Piutang model
   */
  readonly fields: PiutangFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Piutang.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PiutangClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    milkSale<T extends MilkSaleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MilkSaleDefaultArgs<ExtArgs>>): Prisma__MilkSaleClient<$Result.GetResult<Prisma.$MilkSalePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    pelunasan<T extends Piutang$pelunasanArgs<ExtArgs> = {}>(args?: Subset<T, Piutang$pelunasanArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Piutang model
   */ 
  interface PiutangFieldRefs {
    readonly id: FieldRef<"Piutang", 'String'>
    readonly milkSaleId: FieldRef<"Piutang", 'String'>
    readonly jumlahAwal: FieldRef<"Piutang", 'Float'>
    readonly sisaPiutang: FieldRef<"Piutang", 'Float'>
    readonly lunas: FieldRef<"Piutang", 'Boolean'>
    readonly createdAt: FieldRef<"Piutang", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Piutang findUnique
   */
  export type PiutangFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter, which Piutang to fetch.
     */
    where: PiutangWhereUniqueInput
  }

  /**
   * Piutang findUniqueOrThrow
   */
  export type PiutangFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter, which Piutang to fetch.
     */
    where: PiutangWhereUniqueInput
  }

  /**
   * Piutang findFirst
   */
  export type PiutangFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter, which Piutang to fetch.
     */
    where?: PiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Piutangs to fetch.
     */
    orderBy?: PiutangOrderByWithRelationInput | PiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Piutangs.
     */
    cursor?: PiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Piutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Piutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Piutangs.
     */
    distinct?: PiutangScalarFieldEnum | PiutangScalarFieldEnum[]
  }

  /**
   * Piutang findFirstOrThrow
   */
  export type PiutangFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter, which Piutang to fetch.
     */
    where?: PiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Piutangs to fetch.
     */
    orderBy?: PiutangOrderByWithRelationInput | PiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Piutangs.
     */
    cursor?: PiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Piutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Piutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Piutangs.
     */
    distinct?: PiutangScalarFieldEnum | PiutangScalarFieldEnum[]
  }

  /**
   * Piutang findMany
   */
  export type PiutangFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter, which Piutangs to fetch.
     */
    where?: PiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Piutangs to fetch.
     */
    orderBy?: PiutangOrderByWithRelationInput | PiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Piutangs.
     */
    cursor?: PiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Piutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Piutangs.
     */
    skip?: number
    distinct?: PiutangScalarFieldEnum | PiutangScalarFieldEnum[]
  }

  /**
   * Piutang create
   */
  export type PiutangCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * The data needed to create a Piutang.
     */
    data: XOR<PiutangCreateInput, PiutangUncheckedCreateInput>
  }

  /**
   * Piutang createMany
   */
  export type PiutangCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Piutangs.
     */
    data: PiutangCreateManyInput | PiutangCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Piutang update
   */
  export type PiutangUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * The data needed to update a Piutang.
     */
    data: XOR<PiutangUpdateInput, PiutangUncheckedUpdateInput>
    /**
     * Choose, which Piutang to update.
     */
    where: PiutangWhereUniqueInput
  }

  /**
   * Piutang updateMany
   */
  export type PiutangUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Piutangs.
     */
    data: XOR<PiutangUpdateManyMutationInput, PiutangUncheckedUpdateManyInput>
    /**
     * Filter which Piutangs to update
     */
    where?: PiutangWhereInput
  }

  /**
   * Piutang upsert
   */
  export type PiutangUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * The filter to search for the Piutang to update in case it exists.
     */
    where: PiutangWhereUniqueInput
    /**
     * In case the Piutang found by the `where` argument doesn't exist, create a new Piutang with this data.
     */
    create: XOR<PiutangCreateInput, PiutangUncheckedCreateInput>
    /**
     * In case the Piutang was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PiutangUpdateInput, PiutangUncheckedUpdateInput>
  }

  /**
   * Piutang delete
   */
  export type PiutangDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
    /**
     * Filter which Piutang to delete.
     */
    where: PiutangWhereUniqueInput
  }

  /**
   * Piutang deleteMany
   */
  export type PiutangDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Piutangs to delete
     */
    where?: PiutangWhereInput
  }

  /**
   * Piutang.pelunasan
   */
  export type Piutang$pelunasanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    where?: PelunasanPiutangWhereInput
    orderBy?: PelunasanPiutangOrderByWithRelationInput | PelunasanPiutangOrderByWithRelationInput[]
    cursor?: PelunasanPiutangWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PelunasanPiutangScalarFieldEnum | PelunasanPiutangScalarFieldEnum[]
  }

  /**
   * Piutang without action
   */
  export type PiutangDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Piutang
     */
    select?: PiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PiutangInclude<ExtArgs> | null
  }


  /**
   * Model PelunasanPiutang
   */

  export type AggregatePelunasanPiutang = {
    _count: PelunasanPiutangCountAggregateOutputType | null
    _avg: PelunasanPiutangAvgAggregateOutputType | null
    _sum: PelunasanPiutangSumAggregateOutputType | null
    _min: PelunasanPiutangMinAggregateOutputType | null
    _max: PelunasanPiutangMaxAggregateOutputType | null
  }

  export type PelunasanPiutangAvgAggregateOutputType = {
    jumlah: number | null
  }

  export type PelunasanPiutangSumAggregateOutputType = {
    jumlah: number | null
  }

  export type PelunasanPiutangMinAggregateOutputType = {
    id: string | null
    piutangId: string | null
    jumlah: number | null
    tanggal: Date | null
    catatan: string | null
  }

  export type PelunasanPiutangMaxAggregateOutputType = {
    id: string | null
    piutangId: string | null
    jumlah: number | null
    tanggal: Date | null
    catatan: string | null
  }

  export type PelunasanPiutangCountAggregateOutputType = {
    id: number
    piutangId: number
    jumlah: number
    tanggal: number
    catatan: number
    _all: number
  }


  export type PelunasanPiutangAvgAggregateInputType = {
    jumlah?: true
  }

  export type PelunasanPiutangSumAggregateInputType = {
    jumlah?: true
  }

  export type PelunasanPiutangMinAggregateInputType = {
    id?: true
    piutangId?: true
    jumlah?: true
    tanggal?: true
    catatan?: true
  }

  export type PelunasanPiutangMaxAggregateInputType = {
    id?: true
    piutangId?: true
    jumlah?: true
    tanggal?: true
    catatan?: true
  }

  export type PelunasanPiutangCountAggregateInputType = {
    id?: true
    piutangId?: true
    jumlah?: true
    tanggal?: true
    catatan?: true
    _all?: true
  }

  export type PelunasanPiutangAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PelunasanPiutang to aggregate.
     */
    where?: PelunasanPiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PelunasanPiutangs to fetch.
     */
    orderBy?: PelunasanPiutangOrderByWithRelationInput | PelunasanPiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PelunasanPiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PelunasanPiutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PelunasanPiutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PelunasanPiutangs
    **/
    _count?: true | PelunasanPiutangCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PelunasanPiutangAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PelunasanPiutangSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PelunasanPiutangMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PelunasanPiutangMaxAggregateInputType
  }

  export type GetPelunasanPiutangAggregateType<T extends PelunasanPiutangAggregateArgs> = {
        [P in keyof T & keyof AggregatePelunasanPiutang]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePelunasanPiutang[P]>
      : GetScalarType<T[P], AggregatePelunasanPiutang[P]>
  }




  export type PelunasanPiutangGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PelunasanPiutangWhereInput
    orderBy?: PelunasanPiutangOrderByWithAggregationInput | PelunasanPiutangOrderByWithAggregationInput[]
    by: PelunasanPiutangScalarFieldEnum[] | PelunasanPiutangScalarFieldEnum
    having?: PelunasanPiutangScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PelunasanPiutangCountAggregateInputType | true
    _avg?: PelunasanPiutangAvgAggregateInputType
    _sum?: PelunasanPiutangSumAggregateInputType
    _min?: PelunasanPiutangMinAggregateInputType
    _max?: PelunasanPiutangMaxAggregateInputType
  }

  export type PelunasanPiutangGroupByOutputType = {
    id: string
    piutangId: string
    jumlah: number
    tanggal: Date
    catatan: string | null
    _count: PelunasanPiutangCountAggregateOutputType | null
    _avg: PelunasanPiutangAvgAggregateOutputType | null
    _sum: PelunasanPiutangSumAggregateOutputType | null
    _min: PelunasanPiutangMinAggregateOutputType | null
    _max: PelunasanPiutangMaxAggregateOutputType | null
  }

  type GetPelunasanPiutangGroupByPayload<T extends PelunasanPiutangGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PelunasanPiutangGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PelunasanPiutangGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PelunasanPiutangGroupByOutputType[P]>
            : GetScalarType<T[P], PelunasanPiutangGroupByOutputType[P]>
        }
      >
    >


  export type PelunasanPiutangSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    piutangId?: boolean
    jumlah?: boolean
    tanggal?: boolean
    catatan?: boolean
    piutang?: boolean | PiutangDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pelunasanPiutang"]>


  export type PelunasanPiutangSelectScalar = {
    id?: boolean
    piutangId?: boolean
    jumlah?: boolean
    tanggal?: boolean
    catatan?: boolean
  }

  export type PelunasanPiutangInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    piutang?: boolean | PiutangDefaultArgs<ExtArgs>
  }

  export type $PelunasanPiutangPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PelunasanPiutang"
    objects: {
      piutang: Prisma.$PiutangPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      piutangId: string
      jumlah: number
      tanggal: Date
      catatan: string | null
    }, ExtArgs["result"]["pelunasanPiutang"]>
    composites: {}
  }

  type PelunasanPiutangGetPayload<S extends boolean | null | undefined | PelunasanPiutangDefaultArgs> = $Result.GetResult<Prisma.$PelunasanPiutangPayload, S>

  type PelunasanPiutangCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PelunasanPiutangFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PelunasanPiutangCountAggregateInputType | true
    }

  export interface PelunasanPiutangDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PelunasanPiutang'], meta: { name: 'PelunasanPiutang' } }
    /**
     * Find zero or one PelunasanPiutang that matches the filter.
     * @param {PelunasanPiutangFindUniqueArgs} args - Arguments to find a PelunasanPiutang
     * @example
     * // Get one PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PelunasanPiutangFindUniqueArgs>(args: SelectSubset<T, PelunasanPiutangFindUniqueArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PelunasanPiutang that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PelunasanPiutangFindUniqueOrThrowArgs} args - Arguments to find a PelunasanPiutang
     * @example
     * // Get one PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PelunasanPiutangFindUniqueOrThrowArgs>(args: SelectSubset<T, PelunasanPiutangFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PelunasanPiutang that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangFindFirstArgs} args - Arguments to find a PelunasanPiutang
     * @example
     * // Get one PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PelunasanPiutangFindFirstArgs>(args?: SelectSubset<T, PelunasanPiutangFindFirstArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PelunasanPiutang that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangFindFirstOrThrowArgs} args - Arguments to find a PelunasanPiutang
     * @example
     * // Get one PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PelunasanPiutangFindFirstOrThrowArgs>(args?: SelectSubset<T, PelunasanPiutangFindFirstOrThrowArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PelunasanPiutangs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PelunasanPiutangs
     * const pelunasanPiutangs = await prisma.pelunasanPiutang.findMany()
     * 
     * // Get first 10 PelunasanPiutangs
     * const pelunasanPiutangs = await prisma.pelunasanPiutang.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pelunasanPiutangWithIdOnly = await prisma.pelunasanPiutang.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PelunasanPiutangFindManyArgs>(args?: SelectSubset<T, PelunasanPiutangFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PelunasanPiutang.
     * @param {PelunasanPiutangCreateArgs} args - Arguments to create a PelunasanPiutang.
     * @example
     * // Create one PelunasanPiutang
     * const PelunasanPiutang = await prisma.pelunasanPiutang.create({
     *   data: {
     *     // ... data to create a PelunasanPiutang
     *   }
     * })
     * 
     */
    create<T extends PelunasanPiutangCreateArgs>(args: SelectSubset<T, PelunasanPiutangCreateArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PelunasanPiutangs.
     * @param {PelunasanPiutangCreateManyArgs} args - Arguments to create many PelunasanPiutangs.
     * @example
     * // Create many PelunasanPiutangs
     * const pelunasanPiutang = await prisma.pelunasanPiutang.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PelunasanPiutangCreateManyArgs>(args?: SelectSubset<T, PelunasanPiutangCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PelunasanPiutang.
     * @param {PelunasanPiutangDeleteArgs} args - Arguments to delete one PelunasanPiutang.
     * @example
     * // Delete one PelunasanPiutang
     * const PelunasanPiutang = await prisma.pelunasanPiutang.delete({
     *   where: {
     *     // ... filter to delete one PelunasanPiutang
     *   }
     * })
     * 
     */
    delete<T extends PelunasanPiutangDeleteArgs>(args: SelectSubset<T, PelunasanPiutangDeleteArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PelunasanPiutang.
     * @param {PelunasanPiutangUpdateArgs} args - Arguments to update one PelunasanPiutang.
     * @example
     * // Update one PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PelunasanPiutangUpdateArgs>(args: SelectSubset<T, PelunasanPiutangUpdateArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PelunasanPiutangs.
     * @param {PelunasanPiutangDeleteManyArgs} args - Arguments to filter PelunasanPiutangs to delete.
     * @example
     * // Delete a few PelunasanPiutangs
     * const { count } = await prisma.pelunasanPiutang.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PelunasanPiutangDeleteManyArgs>(args?: SelectSubset<T, PelunasanPiutangDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PelunasanPiutangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PelunasanPiutangs
     * const pelunasanPiutang = await prisma.pelunasanPiutang.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PelunasanPiutangUpdateManyArgs>(args: SelectSubset<T, PelunasanPiutangUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PelunasanPiutang.
     * @param {PelunasanPiutangUpsertArgs} args - Arguments to update or create a PelunasanPiutang.
     * @example
     * // Update or create a PelunasanPiutang
     * const pelunasanPiutang = await prisma.pelunasanPiutang.upsert({
     *   create: {
     *     // ... data to create a PelunasanPiutang
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PelunasanPiutang we want to update
     *   }
     * })
     */
    upsert<T extends PelunasanPiutangUpsertArgs>(args: SelectSubset<T, PelunasanPiutangUpsertArgs<ExtArgs>>): Prisma__PelunasanPiutangClient<$Result.GetResult<Prisma.$PelunasanPiutangPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PelunasanPiutangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangCountArgs} args - Arguments to filter PelunasanPiutangs to count.
     * @example
     * // Count the number of PelunasanPiutangs
     * const count = await prisma.pelunasanPiutang.count({
     *   where: {
     *     // ... the filter for the PelunasanPiutangs we want to count
     *   }
     * })
    **/
    count<T extends PelunasanPiutangCountArgs>(
      args?: Subset<T, PelunasanPiutangCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PelunasanPiutangCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PelunasanPiutang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PelunasanPiutangAggregateArgs>(args: Subset<T, PelunasanPiutangAggregateArgs>): Prisma.PrismaPromise<GetPelunasanPiutangAggregateType<T>>

    /**
     * Group by PelunasanPiutang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PelunasanPiutangGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PelunasanPiutangGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PelunasanPiutangGroupByArgs['orderBy'] }
        : { orderBy?: PelunasanPiutangGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PelunasanPiutangGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPelunasanPiutangGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PelunasanPiutang model
   */
  readonly fields: PelunasanPiutangFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PelunasanPiutang.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PelunasanPiutangClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    piutang<T extends PiutangDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PiutangDefaultArgs<ExtArgs>>): Prisma__PiutangClient<$Result.GetResult<Prisma.$PiutangPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PelunasanPiutang model
   */ 
  interface PelunasanPiutangFieldRefs {
    readonly id: FieldRef<"PelunasanPiutang", 'String'>
    readonly piutangId: FieldRef<"PelunasanPiutang", 'String'>
    readonly jumlah: FieldRef<"PelunasanPiutang", 'Float'>
    readonly tanggal: FieldRef<"PelunasanPiutang", 'DateTime'>
    readonly catatan: FieldRef<"PelunasanPiutang", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PelunasanPiutang findUnique
   */
  export type PelunasanPiutangFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter, which PelunasanPiutang to fetch.
     */
    where: PelunasanPiutangWhereUniqueInput
  }

  /**
   * PelunasanPiutang findUniqueOrThrow
   */
  export type PelunasanPiutangFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter, which PelunasanPiutang to fetch.
     */
    where: PelunasanPiutangWhereUniqueInput
  }

  /**
   * PelunasanPiutang findFirst
   */
  export type PelunasanPiutangFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter, which PelunasanPiutang to fetch.
     */
    where?: PelunasanPiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PelunasanPiutangs to fetch.
     */
    orderBy?: PelunasanPiutangOrderByWithRelationInput | PelunasanPiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PelunasanPiutangs.
     */
    cursor?: PelunasanPiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PelunasanPiutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PelunasanPiutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PelunasanPiutangs.
     */
    distinct?: PelunasanPiutangScalarFieldEnum | PelunasanPiutangScalarFieldEnum[]
  }

  /**
   * PelunasanPiutang findFirstOrThrow
   */
  export type PelunasanPiutangFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter, which PelunasanPiutang to fetch.
     */
    where?: PelunasanPiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PelunasanPiutangs to fetch.
     */
    orderBy?: PelunasanPiutangOrderByWithRelationInput | PelunasanPiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PelunasanPiutangs.
     */
    cursor?: PelunasanPiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PelunasanPiutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PelunasanPiutangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PelunasanPiutangs.
     */
    distinct?: PelunasanPiutangScalarFieldEnum | PelunasanPiutangScalarFieldEnum[]
  }

  /**
   * PelunasanPiutang findMany
   */
  export type PelunasanPiutangFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter, which PelunasanPiutangs to fetch.
     */
    where?: PelunasanPiutangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PelunasanPiutangs to fetch.
     */
    orderBy?: PelunasanPiutangOrderByWithRelationInput | PelunasanPiutangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PelunasanPiutangs.
     */
    cursor?: PelunasanPiutangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PelunasanPiutangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PelunasanPiutangs.
     */
    skip?: number
    distinct?: PelunasanPiutangScalarFieldEnum | PelunasanPiutangScalarFieldEnum[]
  }

  /**
   * PelunasanPiutang create
   */
  export type PelunasanPiutangCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * The data needed to create a PelunasanPiutang.
     */
    data: XOR<PelunasanPiutangCreateInput, PelunasanPiutangUncheckedCreateInput>
  }

  /**
   * PelunasanPiutang createMany
   */
  export type PelunasanPiutangCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PelunasanPiutangs.
     */
    data: PelunasanPiutangCreateManyInput | PelunasanPiutangCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PelunasanPiutang update
   */
  export type PelunasanPiutangUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * The data needed to update a PelunasanPiutang.
     */
    data: XOR<PelunasanPiutangUpdateInput, PelunasanPiutangUncheckedUpdateInput>
    /**
     * Choose, which PelunasanPiutang to update.
     */
    where: PelunasanPiutangWhereUniqueInput
  }

  /**
   * PelunasanPiutang updateMany
   */
  export type PelunasanPiutangUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PelunasanPiutangs.
     */
    data: XOR<PelunasanPiutangUpdateManyMutationInput, PelunasanPiutangUncheckedUpdateManyInput>
    /**
     * Filter which PelunasanPiutangs to update
     */
    where?: PelunasanPiutangWhereInput
  }

  /**
   * PelunasanPiutang upsert
   */
  export type PelunasanPiutangUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * The filter to search for the PelunasanPiutang to update in case it exists.
     */
    where: PelunasanPiutangWhereUniqueInput
    /**
     * In case the PelunasanPiutang found by the `where` argument doesn't exist, create a new PelunasanPiutang with this data.
     */
    create: XOR<PelunasanPiutangCreateInput, PelunasanPiutangUncheckedCreateInput>
    /**
     * In case the PelunasanPiutang was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PelunasanPiutangUpdateInput, PelunasanPiutangUncheckedUpdateInput>
  }

  /**
   * PelunasanPiutang delete
   */
  export type PelunasanPiutangDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
    /**
     * Filter which PelunasanPiutang to delete.
     */
    where: PelunasanPiutangWhereUniqueInput
  }

  /**
   * PelunasanPiutang deleteMany
   */
  export type PelunasanPiutangDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PelunasanPiutangs to delete
     */
    where?: PelunasanPiutangWhereInput
  }

  /**
   * PelunasanPiutang without action
   */
  export type PelunasanPiutangDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PelunasanPiutang
     */
    select?: PelunasanPiutangSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PelunasanPiutangInclude<ExtArgs> | null
  }


  /**
   * Model BastDocument
   */

  export type AggregateBastDocument = {
    _count: BastDocumentCountAggregateOutputType | null
    _avg: BastDocumentAvgAggregateOutputType | null
    _sum: BastDocumentSumAggregateOutputType | null
    _min: BastDocumentMinAggregateOutputType | null
    _max: BastDocumentMaxAggregateOutputType | null
  }

  export type BastDocumentAvgAggregateOutputType = {
    volumeLiters: number | null
  }

  export type BastDocumentSumAggregateOutputType = {
    volumeLiters: number | null
  }

  export type BastDocumentMinAggregateOutputType = {
    id: string | null
    nomorBast: string | null
    tanggal: Date | null
    sumber: string | null
    volumeLiters: number | null
    jenisPermintaan: string | null
    instansiPenerima: string | null
    pengirimNama: string | null
    pengirimRole: string | null
    penerimaNama: string | null
    penerimaRole: string | null
    status: string | null
    catatan: string | null
    confirmedAt: Date | null
    productionId: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BastDocumentMaxAggregateOutputType = {
    id: string | null
    nomorBast: string | null
    tanggal: Date | null
    sumber: string | null
    volumeLiters: number | null
    jenisPermintaan: string | null
    instansiPenerima: string | null
    pengirimNama: string | null
    pengirimRole: string | null
    penerimaNama: string | null
    penerimaRole: string | null
    status: string | null
    catatan: string | null
    confirmedAt: Date | null
    productionId: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BastDocumentCountAggregateOutputType = {
    id: number
    nomorBast: number
    tanggal: number
    sumber: number
    volumeLiters: number
    jenisPermintaan: number
    instansiPenerima: number
    pengirimNama: number
    pengirimRole: number
    penerimaNama: number
    penerimaRole: number
    status: number
    catatan: number
    confirmedAt: number
    productionId: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BastDocumentAvgAggregateInputType = {
    volumeLiters?: true
  }

  export type BastDocumentSumAggregateInputType = {
    volumeLiters?: true
  }

  export type BastDocumentMinAggregateInputType = {
    id?: true
    nomorBast?: true
    tanggal?: true
    sumber?: true
    volumeLiters?: true
    jenisPermintaan?: true
    instansiPenerima?: true
    pengirimNama?: true
    pengirimRole?: true
    penerimaNama?: true
    penerimaRole?: true
    status?: true
    catatan?: true
    confirmedAt?: true
    productionId?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BastDocumentMaxAggregateInputType = {
    id?: true
    nomorBast?: true
    tanggal?: true
    sumber?: true
    volumeLiters?: true
    jenisPermintaan?: true
    instansiPenerima?: true
    pengirimNama?: true
    pengirimRole?: true
    penerimaNama?: true
    penerimaRole?: true
    status?: true
    catatan?: true
    confirmedAt?: true
    productionId?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BastDocumentCountAggregateInputType = {
    id?: true
    nomorBast?: true
    tanggal?: true
    sumber?: true
    volumeLiters?: true
    jenisPermintaan?: true
    instansiPenerima?: true
    pengirimNama?: true
    pengirimRole?: true
    penerimaNama?: true
    penerimaRole?: true
    status?: true
    catatan?: true
    confirmedAt?: true
    productionId?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BastDocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BastDocument to aggregate.
     */
    where?: BastDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BastDocuments to fetch.
     */
    orderBy?: BastDocumentOrderByWithRelationInput | BastDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BastDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BastDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BastDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BastDocuments
    **/
    _count?: true | BastDocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BastDocumentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BastDocumentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BastDocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BastDocumentMaxAggregateInputType
  }

  export type GetBastDocumentAggregateType<T extends BastDocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateBastDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBastDocument[P]>
      : GetScalarType<T[P], AggregateBastDocument[P]>
  }




  export type BastDocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BastDocumentWhereInput
    orderBy?: BastDocumentOrderByWithAggregationInput | BastDocumentOrderByWithAggregationInput[]
    by: BastDocumentScalarFieldEnum[] | BastDocumentScalarFieldEnum
    having?: BastDocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BastDocumentCountAggregateInputType | true
    _avg?: BastDocumentAvgAggregateInputType
    _sum?: BastDocumentSumAggregateInputType
    _min?: BastDocumentMinAggregateInputType
    _max?: BastDocumentMaxAggregateInputType
  }

  export type BastDocumentGroupByOutputType = {
    id: string
    nomorBast: string
    tanggal: Date
    sumber: string
    volumeLiters: number
    jenisPermintaan: string
    instansiPenerima: string | null
    pengirimNama: string
    pengirimRole: string
    penerimaNama: string | null
    penerimaRole: string | null
    status: string
    catatan: string | null
    confirmedAt: Date | null
    productionId: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: BastDocumentCountAggregateOutputType | null
    _avg: BastDocumentAvgAggregateOutputType | null
    _sum: BastDocumentSumAggregateOutputType | null
    _min: BastDocumentMinAggregateOutputType | null
    _max: BastDocumentMaxAggregateOutputType | null
  }

  type GetBastDocumentGroupByPayload<T extends BastDocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BastDocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BastDocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BastDocumentGroupByOutputType[P]>
            : GetScalarType<T[P], BastDocumentGroupByOutputType[P]>
        }
      >
    >


  export type BastDocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nomorBast?: boolean
    tanggal?: boolean
    sumber?: boolean
    volumeLiters?: boolean
    jenisPermintaan?: boolean
    instansiPenerima?: boolean
    pengirimNama?: boolean
    pengirimRole?: boolean
    penerimaNama?: boolean
    penerimaRole?: boolean
    status?: boolean
    catatan?: boolean
    confirmedAt?: boolean
    productionId?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean | BastDocument$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["bastDocument"]>


  export type BastDocumentSelectScalar = {
    id?: boolean
    nomorBast?: boolean
    tanggal?: boolean
    sumber?: boolean
    volumeLiters?: boolean
    jenisPermintaan?: boolean
    instansiPenerima?: boolean
    pengirimNama?: boolean
    pengirimRole?: boolean
    penerimaNama?: boolean
    penerimaRole?: boolean
    status?: boolean
    catatan?: boolean
    confirmedAt?: boolean
    productionId?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BastDocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | BastDocument$createdByArgs<ExtArgs>
  }

  export type $BastDocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BastDocument"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nomorBast: string
      tanggal: Date
      sumber: string
      volumeLiters: number
      jenisPermintaan: string
      instansiPenerima: string | null
      pengirimNama: string
      pengirimRole: string
      penerimaNama: string | null
      penerimaRole: string | null
      status: string
      catatan: string | null
      confirmedAt: Date | null
      productionId: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bastDocument"]>
    composites: {}
  }

  type BastDocumentGetPayload<S extends boolean | null | undefined | BastDocumentDefaultArgs> = $Result.GetResult<Prisma.$BastDocumentPayload, S>

  type BastDocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BastDocumentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BastDocumentCountAggregateInputType | true
    }

  export interface BastDocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BastDocument'], meta: { name: 'BastDocument' } }
    /**
     * Find zero or one BastDocument that matches the filter.
     * @param {BastDocumentFindUniqueArgs} args - Arguments to find a BastDocument
     * @example
     * // Get one BastDocument
     * const bastDocument = await prisma.bastDocument.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BastDocumentFindUniqueArgs>(args: SelectSubset<T, BastDocumentFindUniqueArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BastDocument that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BastDocumentFindUniqueOrThrowArgs} args - Arguments to find a BastDocument
     * @example
     * // Get one BastDocument
     * const bastDocument = await prisma.bastDocument.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BastDocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, BastDocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BastDocument that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentFindFirstArgs} args - Arguments to find a BastDocument
     * @example
     * // Get one BastDocument
     * const bastDocument = await prisma.bastDocument.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BastDocumentFindFirstArgs>(args?: SelectSubset<T, BastDocumentFindFirstArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BastDocument that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentFindFirstOrThrowArgs} args - Arguments to find a BastDocument
     * @example
     * // Get one BastDocument
     * const bastDocument = await prisma.bastDocument.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BastDocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, BastDocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BastDocuments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BastDocuments
     * const bastDocuments = await prisma.bastDocument.findMany()
     * 
     * // Get first 10 BastDocuments
     * const bastDocuments = await prisma.bastDocument.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bastDocumentWithIdOnly = await prisma.bastDocument.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BastDocumentFindManyArgs>(args?: SelectSubset<T, BastDocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BastDocument.
     * @param {BastDocumentCreateArgs} args - Arguments to create a BastDocument.
     * @example
     * // Create one BastDocument
     * const BastDocument = await prisma.bastDocument.create({
     *   data: {
     *     // ... data to create a BastDocument
     *   }
     * })
     * 
     */
    create<T extends BastDocumentCreateArgs>(args: SelectSubset<T, BastDocumentCreateArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BastDocuments.
     * @param {BastDocumentCreateManyArgs} args - Arguments to create many BastDocuments.
     * @example
     * // Create many BastDocuments
     * const bastDocument = await prisma.bastDocument.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BastDocumentCreateManyArgs>(args?: SelectSubset<T, BastDocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a BastDocument.
     * @param {BastDocumentDeleteArgs} args - Arguments to delete one BastDocument.
     * @example
     * // Delete one BastDocument
     * const BastDocument = await prisma.bastDocument.delete({
     *   where: {
     *     // ... filter to delete one BastDocument
     *   }
     * })
     * 
     */
    delete<T extends BastDocumentDeleteArgs>(args: SelectSubset<T, BastDocumentDeleteArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BastDocument.
     * @param {BastDocumentUpdateArgs} args - Arguments to update one BastDocument.
     * @example
     * // Update one BastDocument
     * const bastDocument = await prisma.bastDocument.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BastDocumentUpdateArgs>(args: SelectSubset<T, BastDocumentUpdateArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BastDocuments.
     * @param {BastDocumentDeleteManyArgs} args - Arguments to filter BastDocuments to delete.
     * @example
     * // Delete a few BastDocuments
     * const { count } = await prisma.bastDocument.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BastDocumentDeleteManyArgs>(args?: SelectSubset<T, BastDocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BastDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BastDocuments
     * const bastDocument = await prisma.bastDocument.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BastDocumentUpdateManyArgs>(args: SelectSubset<T, BastDocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BastDocument.
     * @param {BastDocumentUpsertArgs} args - Arguments to update or create a BastDocument.
     * @example
     * // Update or create a BastDocument
     * const bastDocument = await prisma.bastDocument.upsert({
     *   create: {
     *     // ... data to create a BastDocument
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BastDocument we want to update
     *   }
     * })
     */
    upsert<T extends BastDocumentUpsertArgs>(args: SelectSubset<T, BastDocumentUpsertArgs<ExtArgs>>): Prisma__BastDocumentClient<$Result.GetResult<Prisma.$BastDocumentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BastDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentCountArgs} args - Arguments to filter BastDocuments to count.
     * @example
     * // Count the number of BastDocuments
     * const count = await prisma.bastDocument.count({
     *   where: {
     *     // ... the filter for the BastDocuments we want to count
     *   }
     * })
    **/
    count<T extends BastDocumentCountArgs>(
      args?: Subset<T, BastDocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BastDocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BastDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BastDocumentAggregateArgs>(args: Subset<T, BastDocumentAggregateArgs>): Prisma.PrismaPromise<GetBastDocumentAggregateType<T>>

    /**
     * Group by BastDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BastDocumentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BastDocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BastDocumentGroupByArgs['orderBy'] }
        : { orderBy?: BastDocumentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BastDocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBastDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BastDocument model
   */
  readonly fields: BastDocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BastDocument.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BastDocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends BastDocument$createdByArgs<ExtArgs> = {}>(args?: Subset<T, BastDocument$createdByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BastDocument model
   */ 
  interface BastDocumentFieldRefs {
    readonly id: FieldRef<"BastDocument", 'String'>
    readonly nomorBast: FieldRef<"BastDocument", 'String'>
    readonly tanggal: FieldRef<"BastDocument", 'DateTime'>
    readonly sumber: FieldRef<"BastDocument", 'String'>
    readonly volumeLiters: FieldRef<"BastDocument", 'Float'>
    readonly jenisPermintaan: FieldRef<"BastDocument", 'String'>
    readonly instansiPenerima: FieldRef<"BastDocument", 'String'>
    readonly pengirimNama: FieldRef<"BastDocument", 'String'>
    readonly pengirimRole: FieldRef<"BastDocument", 'String'>
    readonly penerimaNama: FieldRef<"BastDocument", 'String'>
    readonly penerimaRole: FieldRef<"BastDocument", 'String'>
    readonly status: FieldRef<"BastDocument", 'String'>
    readonly catatan: FieldRef<"BastDocument", 'String'>
    readonly confirmedAt: FieldRef<"BastDocument", 'DateTime'>
    readonly productionId: FieldRef<"BastDocument", 'String'>
    readonly createdById: FieldRef<"BastDocument", 'String'>
    readonly createdAt: FieldRef<"BastDocument", 'DateTime'>
    readonly updatedAt: FieldRef<"BastDocument", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BastDocument findUnique
   */
  export type BastDocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter, which BastDocument to fetch.
     */
    where: BastDocumentWhereUniqueInput
  }

  /**
   * BastDocument findUniqueOrThrow
   */
  export type BastDocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter, which BastDocument to fetch.
     */
    where: BastDocumentWhereUniqueInput
  }

  /**
   * BastDocument findFirst
   */
  export type BastDocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter, which BastDocument to fetch.
     */
    where?: BastDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BastDocuments to fetch.
     */
    orderBy?: BastDocumentOrderByWithRelationInput | BastDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BastDocuments.
     */
    cursor?: BastDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BastDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BastDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BastDocuments.
     */
    distinct?: BastDocumentScalarFieldEnum | BastDocumentScalarFieldEnum[]
  }

  /**
   * BastDocument findFirstOrThrow
   */
  export type BastDocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter, which BastDocument to fetch.
     */
    where?: BastDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BastDocuments to fetch.
     */
    orderBy?: BastDocumentOrderByWithRelationInput | BastDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BastDocuments.
     */
    cursor?: BastDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BastDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BastDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BastDocuments.
     */
    distinct?: BastDocumentScalarFieldEnum | BastDocumentScalarFieldEnum[]
  }

  /**
   * BastDocument findMany
   */
  export type BastDocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter, which BastDocuments to fetch.
     */
    where?: BastDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BastDocuments to fetch.
     */
    orderBy?: BastDocumentOrderByWithRelationInput | BastDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BastDocuments.
     */
    cursor?: BastDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BastDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BastDocuments.
     */
    skip?: number
    distinct?: BastDocumentScalarFieldEnum | BastDocumentScalarFieldEnum[]
  }

  /**
   * BastDocument create
   */
  export type BastDocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a BastDocument.
     */
    data: XOR<BastDocumentCreateInput, BastDocumentUncheckedCreateInput>
  }

  /**
   * BastDocument createMany
   */
  export type BastDocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BastDocuments.
     */
    data: BastDocumentCreateManyInput | BastDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BastDocument update
   */
  export type BastDocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a BastDocument.
     */
    data: XOR<BastDocumentUpdateInput, BastDocumentUncheckedUpdateInput>
    /**
     * Choose, which BastDocument to update.
     */
    where: BastDocumentWhereUniqueInput
  }

  /**
   * BastDocument updateMany
   */
  export type BastDocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BastDocuments.
     */
    data: XOR<BastDocumentUpdateManyMutationInput, BastDocumentUncheckedUpdateManyInput>
    /**
     * Filter which BastDocuments to update
     */
    where?: BastDocumentWhereInput
  }

  /**
   * BastDocument upsert
   */
  export type BastDocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the BastDocument to update in case it exists.
     */
    where: BastDocumentWhereUniqueInput
    /**
     * In case the BastDocument found by the `where` argument doesn't exist, create a new BastDocument with this data.
     */
    create: XOR<BastDocumentCreateInput, BastDocumentUncheckedCreateInput>
    /**
     * In case the BastDocument was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BastDocumentUpdateInput, BastDocumentUncheckedUpdateInput>
  }

  /**
   * BastDocument delete
   */
  export type BastDocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
    /**
     * Filter which BastDocument to delete.
     */
    where: BastDocumentWhereUniqueInput
  }

  /**
   * BastDocument deleteMany
   */
  export type BastDocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BastDocuments to delete
     */
    where?: BastDocumentWhereInput
  }

  /**
   * BastDocument.createdBy
   */
  export type BastDocument$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * BastDocument without action
   */
  export type BastDocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BastDocument
     */
    select?: BastDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BastDocumentInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: string | null
    targetRole: string | null
    targetUserId: string | null
    senderId: string | null
    senderName: string | null
    senderRole: string | null
    link: string | null
    isRead: boolean | null
    readAt: Date | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: string | null
    targetRole: string | null
    targetUserId: string | null
    senderId: string | null
    senderName: string | null
    senderRole: string | null
    link: string | null
    isRead: boolean | null
    readAt: Date | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    title: number
    message: number
    type: number
    targetRole: number
    targetUserId: number
    senderId: number
    senderName: number
    senderRole: number
    link: number
    isRead: number
    readAt: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    targetRole?: true
    targetUserId?: true
    senderId?: true
    senderName?: true
    senderRole?: true
    link?: true
    isRead?: true
    readAt?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    targetRole?: true
    targetUserId?: true
    senderId?: true
    senderName?: true
    senderRole?: true
    link?: true
    isRead?: true
    readAt?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    targetRole?: true
    targetUserId?: true
    senderId?: true
    senderName?: true
    senderRole?: true
    link?: true
    isRead?: true
    readAt?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    title: string
    message: string
    type: string
    targetRole: string | null
    targetUserId: string | null
    senderId: string | null
    senderName: string | null
    senderRole: string | null
    link: string | null
    isRead: boolean
    readAt: Date | null
    metadata: string | null
    createdAt: Date
    updatedAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    targetRole?: boolean
    targetUserId?: boolean
    senderId?: boolean
    senderName?: boolean
    senderRole?: boolean
    link?: boolean
    isRead?: boolean
    readAt?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["notification"]>


  export type NotificationSelectScalar = {
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    targetRole?: boolean
    targetUserId?: boolean
    senderId?: boolean
    senderName?: boolean
    senderRole?: boolean
    link?: boolean
    isRead?: boolean
    readAt?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      message: string
      type: string
      targetRole: string | null
      targetUserId: string | null
      senderId: string | null
      senderName: string | null
      senderRole: string | null
      link: string | null
      isRead: boolean
      readAt: Date | null
      metadata: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */ 
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'String'>
    readonly targetRole: FieldRef<"Notification", 'String'>
    readonly targetUserId: FieldRef<"Notification", 'String'>
    readonly senderId: FieldRef<"Notification", 'String'>
    readonly senderName: FieldRef<"Notification", 'String'>
    readonly senderRole: FieldRef<"Notification", 'String'>
    readonly link: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly readAt: FieldRef<"Notification", 'DateTime'>
    readonly metadata: FieldRef<"Notification", 'String'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly updatedAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AdminScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password: 'password',
    role: 'role',
    record_flag: 'record_flag'
  };

  export type AdminScalarFieldEnum = (typeof AdminScalarFieldEnum)[keyof typeof AdminScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SystemLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    userEmail: 'userEmail',
    action: 'action',
    level: 'level',
    details: 'details',
    createdAt: 'createdAt'
  };

  export type SystemLogScalarFieldEnum = (typeof SystemLogScalarFieldEnum)[keyof typeof SystemLogScalarFieldEnum]


  export const MilkCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    productType: 'productType',
    animalType: 'animalType',
    defaultPackaging: 'defaultPackaging',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MilkCategoryScalarFieldEnum = (typeof MilkCategoryScalarFieldEnum)[keyof typeof MilkCategoryScalarFieldEnum]


  export const MilkProductionScalarFieldEnum: {
    id: 'id',
    date: 'date',
    tanggal: 'tanggal',
    categoryId: 'categoryId',
    productType: 'productType',
    animalType: 'animalType',
    packagingType: 'packagingType',
    grossVolumeLiters: 'grossVolumeLiters',
    produksi: 'produksi',
    pedetVolumeLiters: 'pedetVolumeLiters',
    setorPedet: 'setorPedet',
    afkirVolumeLiters: 'afkirVolumeLiters',
    rusakAfkir: 'rusakAfkir',
    usageType: 'usageType',
    usageVolumeLiters: 'usageVolumeLiters',
    rawVolumeLiters: 'rawVolumeLiters',
    kirimKePI: 'kirimKePI',
    processedLiters: 'processedLiters',
    packagedQty: 'packagedQty',
    status: 'status',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MilkProductionScalarFieldEnum = (typeof MilkProductionScalarFieldEnum)[keyof typeof MilkProductionScalarFieldEnum]


  export const PackagedProductScalarFieldEnum: {
    id: 'id',
    tanggal: 'tanggal',
    jenisProduk: 'jenisProduk',
    kemasan: 'kemasan',
    jumlah: 'jumlah',
    status: 'status',
    receivedAt: 'receivedAt',
    receivedByName: 'receivedByName',
    condition: 'condition',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PackagedProductScalarFieldEnum = (typeof PackagedProductScalarFieldEnum)[keyof typeof PackagedProductScalarFieldEnum]


  export const MilkPackagingScalarFieldEnum: {
    id: 'id',
    date: 'date',
    productCategory: 'productCategory',
    productSubtype: 'productSubtype',
    origin: 'origin',
    variant: 'variant',
    animalType: 'animalType',
    categoryId: 'categoryId',
    processedAmount: 'processedAmount',
    processedUnit: 'processedUnit',
    processedLiters: 'processedLiters',
    packagingDetails: 'packagingDetails',
    packagingType: 'packagingType',
    packageSize: 'packageSize',
    botolQty: 'botolQty',
    cupQty: 'cupQty',
    plastikBantalQty: 'plastikBantalQty',
    totalPackagedQty: 'totalPackagedQty',
    status: 'status',
    sentAt: 'sentAt',
    sentById: 'sentById',
    sentByName: 'sentByName',
    receivedAt: 'receivedAt',
    receivedById: 'receivedById',
    receivedByName: 'receivedByName',
    quantitySent: 'quantitySent',
    quantityReceived: 'quantityReceived',
    condition: 'condition',
    receptionNotes: 'receptionNotes',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MilkPackagingScalarFieldEnum = (typeof MilkPackagingScalarFieldEnum)[keyof typeof MilkPackagingScalarFieldEnum]


  export const MilkOutflowScalarFieldEnum: {
    id: 'id',
    date: 'date',
    categoryId: 'categoryId',
    productType: 'productType',
    animalType: 'animalType',
    packagingType: 'packagingType',
    quantity: 'quantity',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MilkOutflowScalarFieldEnum = (typeof MilkOutflowScalarFieldEnum)[keyof typeof MilkOutflowScalarFieldEnum]


  export const MilkSaleScalarFieldEnum: {
    id: 'id',
    transactionId: 'transactionId',
    date: 'date',
    tanggal: 'tanggal',
    sumber: 'sumber',
    produkRefId: 'produkRefId',
    jumlah: 'jumlah',
    pembeli: 'pembeli',
    hargaJual: 'hargaJual',
    kategoriBayar: 'kategoriBayar',
    catatan: 'catatan',
    productCategory: 'productCategory',
    productSubtype: 'productSubtype',
    variant: 'variant',
    packagingType: 'packagingType',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    totalPrice: 'totalPrice',
    status: 'status',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MilkSaleScalarFieldEnum = (typeof MilkSaleScalarFieldEnum)[keyof typeof MilkSaleScalarFieldEnum]


  export const PiutangScalarFieldEnum: {
    id: 'id',
    milkSaleId: 'milkSaleId',
    jumlahAwal: 'jumlahAwal',
    sisaPiutang: 'sisaPiutang',
    lunas: 'lunas',
    createdAt: 'createdAt'
  };

  export type PiutangScalarFieldEnum = (typeof PiutangScalarFieldEnum)[keyof typeof PiutangScalarFieldEnum]


  export const PelunasanPiutangScalarFieldEnum: {
    id: 'id',
    piutangId: 'piutangId',
    jumlah: 'jumlah',
    tanggal: 'tanggal',
    catatan: 'catatan'
  };

  export type PelunasanPiutangScalarFieldEnum = (typeof PelunasanPiutangScalarFieldEnum)[keyof typeof PelunasanPiutangScalarFieldEnum]


  export const BastDocumentScalarFieldEnum: {
    id: 'id',
    nomorBast: 'nomorBast',
    tanggal: 'tanggal',
    sumber: 'sumber',
    volumeLiters: 'volumeLiters',
    jenisPermintaan: 'jenisPermintaan',
    instansiPenerima: 'instansiPenerima',
    pengirimNama: 'pengirimNama',
    pengirimRole: 'pengirimRole',
    penerimaNama: 'penerimaNama',
    penerimaRole: 'penerimaRole',
    status: 'status',
    catatan: 'catatan',
    confirmedAt: 'confirmedAt',
    productionId: 'productionId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BastDocumentScalarFieldEnum = (typeof BastDocumentScalarFieldEnum)[keyof typeof BastDocumentScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    title: 'title',
    message: 'message',
    type: 'type',
    targetRole: 'targetRole',
    targetUserId: 'targetUserId',
    senderId: 'senderId',
    senderName: 'senderName',
    senderRole: 'senderRole',
    link: 'link',
    isRead: 'isRead',
    readAt: 'readAt',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type AdminWhereInput = {
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    id?: IntFilter<"Admin"> | number
    username?: StringNullableFilter<"Admin"> | string | null
    password?: StringNullableFilter<"Admin"> | string | null
    role?: StringNullableFilter<"Admin"> | string | null
    record_flag?: StringNullableFilter<"Admin"> | string | null
  }

  export type AdminOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    record_flag?: SortOrderInput | SortOrder
  }

  export type AdminWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    password?: StringNullableFilter<"Admin"> | string | null
    role?: StringNullableFilter<"Admin"> | string | null
    record_flag?: StringNullableFilter<"Admin"> | string | null
  }, "id" | "username">

  export type AdminOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    record_flag?: SortOrderInput | SortOrder
    _count?: AdminCountOrderByAggregateInput
    _avg?: AdminAvgOrderByAggregateInput
    _max?: AdminMaxOrderByAggregateInput
    _min?: AdminMinOrderByAggregateInput
    _sum?: AdminSumOrderByAggregateInput
  }

  export type AdminScalarWhereWithAggregatesInput = {
    AND?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    OR?: AdminScalarWhereWithAggregatesInput[]
    NOT?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Admin"> | number
    username?: StringNullableWithAggregatesFilter<"Admin"> | string | null
    password?: StringNullableWithAggregatesFilter<"Admin"> | string | null
    role?: StringNullableWithAggregatesFilter<"Admin"> | string | null
    record_flag?: StringNullableWithAggregatesFilter<"Admin"> | string | null
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    logs?: SystemLogListRelationFilter
    productions?: MilkProductionListRelationFilter
    packagings?: MilkPackagingListRelationFilter
    outflows?: MilkOutflowListRelationFilter
    sales?: MilkSaleListRelationFilter
    bastDocuments?: BastDocumentListRelationFilter
    packagedProducts?: PackagedProductListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    logs?: SystemLogOrderByRelationAggregateInput
    productions?: MilkProductionOrderByRelationAggregateInput
    packagings?: MilkPackagingOrderByRelationAggregateInput
    outflows?: MilkOutflowOrderByRelationAggregateInput
    sales?: MilkSaleOrderByRelationAggregateInput
    bastDocuments?: BastDocumentOrderByRelationAggregateInput
    packagedProducts?: PackagedProductOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    logs?: SystemLogListRelationFilter
    productions?: MilkProductionListRelationFilter
    packagings?: MilkPackagingListRelationFilter
    outflows?: MilkOutflowListRelationFilter
    sales?: MilkSaleListRelationFilter
    bastDocuments?: BastDocumentListRelationFilter
    packagedProducts?: PackagedProductListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type SystemLogWhereInput = {
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    id?: StringFilter<"SystemLog"> | string
    userId?: StringNullableFilter<"SystemLog"> | string | null
    userEmail?: StringFilter<"SystemLog"> | string
    action?: StringFilter<"SystemLog"> | string
    level?: StringFilter<"SystemLog"> | string
    details?: StringNullableFilter<"SystemLog"> | string | null
    createdAt?: DateTimeFilter<"SystemLog"> | Date | string
    user?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type SystemLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrder
    action?: SortOrder
    level?: SortOrder
    details?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SystemLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    userId?: StringNullableFilter<"SystemLog"> | string | null
    userEmail?: StringFilter<"SystemLog"> | string
    action?: StringFilter<"SystemLog"> | string
    level?: StringFilter<"SystemLog"> | string
    details?: StringNullableFilter<"SystemLog"> | string | null
    createdAt?: DateTimeFilter<"SystemLog"> | Date | string
    user?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type SystemLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrder
    action?: SortOrder
    level?: SortOrder
    details?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SystemLogCountOrderByAggregateInput
    _max?: SystemLogMaxOrderByAggregateInput
    _min?: SystemLogMinOrderByAggregateInput
  }

  export type SystemLogScalarWhereWithAggregatesInput = {
    AND?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    OR?: SystemLogScalarWhereWithAggregatesInput[]
    NOT?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemLog"> | string
    userId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    userEmail?: StringWithAggregatesFilter<"SystemLog"> | string
    action?: StringWithAggregatesFilter<"SystemLog"> | string
    level?: StringWithAggregatesFilter<"SystemLog"> | string
    details?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SystemLog"> | Date | string
  }

  export type MilkCategoryWhereInput = {
    AND?: MilkCategoryWhereInput | MilkCategoryWhereInput[]
    OR?: MilkCategoryWhereInput[]
    NOT?: MilkCategoryWhereInput | MilkCategoryWhereInput[]
    id?: StringFilter<"MilkCategory"> | string
    name?: StringFilter<"MilkCategory"> | string
    code?: StringFilter<"MilkCategory"> | string
    productType?: StringFilter<"MilkCategory"> | string
    animalType?: StringFilter<"MilkCategory"> | string
    defaultPackaging?: StringFilter<"MilkCategory"> | string
    description?: StringNullableFilter<"MilkCategory"> | string | null
    createdAt?: DateTimeFilter<"MilkCategory"> | Date | string
    updatedAt?: DateTimeFilter<"MilkCategory"> | Date | string
    productions?: MilkProductionListRelationFilter
    packagings?: MilkPackagingListRelationFilter
    outflows?: MilkOutflowListRelationFilter
  }

  export type MilkCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    defaultPackaging?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    productions?: MilkProductionOrderByRelationAggregateInput
    packagings?: MilkPackagingOrderByRelationAggregateInput
    outflows?: MilkOutflowOrderByRelationAggregateInput
  }

  export type MilkCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    code?: string
    AND?: MilkCategoryWhereInput | MilkCategoryWhereInput[]
    OR?: MilkCategoryWhereInput[]
    NOT?: MilkCategoryWhereInput | MilkCategoryWhereInput[]
    productType?: StringFilter<"MilkCategory"> | string
    animalType?: StringFilter<"MilkCategory"> | string
    defaultPackaging?: StringFilter<"MilkCategory"> | string
    description?: StringNullableFilter<"MilkCategory"> | string | null
    createdAt?: DateTimeFilter<"MilkCategory"> | Date | string
    updatedAt?: DateTimeFilter<"MilkCategory"> | Date | string
    productions?: MilkProductionListRelationFilter
    packagings?: MilkPackagingListRelationFilter
    outflows?: MilkOutflowListRelationFilter
  }, "id" | "name" | "code">

  export type MilkCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    defaultPackaging?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MilkCategoryCountOrderByAggregateInput
    _max?: MilkCategoryMaxOrderByAggregateInput
    _min?: MilkCategoryMinOrderByAggregateInput
  }

  export type MilkCategoryScalarWhereWithAggregatesInput = {
    AND?: MilkCategoryScalarWhereWithAggregatesInput | MilkCategoryScalarWhereWithAggregatesInput[]
    OR?: MilkCategoryScalarWhereWithAggregatesInput[]
    NOT?: MilkCategoryScalarWhereWithAggregatesInput | MilkCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MilkCategory"> | string
    name?: StringWithAggregatesFilter<"MilkCategory"> | string
    code?: StringWithAggregatesFilter<"MilkCategory"> | string
    productType?: StringWithAggregatesFilter<"MilkCategory"> | string
    animalType?: StringWithAggregatesFilter<"MilkCategory"> | string
    defaultPackaging?: StringWithAggregatesFilter<"MilkCategory"> | string
    description?: StringNullableWithAggregatesFilter<"MilkCategory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MilkCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MilkCategory"> | Date | string
  }

  export type MilkProductionWhereInput = {
    AND?: MilkProductionWhereInput | MilkProductionWhereInput[]
    OR?: MilkProductionWhereInput[]
    NOT?: MilkProductionWhereInput | MilkProductionWhereInput[]
    id?: StringFilter<"MilkProduction"> | string
    date?: DateTimeFilter<"MilkProduction"> | Date | string
    tanggal?: DateTimeFilter<"MilkProduction"> | Date | string
    categoryId?: StringNullableFilter<"MilkProduction"> | string | null
    productType?: StringFilter<"MilkProduction"> | string
    animalType?: StringFilter<"MilkProduction"> | string
    packagingType?: StringFilter<"MilkProduction"> | string
    grossVolumeLiters?: FloatFilter<"MilkProduction"> | number
    produksi?: FloatFilter<"MilkProduction"> | number
    pedetVolumeLiters?: FloatFilter<"MilkProduction"> | number
    setorPedet?: FloatFilter<"MilkProduction"> | number
    afkirVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rusakAfkir?: FloatFilter<"MilkProduction"> | number
    usageType?: StringNullableFilter<"MilkProduction"> | string | null
    usageVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rawVolumeLiters?: FloatFilter<"MilkProduction"> | number
    kirimKePI?: FloatFilter<"MilkProduction"> | number
    processedLiters?: FloatFilter<"MilkProduction"> | number
    packagedQty?: IntFilter<"MilkProduction"> | number
    status?: StringFilter<"MilkProduction"> | string
    notes?: StringNullableFilter<"MilkProduction"> | string | null
    createdById?: StringNullableFilter<"MilkProduction"> | string | null
    createdAt?: DateTimeFilter<"MilkProduction"> | Date | string
    updatedAt?: DateTimeFilter<"MilkProduction"> | Date | string
    category?: XOR<MilkCategoryNullableRelationFilter, MilkCategoryWhereInput> | null
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type MilkProductionOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageType?: SortOrderInput | SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: MilkCategoryOrderByWithRelationInput
    createdBy?: UserOrderByWithRelationInput
  }

  export type MilkProductionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MilkProductionWhereInput | MilkProductionWhereInput[]
    OR?: MilkProductionWhereInput[]
    NOT?: MilkProductionWhereInput | MilkProductionWhereInput[]
    date?: DateTimeFilter<"MilkProduction"> | Date | string
    tanggal?: DateTimeFilter<"MilkProduction"> | Date | string
    categoryId?: StringNullableFilter<"MilkProduction"> | string | null
    productType?: StringFilter<"MilkProduction"> | string
    animalType?: StringFilter<"MilkProduction"> | string
    packagingType?: StringFilter<"MilkProduction"> | string
    grossVolumeLiters?: FloatFilter<"MilkProduction"> | number
    produksi?: FloatFilter<"MilkProduction"> | number
    pedetVolumeLiters?: FloatFilter<"MilkProduction"> | number
    setorPedet?: FloatFilter<"MilkProduction"> | number
    afkirVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rusakAfkir?: FloatFilter<"MilkProduction"> | number
    usageType?: StringNullableFilter<"MilkProduction"> | string | null
    usageVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rawVolumeLiters?: FloatFilter<"MilkProduction"> | number
    kirimKePI?: FloatFilter<"MilkProduction"> | number
    processedLiters?: FloatFilter<"MilkProduction"> | number
    packagedQty?: IntFilter<"MilkProduction"> | number
    status?: StringFilter<"MilkProduction"> | string
    notes?: StringNullableFilter<"MilkProduction"> | string | null
    createdById?: StringNullableFilter<"MilkProduction"> | string | null
    createdAt?: DateTimeFilter<"MilkProduction"> | Date | string
    updatedAt?: DateTimeFilter<"MilkProduction"> | Date | string
    category?: XOR<MilkCategoryNullableRelationFilter, MilkCategoryWhereInput> | null
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type MilkProductionOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageType?: SortOrderInput | SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MilkProductionCountOrderByAggregateInput
    _avg?: MilkProductionAvgOrderByAggregateInput
    _max?: MilkProductionMaxOrderByAggregateInput
    _min?: MilkProductionMinOrderByAggregateInput
    _sum?: MilkProductionSumOrderByAggregateInput
  }

  export type MilkProductionScalarWhereWithAggregatesInput = {
    AND?: MilkProductionScalarWhereWithAggregatesInput | MilkProductionScalarWhereWithAggregatesInput[]
    OR?: MilkProductionScalarWhereWithAggregatesInput[]
    NOT?: MilkProductionScalarWhereWithAggregatesInput | MilkProductionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MilkProduction"> | string
    date?: DateTimeWithAggregatesFilter<"MilkProduction"> | Date | string
    tanggal?: DateTimeWithAggregatesFilter<"MilkProduction"> | Date | string
    categoryId?: StringNullableWithAggregatesFilter<"MilkProduction"> | string | null
    productType?: StringWithAggregatesFilter<"MilkProduction"> | string
    animalType?: StringWithAggregatesFilter<"MilkProduction"> | string
    packagingType?: StringWithAggregatesFilter<"MilkProduction"> | string
    grossVolumeLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    produksi?: FloatWithAggregatesFilter<"MilkProduction"> | number
    pedetVolumeLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    setorPedet?: FloatWithAggregatesFilter<"MilkProduction"> | number
    afkirVolumeLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    rusakAfkir?: FloatWithAggregatesFilter<"MilkProduction"> | number
    usageType?: StringNullableWithAggregatesFilter<"MilkProduction"> | string | null
    usageVolumeLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    rawVolumeLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    kirimKePI?: FloatWithAggregatesFilter<"MilkProduction"> | number
    processedLiters?: FloatWithAggregatesFilter<"MilkProduction"> | number
    packagedQty?: IntWithAggregatesFilter<"MilkProduction"> | number
    status?: StringWithAggregatesFilter<"MilkProduction"> | string
    notes?: StringNullableWithAggregatesFilter<"MilkProduction"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"MilkProduction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MilkProduction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MilkProduction"> | Date | string
  }

  export type PackagedProductWhereInput = {
    AND?: PackagedProductWhereInput | PackagedProductWhereInput[]
    OR?: PackagedProductWhereInput[]
    NOT?: PackagedProductWhereInput | PackagedProductWhereInput[]
    id?: StringFilter<"PackagedProduct"> | string
    tanggal?: DateTimeFilter<"PackagedProduct"> | Date | string
    jenisProduk?: StringFilter<"PackagedProduct"> | string
    kemasan?: StringFilter<"PackagedProduct"> | string
    jumlah?: FloatFilter<"PackagedProduct"> | number
    status?: StringFilter<"PackagedProduct"> | string
    receivedAt?: DateTimeNullableFilter<"PackagedProduct"> | Date | string | null
    receivedByName?: StringNullableFilter<"PackagedProduct"> | string | null
    condition?: StringNullableFilter<"PackagedProduct"> | string | null
    notes?: StringNullableFilter<"PackagedProduct"> | string | null
    createdById?: StringNullableFilter<"PackagedProduct"> | string | null
    createdAt?: DateTimeFilter<"PackagedProduct"> | Date | string
    updatedAt?: DateTimeFilter<"PackagedProduct"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type PackagedProductOrderByWithRelationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jenisProduk?: SortOrder
    kemasan?: SortOrder
    jumlah?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrderInput | SortOrder
    receivedByName?: SortOrderInput | SortOrder
    condition?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: UserOrderByWithRelationInput
  }

  export type PackagedProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PackagedProductWhereInput | PackagedProductWhereInput[]
    OR?: PackagedProductWhereInput[]
    NOT?: PackagedProductWhereInput | PackagedProductWhereInput[]
    tanggal?: DateTimeFilter<"PackagedProduct"> | Date | string
    jenisProduk?: StringFilter<"PackagedProduct"> | string
    kemasan?: StringFilter<"PackagedProduct"> | string
    jumlah?: FloatFilter<"PackagedProduct"> | number
    status?: StringFilter<"PackagedProduct"> | string
    receivedAt?: DateTimeNullableFilter<"PackagedProduct"> | Date | string | null
    receivedByName?: StringNullableFilter<"PackagedProduct"> | string | null
    condition?: StringNullableFilter<"PackagedProduct"> | string | null
    notes?: StringNullableFilter<"PackagedProduct"> | string | null
    createdById?: StringNullableFilter<"PackagedProduct"> | string | null
    createdAt?: DateTimeFilter<"PackagedProduct"> | Date | string
    updatedAt?: DateTimeFilter<"PackagedProduct"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type PackagedProductOrderByWithAggregationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jenisProduk?: SortOrder
    kemasan?: SortOrder
    jumlah?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrderInput | SortOrder
    receivedByName?: SortOrderInput | SortOrder
    condition?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PackagedProductCountOrderByAggregateInput
    _avg?: PackagedProductAvgOrderByAggregateInput
    _max?: PackagedProductMaxOrderByAggregateInput
    _min?: PackagedProductMinOrderByAggregateInput
    _sum?: PackagedProductSumOrderByAggregateInput
  }

  export type PackagedProductScalarWhereWithAggregatesInput = {
    AND?: PackagedProductScalarWhereWithAggregatesInput | PackagedProductScalarWhereWithAggregatesInput[]
    OR?: PackagedProductScalarWhereWithAggregatesInput[]
    NOT?: PackagedProductScalarWhereWithAggregatesInput | PackagedProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PackagedProduct"> | string
    tanggal?: DateTimeWithAggregatesFilter<"PackagedProduct"> | Date | string
    jenisProduk?: StringWithAggregatesFilter<"PackagedProduct"> | string
    kemasan?: StringWithAggregatesFilter<"PackagedProduct"> | string
    jumlah?: FloatWithAggregatesFilter<"PackagedProduct"> | number
    status?: StringWithAggregatesFilter<"PackagedProduct"> | string
    receivedAt?: DateTimeNullableWithAggregatesFilter<"PackagedProduct"> | Date | string | null
    receivedByName?: StringNullableWithAggregatesFilter<"PackagedProduct"> | string | null
    condition?: StringNullableWithAggregatesFilter<"PackagedProduct"> | string | null
    notes?: StringNullableWithAggregatesFilter<"PackagedProduct"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"PackagedProduct"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PackagedProduct"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PackagedProduct"> | Date | string
  }

  export type MilkPackagingWhereInput = {
    AND?: MilkPackagingWhereInput | MilkPackagingWhereInput[]
    OR?: MilkPackagingWhereInput[]
    NOT?: MilkPackagingWhereInput | MilkPackagingWhereInput[]
    id?: StringFilter<"MilkPackaging"> | string
    date?: DateTimeFilter<"MilkPackaging"> | Date | string
    productCategory?: StringFilter<"MilkPackaging"> | string
    productSubtype?: StringNullableFilter<"MilkPackaging"> | string | null
    origin?: StringFilter<"MilkPackaging"> | string
    variant?: StringNullableFilter<"MilkPackaging"> | string | null
    animalType?: StringFilter<"MilkPackaging"> | string
    categoryId?: StringNullableFilter<"MilkPackaging"> | string | null
    processedAmount?: FloatFilter<"MilkPackaging"> | number
    processedUnit?: StringFilter<"MilkPackaging"> | string
    processedLiters?: FloatFilter<"MilkPackaging"> | number
    packagingDetails?: StringNullableFilter<"MilkPackaging"> | string | null
    packagingType?: StringNullableFilter<"MilkPackaging"> | string | null
    packageSize?: StringNullableFilter<"MilkPackaging"> | string | null
    botolQty?: IntFilter<"MilkPackaging"> | number
    cupQty?: IntFilter<"MilkPackaging"> | number
    plastikBantalQty?: IntFilter<"MilkPackaging"> | number
    totalPackagedQty?: IntFilter<"MilkPackaging"> | number
    status?: StringFilter<"MilkPackaging"> | string
    sentAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    sentById?: StringNullableFilter<"MilkPackaging"> | string | null
    sentByName?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    receivedById?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedByName?: StringNullableFilter<"MilkPackaging"> | string | null
    quantitySent?: IntFilter<"MilkPackaging"> | number
    quantityReceived?: IntFilter<"MilkPackaging"> | number
    condition?: StringNullableFilter<"MilkPackaging"> | string | null
    receptionNotes?: StringNullableFilter<"MilkPackaging"> | string | null
    notes?: StringNullableFilter<"MilkPackaging"> | string | null
    createdById?: StringNullableFilter<"MilkPackaging"> | string | null
    createdAt?: DateTimeFilter<"MilkPackaging"> | Date | string
    updatedAt?: DateTimeFilter<"MilkPackaging"> | Date | string
    category?: XOR<MilkCategoryNullableRelationFilter, MilkCategoryWhereInput> | null
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type MilkPackagingOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrderInput | SortOrder
    origin?: SortOrder
    variant?: SortOrderInput | SortOrder
    animalType?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    processedAmount?: SortOrder
    processedUnit?: SortOrder
    processedLiters?: SortOrder
    packagingDetails?: SortOrderInput | SortOrder
    packagingType?: SortOrderInput | SortOrder
    packageSize?: SortOrderInput | SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    status?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    sentById?: SortOrderInput | SortOrder
    sentByName?: SortOrderInput | SortOrder
    receivedAt?: SortOrderInput | SortOrder
    receivedById?: SortOrderInput | SortOrder
    receivedByName?: SortOrderInput | SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
    condition?: SortOrderInput | SortOrder
    receptionNotes?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: MilkCategoryOrderByWithRelationInput
    createdBy?: UserOrderByWithRelationInput
  }

  export type MilkPackagingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MilkPackagingWhereInput | MilkPackagingWhereInput[]
    OR?: MilkPackagingWhereInput[]
    NOT?: MilkPackagingWhereInput | MilkPackagingWhereInput[]
    date?: DateTimeFilter<"MilkPackaging"> | Date | string
    productCategory?: StringFilter<"MilkPackaging"> | string
    productSubtype?: StringNullableFilter<"MilkPackaging"> | string | null
    origin?: StringFilter<"MilkPackaging"> | string
    variant?: StringNullableFilter<"MilkPackaging"> | string | null
    animalType?: StringFilter<"MilkPackaging"> | string
    categoryId?: StringNullableFilter<"MilkPackaging"> | string | null
    processedAmount?: FloatFilter<"MilkPackaging"> | number
    processedUnit?: StringFilter<"MilkPackaging"> | string
    processedLiters?: FloatFilter<"MilkPackaging"> | number
    packagingDetails?: StringNullableFilter<"MilkPackaging"> | string | null
    packagingType?: StringNullableFilter<"MilkPackaging"> | string | null
    packageSize?: StringNullableFilter<"MilkPackaging"> | string | null
    botolQty?: IntFilter<"MilkPackaging"> | number
    cupQty?: IntFilter<"MilkPackaging"> | number
    plastikBantalQty?: IntFilter<"MilkPackaging"> | number
    totalPackagedQty?: IntFilter<"MilkPackaging"> | number
    status?: StringFilter<"MilkPackaging"> | string
    sentAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    sentById?: StringNullableFilter<"MilkPackaging"> | string | null
    sentByName?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    receivedById?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedByName?: StringNullableFilter<"MilkPackaging"> | string | null
    quantitySent?: IntFilter<"MilkPackaging"> | number
    quantityReceived?: IntFilter<"MilkPackaging"> | number
    condition?: StringNullableFilter<"MilkPackaging"> | string | null
    receptionNotes?: StringNullableFilter<"MilkPackaging"> | string | null
    notes?: StringNullableFilter<"MilkPackaging"> | string | null
    createdById?: StringNullableFilter<"MilkPackaging"> | string | null
    createdAt?: DateTimeFilter<"MilkPackaging"> | Date | string
    updatedAt?: DateTimeFilter<"MilkPackaging"> | Date | string
    category?: XOR<MilkCategoryNullableRelationFilter, MilkCategoryWhereInput> | null
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type MilkPackagingOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrderInput | SortOrder
    origin?: SortOrder
    variant?: SortOrderInput | SortOrder
    animalType?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    processedAmount?: SortOrder
    processedUnit?: SortOrder
    processedLiters?: SortOrder
    packagingDetails?: SortOrderInput | SortOrder
    packagingType?: SortOrderInput | SortOrder
    packageSize?: SortOrderInput | SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    status?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    sentById?: SortOrderInput | SortOrder
    sentByName?: SortOrderInput | SortOrder
    receivedAt?: SortOrderInput | SortOrder
    receivedById?: SortOrderInput | SortOrder
    receivedByName?: SortOrderInput | SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
    condition?: SortOrderInput | SortOrder
    receptionNotes?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MilkPackagingCountOrderByAggregateInput
    _avg?: MilkPackagingAvgOrderByAggregateInput
    _max?: MilkPackagingMaxOrderByAggregateInput
    _min?: MilkPackagingMinOrderByAggregateInput
    _sum?: MilkPackagingSumOrderByAggregateInput
  }

  export type MilkPackagingScalarWhereWithAggregatesInput = {
    AND?: MilkPackagingScalarWhereWithAggregatesInput | MilkPackagingScalarWhereWithAggregatesInput[]
    OR?: MilkPackagingScalarWhereWithAggregatesInput[]
    NOT?: MilkPackagingScalarWhereWithAggregatesInput | MilkPackagingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MilkPackaging"> | string
    date?: DateTimeWithAggregatesFilter<"MilkPackaging"> | Date | string
    productCategory?: StringWithAggregatesFilter<"MilkPackaging"> | string
    productSubtype?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    origin?: StringWithAggregatesFilter<"MilkPackaging"> | string
    variant?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    animalType?: StringWithAggregatesFilter<"MilkPackaging"> | string
    categoryId?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    processedAmount?: FloatWithAggregatesFilter<"MilkPackaging"> | number
    processedUnit?: StringWithAggregatesFilter<"MilkPackaging"> | string
    processedLiters?: FloatWithAggregatesFilter<"MilkPackaging"> | number
    packagingDetails?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    packagingType?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    packageSize?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    botolQty?: IntWithAggregatesFilter<"MilkPackaging"> | number
    cupQty?: IntWithAggregatesFilter<"MilkPackaging"> | number
    plastikBantalQty?: IntWithAggregatesFilter<"MilkPackaging"> | number
    totalPackagedQty?: IntWithAggregatesFilter<"MilkPackaging"> | number
    status?: StringWithAggregatesFilter<"MilkPackaging"> | string
    sentAt?: DateTimeNullableWithAggregatesFilter<"MilkPackaging"> | Date | string | null
    sentById?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    sentByName?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    receivedAt?: DateTimeNullableWithAggregatesFilter<"MilkPackaging"> | Date | string | null
    receivedById?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    receivedByName?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    quantitySent?: IntWithAggregatesFilter<"MilkPackaging"> | number
    quantityReceived?: IntWithAggregatesFilter<"MilkPackaging"> | number
    condition?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    receptionNotes?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    notes?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"MilkPackaging"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MilkPackaging"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MilkPackaging"> | Date | string
  }

  export type MilkOutflowWhereInput = {
    AND?: MilkOutflowWhereInput | MilkOutflowWhereInput[]
    OR?: MilkOutflowWhereInput[]
    NOT?: MilkOutflowWhereInput | MilkOutflowWhereInput[]
    id?: StringFilter<"MilkOutflow"> | string
    date?: DateTimeFilter<"MilkOutflow"> | Date | string
    categoryId?: StringFilter<"MilkOutflow"> | string
    productType?: StringFilter<"MilkOutflow"> | string
    animalType?: StringFilter<"MilkOutflow"> | string
    packagingType?: StringFilter<"MilkOutflow"> | string
    quantity?: IntFilter<"MilkOutflow"> | number
    notes?: StringNullableFilter<"MilkOutflow"> | string | null
    createdById?: StringNullableFilter<"MilkOutflow"> | string | null
    createdAt?: DateTimeFilter<"MilkOutflow"> | Date | string
    updatedAt?: DateTimeFilter<"MilkOutflow"> | Date | string
    category?: XOR<MilkCategoryRelationFilter, MilkCategoryWhereInput>
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type MilkOutflowOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: MilkCategoryOrderByWithRelationInput
    createdBy?: UserOrderByWithRelationInput
  }

  export type MilkOutflowWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MilkOutflowWhereInput | MilkOutflowWhereInput[]
    OR?: MilkOutflowWhereInput[]
    NOT?: MilkOutflowWhereInput | MilkOutflowWhereInput[]
    date?: DateTimeFilter<"MilkOutflow"> | Date | string
    categoryId?: StringFilter<"MilkOutflow"> | string
    productType?: StringFilter<"MilkOutflow"> | string
    animalType?: StringFilter<"MilkOutflow"> | string
    packagingType?: StringFilter<"MilkOutflow"> | string
    quantity?: IntFilter<"MilkOutflow"> | number
    notes?: StringNullableFilter<"MilkOutflow"> | string | null
    createdById?: StringNullableFilter<"MilkOutflow"> | string | null
    createdAt?: DateTimeFilter<"MilkOutflow"> | Date | string
    updatedAt?: DateTimeFilter<"MilkOutflow"> | Date | string
    category?: XOR<MilkCategoryRelationFilter, MilkCategoryWhereInput>
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type MilkOutflowOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MilkOutflowCountOrderByAggregateInput
    _avg?: MilkOutflowAvgOrderByAggregateInput
    _max?: MilkOutflowMaxOrderByAggregateInput
    _min?: MilkOutflowMinOrderByAggregateInput
    _sum?: MilkOutflowSumOrderByAggregateInput
  }

  export type MilkOutflowScalarWhereWithAggregatesInput = {
    AND?: MilkOutflowScalarWhereWithAggregatesInput | MilkOutflowScalarWhereWithAggregatesInput[]
    OR?: MilkOutflowScalarWhereWithAggregatesInput[]
    NOT?: MilkOutflowScalarWhereWithAggregatesInput | MilkOutflowScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MilkOutflow"> | string
    date?: DateTimeWithAggregatesFilter<"MilkOutflow"> | Date | string
    categoryId?: StringWithAggregatesFilter<"MilkOutflow"> | string
    productType?: StringWithAggregatesFilter<"MilkOutflow"> | string
    animalType?: StringWithAggregatesFilter<"MilkOutflow"> | string
    packagingType?: StringWithAggregatesFilter<"MilkOutflow"> | string
    quantity?: IntWithAggregatesFilter<"MilkOutflow"> | number
    notes?: StringNullableWithAggregatesFilter<"MilkOutflow"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"MilkOutflow"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MilkOutflow"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MilkOutflow"> | Date | string
  }

  export type MilkSaleWhereInput = {
    AND?: MilkSaleWhereInput | MilkSaleWhereInput[]
    OR?: MilkSaleWhereInput[]
    NOT?: MilkSaleWhereInput | MilkSaleWhereInput[]
    id?: StringFilter<"MilkSale"> | string
    transactionId?: StringNullableFilter<"MilkSale"> | string | null
    date?: DateTimeFilter<"MilkSale"> | Date | string
    tanggal?: DateTimeFilter<"MilkSale"> | Date | string
    sumber?: StringFilter<"MilkSale"> | string
    produkRefId?: StringNullableFilter<"MilkSale"> | string | null
    jumlah?: FloatFilter<"MilkSale"> | number
    pembeli?: StringFilter<"MilkSale"> | string
    hargaJual?: FloatFilter<"MilkSale"> | number
    kategoriBayar?: StringFilter<"MilkSale"> | string
    catatan?: StringNullableFilter<"MilkSale"> | string | null
    productCategory?: StringFilter<"MilkSale"> | string
    productSubtype?: StringNullableFilter<"MilkSale"> | string | null
    variant?: StringNullableFilter<"MilkSale"> | string | null
    packagingType?: StringFilter<"MilkSale"> | string
    quantity?: IntFilter<"MilkSale"> | number
    unitPrice?: FloatFilter<"MilkSale"> | number
    totalPrice?: FloatFilter<"MilkSale"> | number
    status?: StringFilter<"MilkSale"> | string
    notes?: StringNullableFilter<"MilkSale"> | string | null
    createdById?: StringNullableFilter<"MilkSale"> | string | null
    createdAt?: DateTimeFilter<"MilkSale"> | Date | string
    updatedAt?: DateTimeFilter<"MilkSale"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    piutang?: XOR<PiutangNullableRelationFilter, PiutangWhereInput> | null
  }

  export type MilkSaleOrderByWithRelationInput = {
    id?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    produkRefId?: SortOrderInput | SortOrder
    jumlah?: SortOrder
    pembeli?: SortOrder
    hargaJual?: SortOrder
    kategoriBayar?: SortOrder
    catatan?: SortOrderInput | SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrderInput | SortOrder
    variant?: SortOrderInput | SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: UserOrderByWithRelationInput
    piutang?: PiutangOrderByWithRelationInput
  }

  export type MilkSaleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    transactionId?: string
    AND?: MilkSaleWhereInput | MilkSaleWhereInput[]
    OR?: MilkSaleWhereInput[]
    NOT?: MilkSaleWhereInput | MilkSaleWhereInput[]
    date?: DateTimeFilter<"MilkSale"> | Date | string
    tanggal?: DateTimeFilter<"MilkSale"> | Date | string
    sumber?: StringFilter<"MilkSale"> | string
    produkRefId?: StringNullableFilter<"MilkSale"> | string | null
    jumlah?: FloatFilter<"MilkSale"> | number
    pembeli?: StringFilter<"MilkSale"> | string
    hargaJual?: FloatFilter<"MilkSale"> | number
    kategoriBayar?: StringFilter<"MilkSale"> | string
    catatan?: StringNullableFilter<"MilkSale"> | string | null
    productCategory?: StringFilter<"MilkSale"> | string
    productSubtype?: StringNullableFilter<"MilkSale"> | string | null
    variant?: StringNullableFilter<"MilkSale"> | string | null
    packagingType?: StringFilter<"MilkSale"> | string
    quantity?: IntFilter<"MilkSale"> | number
    unitPrice?: FloatFilter<"MilkSale"> | number
    totalPrice?: FloatFilter<"MilkSale"> | number
    status?: StringFilter<"MilkSale"> | string
    notes?: StringNullableFilter<"MilkSale"> | string | null
    createdById?: StringNullableFilter<"MilkSale"> | string | null
    createdAt?: DateTimeFilter<"MilkSale"> | Date | string
    updatedAt?: DateTimeFilter<"MilkSale"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    piutang?: XOR<PiutangNullableRelationFilter, PiutangWhereInput> | null
  }, "id" | "transactionId">

  export type MilkSaleOrderByWithAggregationInput = {
    id?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    produkRefId?: SortOrderInput | SortOrder
    jumlah?: SortOrder
    pembeli?: SortOrder
    hargaJual?: SortOrder
    kategoriBayar?: SortOrder
    catatan?: SortOrderInput | SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrderInput | SortOrder
    variant?: SortOrderInput | SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MilkSaleCountOrderByAggregateInput
    _avg?: MilkSaleAvgOrderByAggregateInput
    _max?: MilkSaleMaxOrderByAggregateInput
    _min?: MilkSaleMinOrderByAggregateInput
    _sum?: MilkSaleSumOrderByAggregateInput
  }

  export type MilkSaleScalarWhereWithAggregatesInput = {
    AND?: MilkSaleScalarWhereWithAggregatesInput | MilkSaleScalarWhereWithAggregatesInput[]
    OR?: MilkSaleScalarWhereWithAggregatesInput[]
    NOT?: MilkSaleScalarWhereWithAggregatesInput | MilkSaleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MilkSale"> | string
    transactionId?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    date?: DateTimeWithAggregatesFilter<"MilkSale"> | Date | string
    tanggal?: DateTimeWithAggregatesFilter<"MilkSale"> | Date | string
    sumber?: StringWithAggregatesFilter<"MilkSale"> | string
    produkRefId?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    jumlah?: FloatWithAggregatesFilter<"MilkSale"> | number
    pembeli?: StringWithAggregatesFilter<"MilkSale"> | string
    hargaJual?: FloatWithAggregatesFilter<"MilkSale"> | number
    kategoriBayar?: StringWithAggregatesFilter<"MilkSale"> | string
    catatan?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    productCategory?: StringWithAggregatesFilter<"MilkSale"> | string
    productSubtype?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    variant?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    packagingType?: StringWithAggregatesFilter<"MilkSale"> | string
    quantity?: IntWithAggregatesFilter<"MilkSale"> | number
    unitPrice?: FloatWithAggregatesFilter<"MilkSale"> | number
    totalPrice?: FloatWithAggregatesFilter<"MilkSale"> | number
    status?: StringWithAggregatesFilter<"MilkSale"> | string
    notes?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"MilkSale"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MilkSale"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MilkSale"> | Date | string
  }

  export type PiutangWhereInput = {
    AND?: PiutangWhereInput | PiutangWhereInput[]
    OR?: PiutangWhereInput[]
    NOT?: PiutangWhereInput | PiutangWhereInput[]
    id?: StringFilter<"Piutang"> | string
    milkSaleId?: StringFilter<"Piutang"> | string
    jumlahAwal?: FloatFilter<"Piutang"> | number
    sisaPiutang?: FloatFilter<"Piutang"> | number
    lunas?: BoolFilter<"Piutang"> | boolean
    createdAt?: DateTimeFilter<"Piutang"> | Date | string
    milkSale?: XOR<MilkSaleRelationFilter, MilkSaleWhereInput>
    pelunasan?: PelunasanPiutangListRelationFilter
  }

  export type PiutangOrderByWithRelationInput = {
    id?: SortOrder
    milkSaleId?: SortOrder
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
    lunas?: SortOrder
    createdAt?: SortOrder
    milkSale?: MilkSaleOrderByWithRelationInput
    pelunasan?: PelunasanPiutangOrderByRelationAggregateInput
  }

  export type PiutangWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    milkSaleId?: string
    AND?: PiutangWhereInput | PiutangWhereInput[]
    OR?: PiutangWhereInput[]
    NOT?: PiutangWhereInput | PiutangWhereInput[]
    jumlahAwal?: FloatFilter<"Piutang"> | number
    sisaPiutang?: FloatFilter<"Piutang"> | number
    lunas?: BoolFilter<"Piutang"> | boolean
    createdAt?: DateTimeFilter<"Piutang"> | Date | string
    milkSale?: XOR<MilkSaleRelationFilter, MilkSaleWhereInput>
    pelunasan?: PelunasanPiutangListRelationFilter
  }, "id" | "milkSaleId">

  export type PiutangOrderByWithAggregationInput = {
    id?: SortOrder
    milkSaleId?: SortOrder
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
    lunas?: SortOrder
    createdAt?: SortOrder
    _count?: PiutangCountOrderByAggregateInput
    _avg?: PiutangAvgOrderByAggregateInput
    _max?: PiutangMaxOrderByAggregateInput
    _min?: PiutangMinOrderByAggregateInput
    _sum?: PiutangSumOrderByAggregateInput
  }

  export type PiutangScalarWhereWithAggregatesInput = {
    AND?: PiutangScalarWhereWithAggregatesInput | PiutangScalarWhereWithAggregatesInput[]
    OR?: PiutangScalarWhereWithAggregatesInput[]
    NOT?: PiutangScalarWhereWithAggregatesInput | PiutangScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Piutang"> | string
    milkSaleId?: StringWithAggregatesFilter<"Piutang"> | string
    jumlahAwal?: FloatWithAggregatesFilter<"Piutang"> | number
    sisaPiutang?: FloatWithAggregatesFilter<"Piutang"> | number
    lunas?: BoolWithAggregatesFilter<"Piutang"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Piutang"> | Date | string
  }

  export type PelunasanPiutangWhereInput = {
    AND?: PelunasanPiutangWhereInput | PelunasanPiutangWhereInput[]
    OR?: PelunasanPiutangWhereInput[]
    NOT?: PelunasanPiutangWhereInput | PelunasanPiutangWhereInput[]
    id?: StringFilter<"PelunasanPiutang"> | string
    piutangId?: StringFilter<"PelunasanPiutang"> | string
    jumlah?: FloatFilter<"PelunasanPiutang"> | number
    tanggal?: DateTimeFilter<"PelunasanPiutang"> | Date | string
    catatan?: StringNullableFilter<"PelunasanPiutang"> | string | null
    piutang?: XOR<PiutangRelationFilter, PiutangWhereInput>
  }

  export type PelunasanPiutangOrderByWithRelationInput = {
    id?: SortOrder
    piutangId?: SortOrder
    jumlah?: SortOrder
    tanggal?: SortOrder
    catatan?: SortOrderInput | SortOrder
    piutang?: PiutangOrderByWithRelationInput
  }

  export type PelunasanPiutangWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PelunasanPiutangWhereInput | PelunasanPiutangWhereInput[]
    OR?: PelunasanPiutangWhereInput[]
    NOT?: PelunasanPiutangWhereInput | PelunasanPiutangWhereInput[]
    piutangId?: StringFilter<"PelunasanPiutang"> | string
    jumlah?: FloatFilter<"PelunasanPiutang"> | number
    tanggal?: DateTimeFilter<"PelunasanPiutang"> | Date | string
    catatan?: StringNullableFilter<"PelunasanPiutang"> | string | null
    piutang?: XOR<PiutangRelationFilter, PiutangWhereInput>
  }, "id">

  export type PelunasanPiutangOrderByWithAggregationInput = {
    id?: SortOrder
    piutangId?: SortOrder
    jumlah?: SortOrder
    tanggal?: SortOrder
    catatan?: SortOrderInput | SortOrder
    _count?: PelunasanPiutangCountOrderByAggregateInput
    _avg?: PelunasanPiutangAvgOrderByAggregateInput
    _max?: PelunasanPiutangMaxOrderByAggregateInput
    _min?: PelunasanPiutangMinOrderByAggregateInput
    _sum?: PelunasanPiutangSumOrderByAggregateInput
  }

  export type PelunasanPiutangScalarWhereWithAggregatesInput = {
    AND?: PelunasanPiutangScalarWhereWithAggregatesInput | PelunasanPiutangScalarWhereWithAggregatesInput[]
    OR?: PelunasanPiutangScalarWhereWithAggregatesInput[]
    NOT?: PelunasanPiutangScalarWhereWithAggregatesInput | PelunasanPiutangScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PelunasanPiutang"> | string
    piutangId?: StringWithAggregatesFilter<"PelunasanPiutang"> | string
    jumlah?: FloatWithAggregatesFilter<"PelunasanPiutang"> | number
    tanggal?: DateTimeWithAggregatesFilter<"PelunasanPiutang"> | Date | string
    catatan?: StringNullableWithAggregatesFilter<"PelunasanPiutang"> | string | null
  }

  export type BastDocumentWhereInput = {
    AND?: BastDocumentWhereInput | BastDocumentWhereInput[]
    OR?: BastDocumentWhereInput[]
    NOT?: BastDocumentWhereInput | BastDocumentWhereInput[]
    id?: StringFilter<"BastDocument"> | string
    nomorBast?: StringFilter<"BastDocument"> | string
    tanggal?: DateTimeFilter<"BastDocument"> | Date | string
    sumber?: StringFilter<"BastDocument"> | string
    volumeLiters?: FloatFilter<"BastDocument"> | number
    jenisPermintaan?: StringFilter<"BastDocument"> | string
    instansiPenerima?: StringNullableFilter<"BastDocument"> | string | null
    pengirimNama?: StringFilter<"BastDocument"> | string
    pengirimRole?: StringFilter<"BastDocument"> | string
    penerimaNama?: StringNullableFilter<"BastDocument"> | string | null
    penerimaRole?: StringNullableFilter<"BastDocument"> | string | null
    status?: StringFilter<"BastDocument"> | string
    catatan?: StringNullableFilter<"BastDocument"> | string | null
    confirmedAt?: DateTimeNullableFilter<"BastDocument"> | Date | string | null
    productionId?: StringNullableFilter<"BastDocument"> | string | null
    createdById?: StringNullableFilter<"BastDocument"> | string | null
    createdAt?: DateTimeFilter<"BastDocument"> | Date | string
    updatedAt?: DateTimeFilter<"BastDocument"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type BastDocumentOrderByWithRelationInput = {
    id?: SortOrder
    nomorBast?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    volumeLiters?: SortOrder
    jenisPermintaan?: SortOrder
    instansiPenerima?: SortOrderInput | SortOrder
    pengirimNama?: SortOrder
    pengirimRole?: SortOrder
    penerimaNama?: SortOrderInput | SortOrder
    penerimaRole?: SortOrderInput | SortOrder
    status?: SortOrder
    catatan?: SortOrderInput | SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    productionId?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: UserOrderByWithRelationInput
  }

  export type BastDocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    nomorBast?: string
    AND?: BastDocumentWhereInput | BastDocumentWhereInput[]
    OR?: BastDocumentWhereInput[]
    NOT?: BastDocumentWhereInput | BastDocumentWhereInput[]
    tanggal?: DateTimeFilter<"BastDocument"> | Date | string
    sumber?: StringFilter<"BastDocument"> | string
    volumeLiters?: FloatFilter<"BastDocument"> | number
    jenisPermintaan?: StringFilter<"BastDocument"> | string
    instansiPenerima?: StringNullableFilter<"BastDocument"> | string | null
    pengirimNama?: StringFilter<"BastDocument"> | string
    pengirimRole?: StringFilter<"BastDocument"> | string
    penerimaNama?: StringNullableFilter<"BastDocument"> | string | null
    penerimaRole?: StringNullableFilter<"BastDocument"> | string | null
    status?: StringFilter<"BastDocument"> | string
    catatan?: StringNullableFilter<"BastDocument"> | string | null
    confirmedAt?: DateTimeNullableFilter<"BastDocument"> | Date | string | null
    productionId?: StringNullableFilter<"BastDocument"> | string | null
    createdById?: StringNullableFilter<"BastDocument"> | string | null
    createdAt?: DateTimeFilter<"BastDocument"> | Date | string
    updatedAt?: DateTimeFilter<"BastDocument"> | Date | string
    createdBy?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id" | "nomorBast">

  export type BastDocumentOrderByWithAggregationInput = {
    id?: SortOrder
    nomorBast?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    volumeLiters?: SortOrder
    jenisPermintaan?: SortOrder
    instansiPenerima?: SortOrderInput | SortOrder
    pengirimNama?: SortOrder
    pengirimRole?: SortOrder
    penerimaNama?: SortOrderInput | SortOrder
    penerimaRole?: SortOrderInput | SortOrder
    status?: SortOrder
    catatan?: SortOrderInput | SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    productionId?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BastDocumentCountOrderByAggregateInput
    _avg?: BastDocumentAvgOrderByAggregateInput
    _max?: BastDocumentMaxOrderByAggregateInput
    _min?: BastDocumentMinOrderByAggregateInput
    _sum?: BastDocumentSumOrderByAggregateInput
  }

  export type BastDocumentScalarWhereWithAggregatesInput = {
    AND?: BastDocumentScalarWhereWithAggregatesInput | BastDocumentScalarWhereWithAggregatesInput[]
    OR?: BastDocumentScalarWhereWithAggregatesInput[]
    NOT?: BastDocumentScalarWhereWithAggregatesInput | BastDocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BastDocument"> | string
    nomorBast?: StringWithAggregatesFilter<"BastDocument"> | string
    tanggal?: DateTimeWithAggregatesFilter<"BastDocument"> | Date | string
    sumber?: StringWithAggregatesFilter<"BastDocument"> | string
    volumeLiters?: FloatWithAggregatesFilter<"BastDocument"> | number
    jenisPermintaan?: StringWithAggregatesFilter<"BastDocument"> | string
    instansiPenerima?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    pengirimNama?: StringWithAggregatesFilter<"BastDocument"> | string
    pengirimRole?: StringWithAggregatesFilter<"BastDocument"> | string
    penerimaNama?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    penerimaRole?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    status?: StringWithAggregatesFilter<"BastDocument"> | string
    catatan?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    confirmedAt?: DateTimeNullableWithAggregatesFilter<"BastDocument"> | Date | string | null
    productionId?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"BastDocument"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BastDocument"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BastDocument"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    targetRole?: StringNullableFilter<"Notification"> | string | null
    targetUserId?: StringNullableFilter<"Notification"> | string | null
    senderId?: StringNullableFilter<"Notification"> | string | null
    senderName?: StringNullableFilter<"Notification"> | string | null
    senderRole?: StringNullableFilter<"Notification"> | string | null
    link?: StringNullableFilter<"Notification"> | string | null
    isRead?: BoolFilter<"Notification"> | boolean
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    metadata?: StringNullableFilter<"Notification"> | string | null
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    targetRole?: SortOrderInput | SortOrder
    targetUserId?: SortOrderInput | SortOrder
    senderId?: SortOrderInput | SortOrder
    senderName?: SortOrderInput | SortOrder
    senderRole?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    isRead?: SortOrder
    readAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    targetRole?: StringNullableFilter<"Notification"> | string | null
    targetUserId?: StringNullableFilter<"Notification"> | string | null
    senderId?: StringNullableFilter<"Notification"> | string | null
    senderName?: StringNullableFilter<"Notification"> | string | null
    senderRole?: StringNullableFilter<"Notification"> | string | null
    link?: StringNullableFilter<"Notification"> | string | null
    isRead?: BoolFilter<"Notification"> | boolean
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    metadata?: StringNullableFilter<"Notification"> | string | null
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    targetRole?: SortOrderInput | SortOrder
    targetUserId?: SortOrderInput | SortOrder
    senderId?: SortOrderInput | SortOrder
    senderName?: SortOrderInput | SortOrder
    senderRole?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    isRead?: SortOrder
    readAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    type?: StringWithAggregatesFilter<"Notification"> | string
    targetRole?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    targetUserId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    senderId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    senderName?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    senderRole?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    link?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    readAt?: DateTimeNullableWithAggregatesFilter<"Notification"> | Date | string | null
    metadata?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type AdminCreateInput = {
    username?: string | null
    password?: string | null
    role?: string | null
    record_flag?: string | null
  }

  export type AdminUncheckedCreateInput = {
    id?: number
    username?: string | null
    password?: string | null
    role?: string | null
    record_flag?: string | null
  }

  export type AdminUpdateInput = {
    username?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    record_flag?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    record_flag?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminCreateManyInput = {
    id?: number
    username?: string | null
    password?: string | null
    role?: string | null
    record_flag?: string | null
  }

  export type AdminUpdateManyMutationInput = {
    username?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    record_flag?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    record_flag?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemLogCreateInput = {
    id?: string
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
    user?: UserCreateNestedOneWithoutLogsInput
  }

  export type SystemLogUncheckedCreateInput = {
    id?: string
    userId?: string | null
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
  }

  export type SystemLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutLogsNestedInput
  }

  export type SystemLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemLogCreateManyInput = {
    id?: string
    userId?: string | null
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
  }

  export type SystemLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkCategoryCreateInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionCreateNestedManyWithoutCategoryInput
    packagings?: MilkPackagingCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCategoryInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUpdateManyWithoutCategoryNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCategoryNestedInput
  }

  export type MilkCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUncheckedUpdateManyWithoutCategoryNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type MilkCategoryCreateManyInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionCreateInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: MilkCategoryCreateNestedOneWithoutProductionsInput
    createdBy?: UserCreateNestedOneWithoutProductionsInput
  }

  export type MilkProductionUncheckedCreateInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    categoryId?: string | null
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkProductionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneWithoutProductionsNestedInput
    createdBy?: UserUpdateOneWithoutProductionsNestedInput
  }

  export type MilkProductionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionCreateManyInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    categoryId?: string | null
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkProductionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductCreateInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutPackagedProductsInput
  }

  export type PackagedProductUncheckedCreateInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackagedProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutPackagedProductsNestedInput
  }

  export type PackagedProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductCreateManyInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackagedProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingCreateInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: MilkCategoryCreateNestedOneWithoutPackagingsInput
    createdBy?: UserCreateNestedOneWithoutPackagingsInput
  }

  export type MilkPackagingUncheckedCreateInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    categoryId?: string | null
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneWithoutPackagingsNestedInput
    createdBy?: UserUpdateOneWithoutPackagingsNestedInput
  }

  export type MilkPackagingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingCreateManyInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    categoryId?: string | null
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowCreateInput = {
    id?: string
    date?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: MilkCategoryCreateNestedOneWithoutOutflowsInput
    createdBy?: UserCreateNestedOneWithoutOutflowsInput
  }

  export type MilkOutflowUncheckedCreateInput = {
    id?: string
    date?: Date | string
    categoryId: string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneRequiredWithoutOutflowsNestedInput
    createdBy?: UserUpdateOneWithoutOutflowsNestedInput
  }

  export type MilkOutflowUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowCreateManyInput = {
    id?: string
    date?: Date | string
    categoryId: string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkSaleCreateInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutSalesInput
    piutang?: PiutangCreateNestedOneWithoutMilkSaleInput
  }

  export type MilkSaleUncheckedCreateInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    piutang?: PiutangUncheckedCreateNestedOneWithoutMilkSaleInput
  }

  export type MilkSaleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutSalesNestedInput
    piutang?: PiutangUpdateOneWithoutMilkSaleNestedInput
  }

  export type MilkSaleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    piutang?: PiutangUncheckedUpdateOneWithoutMilkSaleNestedInput
  }

  export type MilkSaleCreateManyInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkSaleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkSaleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PiutangCreateInput = {
    id?: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
    milkSale: MilkSaleCreateNestedOneWithoutPiutangInput
    pelunasan?: PelunasanPiutangCreateNestedManyWithoutPiutangInput
  }

  export type PiutangUncheckedCreateInput = {
    id?: string
    milkSaleId: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
    pelunasan?: PelunasanPiutangUncheckedCreateNestedManyWithoutPiutangInput
  }

  export type PiutangUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    milkSale?: MilkSaleUpdateOneRequiredWithoutPiutangNestedInput
    pelunasan?: PelunasanPiutangUpdateManyWithoutPiutangNestedInput
  }

  export type PiutangUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    milkSaleId?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pelunasan?: PelunasanPiutangUncheckedUpdateManyWithoutPiutangNestedInput
  }

  export type PiutangCreateManyInput = {
    id?: string
    milkSaleId: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
  }

  export type PiutangUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PiutangUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    milkSaleId?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PelunasanPiutangCreateInput = {
    id?: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
    piutang: PiutangCreateNestedOneWithoutPelunasanInput
  }

  export type PelunasanPiutangUncheckedCreateInput = {
    id?: string
    piutangId: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
  }

  export type PelunasanPiutangUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    piutang?: PiutangUpdateOneRequiredWithoutPelunasanNestedInput
  }

  export type PelunasanPiutangUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    piutangId?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PelunasanPiutangCreateManyInput = {
    id?: string
    piutangId: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
  }

  export type PelunasanPiutangUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PelunasanPiutangUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    piutangId?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BastDocumentCreateInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutBastDocumentsInput
  }

  export type BastDocumentUncheckedCreateInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BastDocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutBastDocumentsNestedInput
  }

  export type BastDocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BastDocumentCreateManyInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BastDocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BastDocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    id?: string
    title: string
    message: string
    type?: string
    targetRole?: string | null
    targetUserId?: string | null
    senderId?: string | null
    senderName?: string | null
    senderRole?: string | null
    link?: string | null
    isRead?: boolean
    readAt?: Date | string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    title: string
    message: string
    type?: string
    targetRole?: string | null
    targetUserId?: string | null
    senderId?: string | null
    senderName?: string | null
    senderRole?: string | null
    link?: string | null
    isRead?: boolean
    readAt?: Date | string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    targetRole?: NullableStringFieldUpdateOperationsInput | string | null
    targetUserId?: NullableStringFieldUpdateOperationsInput | string | null
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    senderRole?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    targetRole?: NullableStringFieldUpdateOperationsInput | string | null
    targetUserId?: NullableStringFieldUpdateOperationsInput | string | null
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    senderRole?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: string
    title: string
    message: string
    type?: string
    targetRole?: string | null
    targetUserId?: string | null
    senderId?: string | null
    senderName?: string | null
    senderRole?: string | null
    link?: string | null
    isRead?: boolean
    readAt?: Date | string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    targetRole?: NullableStringFieldUpdateOperationsInput | string | null
    targetUserId?: NullableStringFieldUpdateOperationsInput | string | null
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    senderRole?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    targetRole?: NullableStringFieldUpdateOperationsInput | string | null
    targetUserId?: NullableStringFieldUpdateOperationsInput | string | null
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    senderRole?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AdminCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    role?: SortOrder
    record_flag?: SortOrder
  }

  export type AdminAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AdminMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    role?: SortOrder
    record_flag?: SortOrder
  }

  export type AdminMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    role?: SortOrder
    record_flag?: SortOrder
  }

  export type AdminSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SystemLogListRelationFilter = {
    every?: SystemLogWhereInput
    some?: SystemLogWhereInput
    none?: SystemLogWhereInput
  }

  export type MilkProductionListRelationFilter = {
    every?: MilkProductionWhereInput
    some?: MilkProductionWhereInput
    none?: MilkProductionWhereInput
  }

  export type MilkPackagingListRelationFilter = {
    every?: MilkPackagingWhereInput
    some?: MilkPackagingWhereInput
    none?: MilkPackagingWhereInput
  }

  export type MilkOutflowListRelationFilter = {
    every?: MilkOutflowWhereInput
    some?: MilkOutflowWhereInput
    none?: MilkOutflowWhereInput
  }

  export type MilkSaleListRelationFilter = {
    every?: MilkSaleWhereInput
    some?: MilkSaleWhereInput
    none?: MilkSaleWhereInput
  }

  export type BastDocumentListRelationFilter = {
    every?: BastDocumentWhereInput
    some?: BastDocumentWhereInput
    none?: BastDocumentWhereInput
  }

  export type PackagedProductListRelationFilter = {
    every?: PackagedProductWhereInput
    some?: PackagedProductWhereInput
    none?: PackagedProductWhereInput
  }

  export type SystemLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MilkProductionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MilkPackagingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MilkOutflowOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MilkSaleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BastDocumentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PackagedProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserNullableRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SystemLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    action?: SortOrder
    level?: SortOrder
    details?: SortOrder
    createdAt?: SortOrder
  }

  export type SystemLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    action?: SortOrder
    level?: SortOrder
    details?: SortOrder
    createdAt?: SortOrder
  }

  export type SystemLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    action?: SortOrder
    level?: SortOrder
    details?: SortOrder
    createdAt?: SortOrder
  }

  export type MilkCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    defaultPackaging?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    defaultPackaging?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    defaultPackaging?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type MilkCategoryNullableRelationFilter = {
    is?: MilkCategoryWhereInput | null
    isNot?: MilkCategoryWhereInput | null
  }

  export type MilkProductionCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageType?: SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkProductionAvgOrderByAggregateInput = {
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
  }

  export type MilkProductionMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageType?: SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkProductionMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageType?: SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkProductionSumOrderByAggregateInput = {
    grossVolumeLiters?: SortOrder
    produksi?: SortOrder
    pedetVolumeLiters?: SortOrder
    setorPedet?: SortOrder
    afkirVolumeLiters?: SortOrder
    rusakAfkir?: SortOrder
    usageVolumeLiters?: SortOrder
    rawVolumeLiters?: SortOrder
    kirimKePI?: SortOrder
    processedLiters?: SortOrder
    packagedQty?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PackagedProductCountOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jenisProduk?: SortOrder
    kemasan?: SortOrder
    jumlah?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    receivedByName?: SortOrder
    condition?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackagedProductAvgOrderByAggregateInput = {
    jumlah?: SortOrder
  }

  export type PackagedProductMaxOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jenisProduk?: SortOrder
    kemasan?: SortOrder
    jumlah?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    receivedByName?: SortOrder
    condition?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackagedProductMinOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jenisProduk?: SortOrder
    kemasan?: SortOrder
    jumlah?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    receivedByName?: SortOrder
    condition?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackagedProductSumOrderByAggregateInput = {
    jumlah?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type MilkPackagingCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    origin?: SortOrder
    variant?: SortOrder
    animalType?: SortOrder
    categoryId?: SortOrder
    processedAmount?: SortOrder
    processedUnit?: SortOrder
    processedLiters?: SortOrder
    packagingDetails?: SortOrder
    packagingType?: SortOrder
    packageSize?: SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    sentById?: SortOrder
    sentByName?: SortOrder
    receivedAt?: SortOrder
    receivedById?: SortOrder
    receivedByName?: SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
    condition?: SortOrder
    receptionNotes?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkPackagingAvgOrderByAggregateInput = {
    processedAmount?: SortOrder
    processedLiters?: SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
  }

  export type MilkPackagingMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    origin?: SortOrder
    variant?: SortOrder
    animalType?: SortOrder
    categoryId?: SortOrder
    processedAmount?: SortOrder
    processedUnit?: SortOrder
    processedLiters?: SortOrder
    packagingDetails?: SortOrder
    packagingType?: SortOrder
    packageSize?: SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    sentById?: SortOrder
    sentByName?: SortOrder
    receivedAt?: SortOrder
    receivedById?: SortOrder
    receivedByName?: SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
    condition?: SortOrder
    receptionNotes?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkPackagingMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    origin?: SortOrder
    variant?: SortOrder
    animalType?: SortOrder
    categoryId?: SortOrder
    processedAmount?: SortOrder
    processedUnit?: SortOrder
    processedLiters?: SortOrder
    packagingDetails?: SortOrder
    packagingType?: SortOrder
    packageSize?: SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    sentById?: SortOrder
    sentByName?: SortOrder
    receivedAt?: SortOrder
    receivedById?: SortOrder
    receivedByName?: SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
    condition?: SortOrder
    receptionNotes?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkPackagingSumOrderByAggregateInput = {
    processedAmount?: SortOrder
    processedLiters?: SortOrder
    botolQty?: SortOrder
    cupQty?: SortOrder
    plastikBantalQty?: SortOrder
    totalPackagedQty?: SortOrder
    quantitySent?: SortOrder
    quantityReceived?: SortOrder
  }

  export type MilkCategoryRelationFilter = {
    is?: MilkCategoryWhereInput
    isNot?: MilkCategoryWhereInput
  }

  export type MilkOutflowCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkOutflowAvgOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type MilkOutflowMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkOutflowMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    categoryId?: SortOrder
    productType?: SortOrder
    animalType?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkOutflowSumOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type PiutangNullableRelationFilter = {
    is?: PiutangWhereInput | null
    isNot?: PiutangWhereInput | null
  }

  export type MilkSaleCountOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    produkRefId?: SortOrder
    jumlah?: SortOrder
    pembeli?: SortOrder
    hargaJual?: SortOrder
    kategoriBayar?: SortOrder
    catatan?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    variant?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkSaleAvgOrderByAggregateInput = {
    jumlah?: SortOrder
    hargaJual?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
  }

  export type MilkSaleMaxOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    produkRefId?: SortOrder
    jumlah?: SortOrder
    pembeli?: SortOrder
    hargaJual?: SortOrder
    kategoriBayar?: SortOrder
    catatan?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    variant?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkSaleMinOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    produkRefId?: SortOrder
    jumlah?: SortOrder
    pembeli?: SortOrder
    hargaJual?: SortOrder
    kategoriBayar?: SortOrder
    catatan?: SortOrder
    productCategory?: SortOrder
    productSubtype?: SortOrder
    variant?: SortOrder
    packagingType?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MilkSaleSumOrderByAggregateInput = {
    jumlah?: SortOrder
    hargaJual?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
  }

  export type MilkSaleRelationFilter = {
    is?: MilkSaleWhereInput
    isNot?: MilkSaleWhereInput
  }

  export type PelunasanPiutangListRelationFilter = {
    every?: PelunasanPiutangWhereInput
    some?: PelunasanPiutangWhereInput
    none?: PelunasanPiutangWhereInput
  }

  export type PelunasanPiutangOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PiutangCountOrderByAggregateInput = {
    id?: SortOrder
    milkSaleId?: SortOrder
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
    lunas?: SortOrder
    createdAt?: SortOrder
  }

  export type PiutangAvgOrderByAggregateInput = {
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
  }

  export type PiutangMaxOrderByAggregateInput = {
    id?: SortOrder
    milkSaleId?: SortOrder
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
    lunas?: SortOrder
    createdAt?: SortOrder
  }

  export type PiutangMinOrderByAggregateInput = {
    id?: SortOrder
    milkSaleId?: SortOrder
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
    lunas?: SortOrder
    createdAt?: SortOrder
  }

  export type PiutangSumOrderByAggregateInput = {
    jumlahAwal?: SortOrder
    sisaPiutang?: SortOrder
  }

  export type PiutangRelationFilter = {
    is?: PiutangWhereInput
    isNot?: PiutangWhereInput
  }

  export type PelunasanPiutangCountOrderByAggregateInput = {
    id?: SortOrder
    piutangId?: SortOrder
    jumlah?: SortOrder
    tanggal?: SortOrder
    catatan?: SortOrder
  }

  export type PelunasanPiutangAvgOrderByAggregateInput = {
    jumlah?: SortOrder
  }

  export type PelunasanPiutangMaxOrderByAggregateInput = {
    id?: SortOrder
    piutangId?: SortOrder
    jumlah?: SortOrder
    tanggal?: SortOrder
    catatan?: SortOrder
  }

  export type PelunasanPiutangMinOrderByAggregateInput = {
    id?: SortOrder
    piutangId?: SortOrder
    jumlah?: SortOrder
    tanggal?: SortOrder
    catatan?: SortOrder
  }

  export type PelunasanPiutangSumOrderByAggregateInput = {
    jumlah?: SortOrder
  }

  export type BastDocumentCountOrderByAggregateInput = {
    id?: SortOrder
    nomorBast?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    volumeLiters?: SortOrder
    jenisPermintaan?: SortOrder
    instansiPenerima?: SortOrder
    pengirimNama?: SortOrder
    pengirimRole?: SortOrder
    penerimaNama?: SortOrder
    penerimaRole?: SortOrder
    status?: SortOrder
    catatan?: SortOrder
    confirmedAt?: SortOrder
    productionId?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BastDocumentAvgOrderByAggregateInput = {
    volumeLiters?: SortOrder
  }

  export type BastDocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    nomorBast?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    volumeLiters?: SortOrder
    jenisPermintaan?: SortOrder
    instansiPenerima?: SortOrder
    pengirimNama?: SortOrder
    pengirimRole?: SortOrder
    penerimaNama?: SortOrder
    penerimaRole?: SortOrder
    status?: SortOrder
    catatan?: SortOrder
    confirmedAt?: SortOrder
    productionId?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BastDocumentMinOrderByAggregateInput = {
    id?: SortOrder
    nomorBast?: SortOrder
    tanggal?: SortOrder
    sumber?: SortOrder
    volumeLiters?: SortOrder
    jenisPermintaan?: SortOrder
    instansiPenerima?: SortOrder
    pengirimNama?: SortOrder
    pengirimRole?: SortOrder
    penerimaNama?: SortOrder
    penerimaRole?: SortOrder
    status?: SortOrder
    catatan?: SortOrder
    confirmedAt?: SortOrder
    productionId?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BastDocumentSumOrderByAggregateInput = {
    volumeLiters?: SortOrder
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    targetRole?: SortOrder
    targetUserId?: SortOrder
    senderId?: SortOrder
    senderName?: SortOrder
    senderRole?: SortOrder
    link?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    targetRole?: SortOrder
    targetUserId?: SortOrder
    senderId?: SortOrder
    senderName?: SortOrder
    senderRole?: SortOrder
    link?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    targetRole?: SortOrder
    targetUserId?: SortOrder
    senderId?: SortOrder
    senderName?: SortOrder
    senderRole?: SortOrder
    link?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SystemLogCreateNestedManyWithoutUserInput = {
    create?: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput> | SystemLogCreateWithoutUserInput[] | SystemLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SystemLogCreateOrConnectWithoutUserInput | SystemLogCreateOrConnectWithoutUserInput[]
    createMany?: SystemLogCreateManyUserInputEnvelope
    connect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
  }

  export type MilkProductionCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput> | MilkProductionCreateWithoutCreatedByInput[] | MilkProductionUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCreatedByInput | MilkProductionCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkProductionCreateManyCreatedByInputEnvelope
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
  }

  export type MilkPackagingCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput> | MilkPackagingCreateWithoutCreatedByInput[] | MilkPackagingUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCreatedByInput | MilkPackagingCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkPackagingCreateManyCreatedByInputEnvelope
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
  }

  export type MilkOutflowCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput> | MilkOutflowCreateWithoutCreatedByInput[] | MilkOutflowUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCreatedByInput | MilkOutflowCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkOutflowCreateManyCreatedByInputEnvelope
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
  }

  export type MilkSaleCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput> | MilkSaleCreateWithoutCreatedByInput[] | MilkSaleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkSaleCreateOrConnectWithoutCreatedByInput | MilkSaleCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkSaleCreateManyCreatedByInputEnvelope
    connect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
  }

  export type BastDocumentCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput> | BastDocumentCreateWithoutCreatedByInput[] | BastDocumentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: BastDocumentCreateOrConnectWithoutCreatedByInput | BastDocumentCreateOrConnectWithoutCreatedByInput[]
    createMany?: BastDocumentCreateManyCreatedByInputEnvelope
    connect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
  }

  export type PackagedProductCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput> | PackagedProductCreateWithoutCreatedByInput[] | PackagedProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: PackagedProductCreateOrConnectWithoutCreatedByInput | PackagedProductCreateOrConnectWithoutCreatedByInput[]
    createMany?: PackagedProductCreateManyCreatedByInputEnvelope
    connect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
  }

  export type SystemLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput> | SystemLogCreateWithoutUserInput[] | SystemLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SystemLogCreateOrConnectWithoutUserInput | SystemLogCreateOrConnectWithoutUserInput[]
    createMany?: SystemLogCreateManyUserInputEnvelope
    connect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
  }

  export type MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput> | MilkProductionCreateWithoutCreatedByInput[] | MilkProductionUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCreatedByInput | MilkProductionCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkProductionCreateManyCreatedByInputEnvelope
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
  }

  export type MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput> | MilkPackagingCreateWithoutCreatedByInput[] | MilkPackagingUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCreatedByInput | MilkPackagingCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkPackagingCreateManyCreatedByInputEnvelope
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
  }

  export type MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput> | MilkOutflowCreateWithoutCreatedByInput[] | MilkOutflowUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCreatedByInput | MilkOutflowCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkOutflowCreateManyCreatedByInputEnvelope
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
  }

  export type MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput> | MilkSaleCreateWithoutCreatedByInput[] | MilkSaleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkSaleCreateOrConnectWithoutCreatedByInput | MilkSaleCreateOrConnectWithoutCreatedByInput[]
    createMany?: MilkSaleCreateManyCreatedByInputEnvelope
    connect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
  }

  export type BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput> | BastDocumentCreateWithoutCreatedByInput[] | BastDocumentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: BastDocumentCreateOrConnectWithoutCreatedByInput | BastDocumentCreateOrConnectWithoutCreatedByInput[]
    createMany?: BastDocumentCreateManyCreatedByInputEnvelope
    connect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
  }

  export type PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput> | PackagedProductCreateWithoutCreatedByInput[] | PackagedProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: PackagedProductCreateOrConnectWithoutCreatedByInput | PackagedProductCreateOrConnectWithoutCreatedByInput[]
    createMany?: PackagedProductCreateManyCreatedByInputEnvelope
    connect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SystemLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput> | SystemLogCreateWithoutUserInput[] | SystemLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SystemLogCreateOrConnectWithoutUserInput | SystemLogCreateOrConnectWithoutUserInput[]
    upsert?: SystemLogUpsertWithWhereUniqueWithoutUserInput | SystemLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SystemLogCreateManyUserInputEnvelope
    set?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    disconnect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    delete?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    connect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    update?: SystemLogUpdateWithWhereUniqueWithoutUserInput | SystemLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SystemLogUpdateManyWithWhereWithoutUserInput | SystemLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SystemLogScalarWhereInput | SystemLogScalarWhereInput[]
  }

  export type MilkProductionUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput> | MilkProductionCreateWithoutCreatedByInput[] | MilkProductionUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCreatedByInput | MilkProductionCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkProductionUpsertWithWhereUniqueWithoutCreatedByInput | MilkProductionUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkProductionCreateManyCreatedByInputEnvelope
    set?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    disconnect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    delete?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    update?: MilkProductionUpdateWithWhereUniqueWithoutCreatedByInput | MilkProductionUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkProductionUpdateManyWithWhereWithoutCreatedByInput | MilkProductionUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
  }

  export type MilkPackagingUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput> | MilkPackagingCreateWithoutCreatedByInput[] | MilkPackagingUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCreatedByInput | MilkPackagingCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkPackagingUpsertWithWhereUniqueWithoutCreatedByInput | MilkPackagingUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkPackagingCreateManyCreatedByInputEnvelope
    set?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    disconnect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    delete?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    update?: MilkPackagingUpdateWithWhereUniqueWithoutCreatedByInput | MilkPackagingUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkPackagingUpdateManyWithWhereWithoutCreatedByInput | MilkPackagingUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
  }

  export type MilkOutflowUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput> | MilkOutflowCreateWithoutCreatedByInput[] | MilkOutflowUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCreatedByInput | MilkOutflowCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkOutflowUpsertWithWhereUniqueWithoutCreatedByInput | MilkOutflowUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkOutflowCreateManyCreatedByInputEnvelope
    set?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    disconnect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    delete?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    update?: MilkOutflowUpdateWithWhereUniqueWithoutCreatedByInput | MilkOutflowUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkOutflowUpdateManyWithWhereWithoutCreatedByInput | MilkOutflowUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
  }

  export type MilkSaleUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput> | MilkSaleCreateWithoutCreatedByInput[] | MilkSaleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkSaleCreateOrConnectWithoutCreatedByInput | MilkSaleCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkSaleUpsertWithWhereUniqueWithoutCreatedByInput | MilkSaleUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkSaleCreateManyCreatedByInputEnvelope
    set?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    disconnect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    delete?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    connect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    update?: MilkSaleUpdateWithWhereUniqueWithoutCreatedByInput | MilkSaleUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkSaleUpdateManyWithWhereWithoutCreatedByInput | MilkSaleUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkSaleScalarWhereInput | MilkSaleScalarWhereInput[]
  }

  export type BastDocumentUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput> | BastDocumentCreateWithoutCreatedByInput[] | BastDocumentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: BastDocumentCreateOrConnectWithoutCreatedByInput | BastDocumentCreateOrConnectWithoutCreatedByInput[]
    upsert?: BastDocumentUpsertWithWhereUniqueWithoutCreatedByInput | BastDocumentUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: BastDocumentCreateManyCreatedByInputEnvelope
    set?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    disconnect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    delete?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    connect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    update?: BastDocumentUpdateWithWhereUniqueWithoutCreatedByInput | BastDocumentUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: BastDocumentUpdateManyWithWhereWithoutCreatedByInput | BastDocumentUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: BastDocumentScalarWhereInput | BastDocumentScalarWhereInput[]
  }

  export type PackagedProductUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput> | PackagedProductCreateWithoutCreatedByInput[] | PackagedProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: PackagedProductCreateOrConnectWithoutCreatedByInput | PackagedProductCreateOrConnectWithoutCreatedByInput[]
    upsert?: PackagedProductUpsertWithWhereUniqueWithoutCreatedByInput | PackagedProductUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: PackagedProductCreateManyCreatedByInputEnvelope
    set?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    disconnect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    delete?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    connect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    update?: PackagedProductUpdateWithWhereUniqueWithoutCreatedByInput | PackagedProductUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: PackagedProductUpdateManyWithWhereWithoutCreatedByInput | PackagedProductUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: PackagedProductScalarWhereInput | PackagedProductScalarWhereInput[]
  }

  export type SystemLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput> | SystemLogCreateWithoutUserInput[] | SystemLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SystemLogCreateOrConnectWithoutUserInput | SystemLogCreateOrConnectWithoutUserInput[]
    upsert?: SystemLogUpsertWithWhereUniqueWithoutUserInput | SystemLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SystemLogCreateManyUserInputEnvelope
    set?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    disconnect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    delete?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    connect?: SystemLogWhereUniqueInput | SystemLogWhereUniqueInput[]
    update?: SystemLogUpdateWithWhereUniqueWithoutUserInput | SystemLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SystemLogUpdateManyWithWhereWithoutUserInput | SystemLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SystemLogScalarWhereInput | SystemLogScalarWhereInput[]
  }

  export type MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput> | MilkProductionCreateWithoutCreatedByInput[] | MilkProductionUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCreatedByInput | MilkProductionCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkProductionUpsertWithWhereUniqueWithoutCreatedByInput | MilkProductionUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkProductionCreateManyCreatedByInputEnvelope
    set?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    disconnect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    delete?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    update?: MilkProductionUpdateWithWhereUniqueWithoutCreatedByInput | MilkProductionUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkProductionUpdateManyWithWhereWithoutCreatedByInput | MilkProductionUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
  }

  export type MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput> | MilkPackagingCreateWithoutCreatedByInput[] | MilkPackagingUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCreatedByInput | MilkPackagingCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkPackagingUpsertWithWhereUniqueWithoutCreatedByInput | MilkPackagingUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkPackagingCreateManyCreatedByInputEnvelope
    set?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    disconnect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    delete?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    update?: MilkPackagingUpdateWithWhereUniqueWithoutCreatedByInput | MilkPackagingUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkPackagingUpdateManyWithWhereWithoutCreatedByInput | MilkPackagingUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
  }

  export type MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput> | MilkOutflowCreateWithoutCreatedByInput[] | MilkOutflowUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCreatedByInput | MilkOutflowCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkOutflowUpsertWithWhereUniqueWithoutCreatedByInput | MilkOutflowUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkOutflowCreateManyCreatedByInputEnvelope
    set?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    disconnect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    delete?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    update?: MilkOutflowUpdateWithWhereUniqueWithoutCreatedByInput | MilkOutflowUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkOutflowUpdateManyWithWhereWithoutCreatedByInput | MilkOutflowUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
  }

  export type MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput> | MilkSaleCreateWithoutCreatedByInput[] | MilkSaleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: MilkSaleCreateOrConnectWithoutCreatedByInput | MilkSaleCreateOrConnectWithoutCreatedByInput[]
    upsert?: MilkSaleUpsertWithWhereUniqueWithoutCreatedByInput | MilkSaleUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: MilkSaleCreateManyCreatedByInputEnvelope
    set?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    disconnect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    delete?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    connect?: MilkSaleWhereUniqueInput | MilkSaleWhereUniqueInput[]
    update?: MilkSaleUpdateWithWhereUniqueWithoutCreatedByInput | MilkSaleUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: MilkSaleUpdateManyWithWhereWithoutCreatedByInput | MilkSaleUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: MilkSaleScalarWhereInput | MilkSaleScalarWhereInput[]
  }

  export type BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput> | BastDocumentCreateWithoutCreatedByInput[] | BastDocumentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: BastDocumentCreateOrConnectWithoutCreatedByInput | BastDocumentCreateOrConnectWithoutCreatedByInput[]
    upsert?: BastDocumentUpsertWithWhereUniqueWithoutCreatedByInput | BastDocumentUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: BastDocumentCreateManyCreatedByInputEnvelope
    set?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    disconnect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    delete?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    connect?: BastDocumentWhereUniqueInput | BastDocumentWhereUniqueInput[]
    update?: BastDocumentUpdateWithWhereUniqueWithoutCreatedByInput | BastDocumentUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: BastDocumentUpdateManyWithWhereWithoutCreatedByInput | BastDocumentUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: BastDocumentScalarWhereInput | BastDocumentScalarWhereInput[]
  }

  export type PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput> | PackagedProductCreateWithoutCreatedByInput[] | PackagedProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: PackagedProductCreateOrConnectWithoutCreatedByInput | PackagedProductCreateOrConnectWithoutCreatedByInput[]
    upsert?: PackagedProductUpsertWithWhereUniqueWithoutCreatedByInput | PackagedProductUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: PackagedProductCreateManyCreatedByInputEnvelope
    set?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    disconnect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    delete?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    connect?: PackagedProductWhereUniqueInput | PackagedProductWhereUniqueInput[]
    update?: PackagedProductUpdateWithWhereUniqueWithoutCreatedByInput | PackagedProductUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: PackagedProductUpdateManyWithWhereWithoutCreatedByInput | PackagedProductUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: PackagedProductScalarWhereInput | PackagedProductScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutLogsInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutLogsNestedInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    upsert?: UserUpsertWithoutLogsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLogsInput, UserUpdateWithoutLogsInput>, UserUncheckedUpdateWithoutLogsInput>
  }

  export type MilkProductionCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput> | MilkProductionCreateWithoutCategoryInput[] | MilkProductionUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCategoryInput | MilkProductionCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkProductionCreateManyCategoryInputEnvelope
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
  }

  export type MilkPackagingCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput> | MilkPackagingCreateWithoutCategoryInput[] | MilkPackagingUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCategoryInput | MilkPackagingCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkPackagingCreateManyCategoryInputEnvelope
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
  }

  export type MilkOutflowCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput> | MilkOutflowCreateWithoutCategoryInput[] | MilkOutflowUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCategoryInput | MilkOutflowCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkOutflowCreateManyCategoryInputEnvelope
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
  }

  export type MilkProductionUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput> | MilkProductionCreateWithoutCategoryInput[] | MilkProductionUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCategoryInput | MilkProductionCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkProductionCreateManyCategoryInputEnvelope
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
  }

  export type MilkPackagingUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput> | MilkPackagingCreateWithoutCategoryInput[] | MilkPackagingUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCategoryInput | MilkPackagingCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkPackagingCreateManyCategoryInputEnvelope
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
  }

  export type MilkOutflowUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput> | MilkOutflowCreateWithoutCategoryInput[] | MilkOutflowUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCategoryInput | MilkOutflowCreateOrConnectWithoutCategoryInput[]
    createMany?: MilkOutflowCreateManyCategoryInputEnvelope
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
  }

  export type MilkProductionUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput> | MilkProductionCreateWithoutCategoryInput[] | MilkProductionUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCategoryInput | MilkProductionCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkProductionUpsertWithWhereUniqueWithoutCategoryInput | MilkProductionUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkProductionCreateManyCategoryInputEnvelope
    set?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    disconnect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    delete?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    update?: MilkProductionUpdateWithWhereUniqueWithoutCategoryInput | MilkProductionUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkProductionUpdateManyWithWhereWithoutCategoryInput | MilkProductionUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
  }

  export type MilkPackagingUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput> | MilkPackagingCreateWithoutCategoryInput[] | MilkPackagingUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCategoryInput | MilkPackagingCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkPackagingUpsertWithWhereUniqueWithoutCategoryInput | MilkPackagingUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkPackagingCreateManyCategoryInputEnvelope
    set?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    disconnect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    delete?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    update?: MilkPackagingUpdateWithWhereUniqueWithoutCategoryInput | MilkPackagingUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkPackagingUpdateManyWithWhereWithoutCategoryInput | MilkPackagingUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
  }

  export type MilkOutflowUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput> | MilkOutflowCreateWithoutCategoryInput[] | MilkOutflowUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCategoryInput | MilkOutflowCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkOutflowUpsertWithWhereUniqueWithoutCategoryInput | MilkOutflowUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkOutflowCreateManyCategoryInputEnvelope
    set?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    disconnect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    delete?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    update?: MilkOutflowUpdateWithWhereUniqueWithoutCategoryInput | MilkOutflowUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkOutflowUpdateManyWithWhereWithoutCategoryInput | MilkOutflowUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
  }

  export type MilkProductionUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput> | MilkProductionCreateWithoutCategoryInput[] | MilkProductionUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkProductionCreateOrConnectWithoutCategoryInput | MilkProductionCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkProductionUpsertWithWhereUniqueWithoutCategoryInput | MilkProductionUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkProductionCreateManyCategoryInputEnvelope
    set?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    disconnect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    delete?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    connect?: MilkProductionWhereUniqueInput | MilkProductionWhereUniqueInput[]
    update?: MilkProductionUpdateWithWhereUniqueWithoutCategoryInput | MilkProductionUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkProductionUpdateManyWithWhereWithoutCategoryInput | MilkProductionUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
  }

  export type MilkPackagingUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput> | MilkPackagingCreateWithoutCategoryInput[] | MilkPackagingUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkPackagingCreateOrConnectWithoutCategoryInput | MilkPackagingCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkPackagingUpsertWithWhereUniqueWithoutCategoryInput | MilkPackagingUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkPackagingCreateManyCategoryInputEnvelope
    set?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    disconnect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    delete?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    connect?: MilkPackagingWhereUniqueInput | MilkPackagingWhereUniqueInput[]
    update?: MilkPackagingUpdateWithWhereUniqueWithoutCategoryInput | MilkPackagingUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkPackagingUpdateManyWithWhereWithoutCategoryInput | MilkPackagingUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
  }

  export type MilkOutflowUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput> | MilkOutflowCreateWithoutCategoryInput[] | MilkOutflowUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: MilkOutflowCreateOrConnectWithoutCategoryInput | MilkOutflowCreateOrConnectWithoutCategoryInput[]
    upsert?: MilkOutflowUpsertWithWhereUniqueWithoutCategoryInput | MilkOutflowUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: MilkOutflowCreateManyCategoryInputEnvelope
    set?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    disconnect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    delete?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    connect?: MilkOutflowWhereUniqueInput | MilkOutflowWhereUniqueInput[]
    update?: MilkOutflowUpdateWithWhereUniqueWithoutCategoryInput | MilkOutflowUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: MilkOutflowUpdateManyWithWhereWithoutCategoryInput | MilkOutflowUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
  }

  export type MilkCategoryCreateNestedOneWithoutProductionsInput = {
    create?: XOR<MilkCategoryCreateWithoutProductionsInput, MilkCategoryUncheckedCreateWithoutProductionsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutProductionsInput
    connect?: MilkCategoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutProductionsInput = {
    create?: XOR<UserCreateWithoutProductionsInput, UserUncheckedCreateWithoutProductionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProductionsInput
    connect?: UserWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type MilkCategoryUpdateOneWithoutProductionsNestedInput = {
    create?: XOR<MilkCategoryCreateWithoutProductionsInput, MilkCategoryUncheckedCreateWithoutProductionsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutProductionsInput
    upsert?: MilkCategoryUpsertWithoutProductionsInput
    disconnect?: MilkCategoryWhereInput | boolean
    delete?: MilkCategoryWhereInput | boolean
    connect?: MilkCategoryWhereUniqueInput
    update?: XOR<XOR<MilkCategoryUpdateToOneWithWhereWithoutProductionsInput, MilkCategoryUpdateWithoutProductionsInput>, MilkCategoryUncheckedUpdateWithoutProductionsInput>
  }

  export type UserUpdateOneWithoutProductionsNestedInput = {
    create?: XOR<UserCreateWithoutProductionsInput, UserUncheckedCreateWithoutProductionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProductionsInput
    upsert?: UserUpsertWithoutProductionsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProductionsInput, UserUpdateWithoutProductionsInput>, UserUncheckedUpdateWithoutProductionsInput>
  }

  export type UserCreateNestedOneWithoutPackagedProductsInput = {
    create?: XOR<UserCreateWithoutPackagedProductsInput, UserUncheckedCreateWithoutPackagedProductsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPackagedProductsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneWithoutPackagedProductsNestedInput = {
    create?: XOR<UserCreateWithoutPackagedProductsInput, UserUncheckedCreateWithoutPackagedProductsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPackagedProductsInput
    upsert?: UserUpsertWithoutPackagedProductsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPackagedProductsInput, UserUpdateWithoutPackagedProductsInput>, UserUncheckedUpdateWithoutPackagedProductsInput>
  }

  export type MilkCategoryCreateNestedOneWithoutPackagingsInput = {
    create?: XOR<MilkCategoryCreateWithoutPackagingsInput, MilkCategoryUncheckedCreateWithoutPackagingsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutPackagingsInput
    connect?: MilkCategoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutPackagingsInput = {
    create?: XOR<UserCreateWithoutPackagingsInput, UserUncheckedCreateWithoutPackagingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPackagingsInput
    connect?: UserWhereUniqueInput
  }

  export type MilkCategoryUpdateOneWithoutPackagingsNestedInput = {
    create?: XOR<MilkCategoryCreateWithoutPackagingsInput, MilkCategoryUncheckedCreateWithoutPackagingsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutPackagingsInput
    upsert?: MilkCategoryUpsertWithoutPackagingsInput
    disconnect?: MilkCategoryWhereInput | boolean
    delete?: MilkCategoryWhereInput | boolean
    connect?: MilkCategoryWhereUniqueInput
    update?: XOR<XOR<MilkCategoryUpdateToOneWithWhereWithoutPackagingsInput, MilkCategoryUpdateWithoutPackagingsInput>, MilkCategoryUncheckedUpdateWithoutPackagingsInput>
  }

  export type UserUpdateOneWithoutPackagingsNestedInput = {
    create?: XOR<UserCreateWithoutPackagingsInput, UserUncheckedCreateWithoutPackagingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPackagingsInput
    upsert?: UserUpsertWithoutPackagingsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPackagingsInput, UserUpdateWithoutPackagingsInput>, UserUncheckedUpdateWithoutPackagingsInput>
  }

  export type MilkCategoryCreateNestedOneWithoutOutflowsInput = {
    create?: XOR<MilkCategoryCreateWithoutOutflowsInput, MilkCategoryUncheckedCreateWithoutOutflowsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutOutflowsInput
    connect?: MilkCategoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutOutflowsInput = {
    create?: XOR<UserCreateWithoutOutflowsInput, UserUncheckedCreateWithoutOutflowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutflowsInput
    connect?: UserWhereUniqueInput
  }

  export type MilkCategoryUpdateOneRequiredWithoutOutflowsNestedInput = {
    create?: XOR<MilkCategoryCreateWithoutOutflowsInput, MilkCategoryUncheckedCreateWithoutOutflowsInput>
    connectOrCreate?: MilkCategoryCreateOrConnectWithoutOutflowsInput
    upsert?: MilkCategoryUpsertWithoutOutflowsInput
    connect?: MilkCategoryWhereUniqueInput
    update?: XOR<XOR<MilkCategoryUpdateToOneWithWhereWithoutOutflowsInput, MilkCategoryUpdateWithoutOutflowsInput>, MilkCategoryUncheckedUpdateWithoutOutflowsInput>
  }

  export type UserUpdateOneWithoutOutflowsNestedInput = {
    create?: XOR<UserCreateWithoutOutflowsInput, UserUncheckedCreateWithoutOutflowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutflowsInput
    upsert?: UserUpsertWithoutOutflowsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOutflowsInput, UserUpdateWithoutOutflowsInput>, UserUncheckedUpdateWithoutOutflowsInput>
  }

  export type UserCreateNestedOneWithoutSalesInput = {
    create?: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSalesInput
    connect?: UserWhereUniqueInput
  }

  export type PiutangCreateNestedOneWithoutMilkSaleInput = {
    create?: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutMilkSaleInput
    connect?: PiutangWhereUniqueInput
  }

  export type PiutangUncheckedCreateNestedOneWithoutMilkSaleInput = {
    create?: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutMilkSaleInput
    connect?: PiutangWhereUniqueInput
  }

  export type UserUpdateOneWithoutSalesNestedInput = {
    create?: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSalesInput
    upsert?: UserUpsertWithoutSalesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSalesInput, UserUpdateWithoutSalesInput>, UserUncheckedUpdateWithoutSalesInput>
  }

  export type PiutangUpdateOneWithoutMilkSaleNestedInput = {
    create?: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutMilkSaleInput
    upsert?: PiutangUpsertWithoutMilkSaleInput
    disconnect?: PiutangWhereInput | boolean
    delete?: PiutangWhereInput | boolean
    connect?: PiutangWhereUniqueInput
    update?: XOR<XOR<PiutangUpdateToOneWithWhereWithoutMilkSaleInput, PiutangUpdateWithoutMilkSaleInput>, PiutangUncheckedUpdateWithoutMilkSaleInput>
  }

  export type PiutangUncheckedUpdateOneWithoutMilkSaleNestedInput = {
    create?: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutMilkSaleInput
    upsert?: PiutangUpsertWithoutMilkSaleInput
    disconnect?: PiutangWhereInput | boolean
    delete?: PiutangWhereInput | boolean
    connect?: PiutangWhereUniqueInput
    update?: XOR<XOR<PiutangUpdateToOneWithWhereWithoutMilkSaleInput, PiutangUpdateWithoutMilkSaleInput>, PiutangUncheckedUpdateWithoutMilkSaleInput>
  }

  export type MilkSaleCreateNestedOneWithoutPiutangInput = {
    create?: XOR<MilkSaleCreateWithoutPiutangInput, MilkSaleUncheckedCreateWithoutPiutangInput>
    connectOrCreate?: MilkSaleCreateOrConnectWithoutPiutangInput
    connect?: MilkSaleWhereUniqueInput
  }

  export type PelunasanPiutangCreateNestedManyWithoutPiutangInput = {
    create?: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput> | PelunasanPiutangCreateWithoutPiutangInput[] | PelunasanPiutangUncheckedCreateWithoutPiutangInput[]
    connectOrCreate?: PelunasanPiutangCreateOrConnectWithoutPiutangInput | PelunasanPiutangCreateOrConnectWithoutPiutangInput[]
    createMany?: PelunasanPiutangCreateManyPiutangInputEnvelope
    connect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
  }

  export type PelunasanPiutangUncheckedCreateNestedManyWithoutPiutangInput = {
    create?: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput> | PelunasanPiutangCreateWithoutPiutangInput[] | PelunasanPiutangUncheckedCreateWithoutPiutangInput[]
    connectOrCreate?: PelunasanPiutangCreateOrConnectWithoutPiutangInput | PelunasanPiutangCreateOrConnectWithoutPiutangInput[]
    createMany?: PelunasanPiutangCreateManyPiutangInputEnvelope
    connect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
  }

  export type MilkSaleUpdateOneRequiredWithoutPiutangNestedInput = {
    create?: XOR<MilkSaleCreateWithoutPiutangInput, MilkSaleUncheckedCreateWithoutPiutangInput>
    connectOrCreate?: MilkSaleCreateOrConnectWithoutPiutangInput
    upsert?: MilkSaleUpsertWithoutPiutangInput
    connect?: MilkSaleWhereUniqueInput
    update?: XOR<XOR<MilkSaleUpdateToOneWithWhereWithoutPiutangInput, MilkSaleUpdateWithoutPiutangInput>, MilkSaleUncheckedUpdateWithoutPiutangInput>
  }

  export type PelunasanPiutangUpdateManyWithoutPiutangNestedInput = {
    create?: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput> | PelunasanPiutangCreateWithoutPiutangInput[] | PelunasanPiutangUncheckedCreateWithoutPiutangInput[]
    connectOrCreate?: PelunasanPiutangCreateOrConnectWithoutPiutangInput | PelunasanPiutangCreateOrConnectWithoutPiutangInput[]
    upsert?: PelunasanPiutangUpsertWithWhereUniqueWithoutPiutangInput | PelunasanPiutangUpsertWithWhereUniqueWithoutPiutangInput[]
    createMany?: PelunasanPiutangCreateManyPiutangInputEnvelope
    set?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    disconnect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    delete?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    connect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    update?: PelunasanPiutangUpdateWithWhereUniqueWithoutPiutangInput | PelunasanPiutangUpdateWithWhereUniqueWithoutPiutangInput[]
    updateMany?: PelunasanPiutangUpdateManyWithWhereWithoutPiutangInput | PelunasanPiutangUpdateManyWithWhereWithoutPiutangInput[]
    deleteMany?: PelunasanPiutangScalarWhereInput | PelunasanPiutangScalarWhereInput[]
  }

  export type PelunasanPiutangUncheckedUpdateManyWithoutPiutangNestedInput = {
    create?: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput> | PelunasanPiutangCreateWithoutPiutangInput[] | PelunasanPiutangUncheckedCreateWithoutPiutangInput[]
    connectOrCreate?: PelunasanPiutangCreateOrConnectWithoutPiutangInput | PelunasanPiutangCreateOrConnectWithoutPiutangInput[]
    upsert?: PelunasanPiutangUpsertWithWhereUniqueWithoutPiutangInput | PelunasanPiutangUpsertWithWhereUniqueWithoutPiutangInput[]
    createMany?: PelunasanPiutangCreateManyPiutangInputEnvelope
    set?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    disconnect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    delete?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    connect?: PelunasanPiutangWhereUniqueInput | PelunasanPiutangWhereUniqueInput[]
    update?: PelunasanPiutangUpdateWithWhereUniqueWithoutPiutangInput | PelunasanPiutangUpdateWithWhereUniqueWithoutPiutangInput[]
    updateMany?: PelunasanPiutangUpdateManyWithWhereWithoutPiutangInput | PelunasanPiutangUpdateManyWithWhereWithoutPiutangInput[]
    deleteMany?: PelunasanPiutangScalarWhereInput | PelunasanPiutangScalarWhereInput[]
  }

  export type PiutangCreateNestedOneWithoutPelunasanInput = {
    create?: XOR<PiutangCreateWithoutPelunasanInput, PiutangUncheckedCreateWithoutPelunasanInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutPelunasanInput
    connect?: PiutangWhereUniqueInput
  }

  export type PiutangUpdateOneRequiredWithoutPelunasanNestedInput = {
    create?: XOR<PiutangCreateWithoutPelunasanInput, PiutangUncheckedCreateWithoutPelunasanInput>
    connectOrCreate?: PiutangCreateOrConnectWithoutPelunasanInput
    upsert?: PiutangUpsertWithoutPelunasanInput
    connect?: PiutangWhereUniqueInput
    update?: XOR<XOR<PiutangUpdateToOneWithWhereWithoutPelunasanInput, PiutangUpdateWithoutPelunasanInput>, PiutangUncheckedUpdateWithoutPelunasanInput>
  }

  export type UserCreateNestedOneWithoutBastDocumentsInput = {
    create?: XOR<UserCreateWithoutBastDocumentsInput, UserUncheckedCreateWithoutBastDocumentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBastDocumentsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutBastDocumentsNestedInput = {
    create?: XOR<UserCreateWithoutBastDocumentsInput, UserUncheckedCreateWithoutBastDocumentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBastDocumentsInput
    upsert?: UserUpsertWithoutBastDocumentsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBastDocumentsInput, UserUpdateWithoutBastDocumentsInput>, UserUncheckedUpdateWithoutBastDocumentsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type SystemLogCreateWithoutUserInput = {
    id?: string
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
  }

  export type SystemLogUncheckedCreateWithoutUserInput = {
    id?: string
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
  }

  export type SystemLogCreateOrConnectWithoutUserInput = {
    where: SystemLogWhereUniqueInput
    create: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput>
  }

  export type SystemLogCreateManyUserInputEnvelope = {
    data: SystemLogCreateManyUserInput | SystemLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MilkProductionCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: MilkCategoryCreateNestedOneWithoutProductionsInput
  }

  export type MilkProductionUncheckedCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    categoryId?: string | null
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkProductionCreateOrConnectWithoutCreatedByInput = {
    where: MilkProductionWhereUniqueInput
    create: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkProductionCreateManyCreatedByInputEnvelope = {
    data: MilkProductionCreateManyCreatedByInput | MilkProductionCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type MilkPackagingCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: MilkCategoryCreateNestedOneWithoutPackagingsInput
  }

  export type MilkPackagingUncheckedCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    categoryId?: string | null
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingCreateOrConnectWithoutCreatedByInput = {
    where: MilkPackagingWhereUniqueInput
    create: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkPackagingCreateManyCreatedByInputEnvelope = {
    data: MilkPackagingCreateManyCreatedByInput | MilkPackagingCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type MilkOutflowCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: MilkCategoryCreateNestedOneWithoutOutflowsInput
  }

  export type MilkOutflowUncheckedCreateWithoutCreatedByInput = {
    id?: string
    date?: Date | string
    categoryId: string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowCreateOrConnectWithoutCreatedByInput = {
    where: MilkOutflowWhereUniqueInput
    create: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkOutflowCreateManyCreatedByInputEnvelope = {
    data: MilkOutflowCreateManyCreatedByInput | MilkOutflowCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type MilkSaleCreateWithoutCreatedByInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    piutang?: PiutangCreateNestedOneWithoutMilkSaleInput
  }

  export type MilkSaleUncheckedCreateWithoutCreatedByInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    piutang?: PiutangUncheckedCreateNestedOneWithoutMilkSaleInput
  }

  export type MilkSaleCreateOrConnectWithoutCreatedByInput = {
    where: MilkSaleWhereUniqueInput
    create: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkSaleCreateManyCreatedByInputEnvelope = {
    data: MilkSaleCreateManyCreatedByInput | MilkSaleCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type BastDocumentCreateWithoutCreatedByInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BastDocumentUncheckedCreateWithoutCreatedByInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BastDocumentCreateOrConnectWithoutCreatedByInput = {
    where: BastDocumentWhereUniqueInput
    create: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput>
  }

  export type BastDocumentCreateManyCreatedByInputEnvelope = {
    data: BastDocumentCreateManyCreatedByInput | BastDocumentCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type PackagedProductCreateWithoutCreatedByInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackagedProductUncheckedCreateWithoutCreatedByInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackagedProductCreateOrConnectWithoutCreatedByInput = {
    where: PackagedProductWhereUniqueInput
    create: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput>
  }

  export type PackagedProductCreateManyCreatedByInputEnvelope = {
    data: PackagedProductCreateManyCreatedByInput | PackagedProductCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type SystemLogUpsertWithWhereUniqueWithoutUserInput = {
    where: SystemLogWhereUniqueInput
    update: XOR<SystemLogUpdateWithoutUserInput, SystemLogUncheckedUpdateWithoutUserInput>
    create: XOR<SystemLogCreateWithoutUserInput, SystemLogUncheckedCreateWithoutUserInput>
  }

  export type SystemLogUpdateWithWhereUniqueWithoutUserInput = {
    where: SystemLogWhereUniqueInput
    data: XOR<SystemLogUpdateWithoutUserInput, SystemLogUncheckedUpdateWithoutUserInput>
  }

  export type SystemLogUpdateManyWithWhereWithoutUserInput = {
    where: SystemLogScalarWhereInput
    data: XOR<SystemLogUpdateManyMutationInput, SystemLogUncheckedUpdateManyWithoutUserInput>
  }

  export type SystemLogScalarWhereInput = {
    AND?: SystemLogScalarWhereInput | SystemLogScalarWhereInput[]
    OR?: SystemLogScalarWhereInput[]
    NOT?: SystemLogScalarWhereInput | SystemLogScalarWhereInput[]
    id?: StringFilter<"SystemLog"> | string
    userId?: StringNullableFilter<"SystemLog"> | string | null
    userEmail?: StringFilter<"SystemLog"> | string
    action?: StringFilter<"SystemLog"> | string
    level?: StringFilter<"SystemLog"> | string
    details?: StringNullableFilter<"SystemLog"> | string | null
    createdAt?: DateTimeFilter<"SystemLog"> | Date | string
  }

  export type MilkProductionUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: MilkProductionWhereUniqueInput
    update: XOR<MilkProductionUpdateWithoutCreatedByInput, MilkProductionUncheckedUpdateWithoutCreatedByInput>
    create: XOR<MilkProductionCreateWithoutCreatedByInput, MilkProductionUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkProductionUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: MilkProductionWhereUniqueInput
    data: XOR<MilkProductionUpdateWithoutCreatedByInput, MilkProductionUncheckedUpdateWithoutCreatedByInput>
  }

  export type MilkProductionUpdateManyWithWhereWithoutCreatedByInput = {
    where: MilkProductionScalarWhereInput
    data: XOR<MilkProductionUpdateManyMutationInput, MilkProductionUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type MilkProductionScalarWhereInput = {
    AND?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
    OR?: MilkProductionScalarWhereInput[]
    NOT?: MilkProductionScalarWhereInput | MilkProductionScalarWhereInput[]
    id?: StringFilter<"MilkProduction"> | string
    date?: DateTimeFilter<"MilkProduction"> | Date | string
    tanggal?: DateTimeFilter<"MilkProduction"> | Date | string
    categoryId?: StringNullableFilter<"MilkProduction"> | string | null
    productType?: StringFilter<"MilkProduction"> | string
    animalType?: StringFilter<"MilkProduction"> | string
    packagingType?: StringFilter<"MilkProduction"> | string
    grossVolumeLiters?: FloatFilter<"MilkProduction"> | number
    produksi?: FloatFilter<"MilkProduction"> | number
    pedetVolumeLiters?: FloatFilter<"MilkProduction"> | number
    setorPedet?: FloatFilter<"MilkProduction"> | number
    afkirVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rusakAfkir?: FloatFilter<"MilkProduction"> | number
    usageType?: StringNullableFilter<"MilkProduction"> | string | null
    usageVolumeLiters?: FloatFilter<"MilkProduction"> | number
    rawVolumeLiters?: FloatFilter<"MilkProduction"> | number
    kirimKePI?: FloatFilter<"MilkProduction"> | number
    processedLiters?: FloatFilter<"MilkProduction"> | number
    packagedQty?: IntFilter<"MilkProduction"> | number
    status?: StringFilter<"MilkProduction"> | string
    notes?: StringNullableFilter<"MilkProduction"> | string | null
    createdById?: StringNullableFilter<"MilkProduction"> | string | null
    createdAt?: DateTimeFilter<"MilkProduction"> | Date | string
    updatedAt?: DateTimeFilter<"MilkProduction"> | Date | string
  }

  export type MilkPackagingUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: MilkPackagingWhereUniqueInput
    update: XOR<MilkPackagingUpdateWithoutCreatedByInput, MilkPackagingUncheckedUpdateWithoutCreatedByInput>
    create: XOR<MilkPackagingCreateWithoutCreatedByInput, MilkPackagingUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkPackagingUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: MilkPackagingWhereUniqueInput
    data: XOR<MilkPackagingUpdateWithoutCreatedByInput, MilkPackagingUncheckedUpdateWithoutCreatedByInput>
  }

  export type MilkPackagingUpdateManyWithWhereWithoutCreatedByInput = {
    where: MilkPackagingScalarWhereInput
    data: XOR<MilkPackagingUpdateManyMutationInput, MilkPackagingUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type MilkPackagingScalarWhereInput = {
    AND?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
    OR?: MilkPackagingScalarWhereInput[]
    NOT?: MilkPackagingScalarWhereInput | MilkPackagingScalarWhereInput[]
    id?: StringFilter<"MilkPackaging"> | string
    date?: DateTimeFilter<"MilkPackaging"> | Date | string
    productCategory?: StringFilter<"MilkPackaging"> | string
    productSubtype?: StringNullableFilter<"MilkPackaging"> | string | null
    origin?: StringFilter<"MilkPackaging"> | string
    variant?: StringNullableFilter<"MilkPackaging"> | string | null
    animalType?: StringFilter<"MilkPackaging"> | string
    categoryId?: StringNullableFilter<"MilkPackaging"> | string | null
    processedAmount?: FloatFilter<"MilkPackaging"> | number
    processedUnit?: StringFilter<"MilkPackaging"> | string
    processedLiters?: FloatFilter<"MilkPackaging"> | number
    packagingDetails?: StringNullableFilter<"MilkPackaging"> | string | null
    packagingType?: StringNullableFilter<"MilkPackaging"> | string | null
    packageSize?: StringNullableFilter<"MilkPackaging"> | string | null
    botolQty?: IntFilter<"MilkPackaging"> | number
    cupQty?: IntFilter<"MilkPackaging"> | number
    plastikBantalQty?: IntFilter<"MilkPackaging"> | number
    totalPackagedQty?: IntFilter<"MilkPackaging"> | number
    status?: StringFilter<"MilkPackaging"> | string
    sentAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    sentById?: StringNullableFilter<"MilkPackaging"> | string | null
    sentByName?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedAt?: DateTimeNullableFilter<"MilkPackaging"> | Date | string | null
    receivedById?: StringNullableFilter<"MilkPackaging"> | string | null
    receivedByName?: StringNullableFilter<"MilkPackaging"> | string | null
    quantitySent?: IntFilter<"MilkPackaging"> | number
    quantityReceived?: IntFilter<"MilkPackaging"> | number
    condition?: StringNullableFilter<"MilkPackaging"> | string | null
    receptionNotes?: StringNullableFilter<"MilkPackaging"> | string | null
    notes?: StringNullableFilter<"MilkPackaging"> | string | null
    createdById?: StringNullableFilter<"MilkPackaging"> | string | null
    createdAt?: DateTimeFilter<"MilkPackaging"> | Date | string
    updatedAt?: DateTimeFilter<"MilkPackaging"> | Date | string
  }

  export type MilkOutflowUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: MilkOutflowWhereUniqueInput
    update: XOR<MilkOutflowUpdateWithoutCreatedByInput, MilkOutflowUncheckedUpdateWithoutCreatedByInput>
    create: XOR<MilkOutflowCreateWithoutCreatedByInput, MilkOutflowUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkOutflowUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: MilkOutflowWhereUniqueInput
    data: XOR<MilkOutflowUpdateWithoutCreatedByInput, MilkOutflowUncheckedUpdateWithoutCreatedByInput>
  }

  export type MilkOutflowUpdateManyWithWhereWithoutCreatedByInput = {
    where: MilkOutflowScalarWhereInput
    data: XOR<MilkOutflowUpdateManyMutationInput, MilkOutflowUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type MilkOutflowScalarWhereInput = {
    AND?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
    OR?: MilkOutflowScalarWhereInput[]
    NOT?: MilkOutflowScalarWhereInput | MilkOutflowScalarWhereInput[]
    id?: StringFilter<"MilkOutflow"> | string
    date?: DateTimeFilter<"MilkOutflow"> | Date | string
    categoryId?: StringFilter<"MilkOutflow"> | string
    productType?: StringFilter<"MilkOutflow"> | string
    animalType?: StringFilter<"MilkOutflow"> | string
    packagingType?: StringFilter<"MilkOutflow"> | string
    quantity?: IntFilter<"MilkOutflow"> | number
    notes?: StringNullableFilter<"MilkOutflow"> | string | null
    createdById?: StringNullableFilter<"MilkOutflow"> | string | null
    createdAt?: DateTimeFilter<"MilkOutflow"> | Date | string
    updatedAt?: DateTimeFilter<"MilkOutflow"> | Date | string
  }

  export type MilkSaleUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: MilkSaleWhereUniqueInput
    update: XOR<MilkSaleUpdateWithoutCreatedByInput, MilkSaleUncheckedUpdateWithoutCreatedByInput>
    create: XOR<MilkSaleCreateWithoutCreatedByInput, MilkSaleUncheckedCreateWithoutCreatedByInput>
  }

  export type MilkSaleUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: MilkSaleWhereUniqueInput
    data: XOR<MilkSaleUpdateWithoutCreatedByInput, MilkSaleUncheckedUpdateWithoutCreatedByInput>
  }

  export type MilkSaleUpdateManyWithWhereWithoutCreatedByInput = {
    where: MilkSaleScalarWhereInput
    data: XOR<MilkSaleUpdateManyMutationInput, MilkSaleUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type MilkSaleScalarWhereInput = {
    AND?: MilkSaleScalarWhereInput | MilkSaleScalarWhereInput[]
    OR?: MilkSaleScalarWhereInput[]
    NOT?: MilkSaleScalarWhereInput | MilkSaleScalarWhereInput[]
    id?: StringFilter<"MilkSale"> | string
    transactionId?: StringNullableFilter<"MilkSale"> | string | null
    date?: DateTimeFilter<"MilkSale"> | Date | string
    tanggal?: DateTimeFilter<"MilkSale"> | Date | string
    sumber?: StringFilter<"MilkSale"> | string
    produkRefId?: StringNullableFilter<"MilkSale"> | string | null
    jumlah?: FloatFilter<"MilkSale"> | number
    pembeli?: StringFilter<"MilkSale"> | string
    hargaJual?: FloatFilter<"MilkSale"> | number
    kategoriBayar?: StringFilter<"MilkSale"> | string
    catatan?: StringNullableFilter<"MilkSale"> | string | null
    productCategory?: StringFilter<"MilkSale"> | string
    productSubtype?: StringNullableFilter<"MilkSale"> | string | null
    variant?: StringNullableFilter<"MilkSale"> | string | null
    packagingType?: StringFilter<"MilkSale"> | string
    quantity?: IntFilter<"MilkSale"> | number
    unitPrice?: FloatFilter<"MilkSale"> | number
    totalPrice?: FloatFilter<"MilkSale"> | number
    status?: StringFilter<"MilkSale"> | string
    notes?: StringNullableFilter<"MilkSale"> | string | null
    createdById?: StringNullableFilter<"MilkSale"> | string | null
    createdAt?: DateTimeFilter<"MilkSale"> | Date | string
    updatedAt?: DateTimeFilter<"MilkSale"> | Date | string
  }

  export type BastDocumentUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: BastDocumentWhereUniqueInput
    update: XOR<BastDocumentUpdateWithoutCreatedByInput, BastDocumentUncheckedUpdateWithoutCreatedByInput>
    create: XOR<BastDocumentCreateWithoutCreatedByInput, BastDocumentUncheckedCreateWithoutCreatedByInput>
  }

  export type BastDocumentUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: BastDocumentWhereUniqueInput
    data: XOR<BastDocumentUpdateWithoutCreatedByInput, BastDocumentUncheckedUpdateWithoutCreatedByInput>
  }

  export type BastDocumentUpdateManyWithWhereWithoutCreatedByInput = {
    where: BastDocumentScalarWhereInput
    data: XOR<BastDocumentUpdateManyMutationInput, BastDocumentUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type BastDocumentScalarWhereInput = {
    AND?: BastDocumentScalarWhereInput | BastDocumentScalarWhereInput[]
    OR?: BastDocumentScalarWhereInput[]
    NOT?: BastDocumentScalarWhereInput | BastDocumentScalarWhereInput[]
    id?: StringFilter<"BastDocument"> | string
    nomorBast?: StringFilter<"BastDocument"> | string
    tanggal?: DateTimeFilter<"BastDocument"> | Date | string
    sumber?: StringFilter<"BastDocument"> | string
    volumeLiters?: FloatFilter<"BastDocument"> | number
    jenisPermintaan?: StringFilter<"BastDocument"> | string
    instansiPenerima?: StringNullableFilter<"BastDocument"> | string | null
    pengirimNama?: StringFilter<"BastDocument"> | string
    pengirimRole?: StringFilter<"BastDocument"> | string
    penerimaNama?: StringNullableFilter<"BastDocument"> | string | null
    penerimaRole?: StringNullableFilter<"BastDocument"> | string | null
    status?: StringFilter<"BastDocument"> | string
    catatan?: StringNullableFilter<"BastDocument"> | string | null
    confirmedAt?: DateTimeNullableFilter<"BastDocument"> | Date | string | null
    productionId?: StringNullableFilter<"BastDocument"> | string | null
    createdById?: StringNullableFilter<"BastDocument"> | string | null
    createdAt?: DateTimeFilter<"BastDocument"> | Date | string
    updatedAt?: DateTimeFilter<"BastDocument"> | Date | string
  }

  export type PackagedProductUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: PackagedProductWhereUniqueInput
    update: XOR<PackagedProductUpdateWithoutCreatedByInput, PackagedProductUncheckedUpdateWithoutCreatedByInput>
    create: XOR<PackagedProductCreateWithoutCreatedByInput, PackagedProductUncheckedCreateWithoutCreatedByInput>
  }

  export type PackagedProductUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: PackagedProductWhereUniqueInput
    data: XOR<PackagedProductUpdateWithoutCreatedByInput, PackagedProductUncheckedUpdateWithoutCreatedByInput>
  }

  export type PackagedProductUpdateManyWithWhereWithoutCreatedByInput = {
    where: PackagedProductScalarWhereInput
    data: XOR<PackagedProductUpdateManyMutationInput, PackagedProductUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type PackagedProductScalarWhereInput = {
    AND?: PackagedProductScalarWhereInput | PackagedProductScalarWhereInput[]
    OR?: PackagedProductScalarWhereInput[]
    NOT?: PackagedProductScalarWhereInput | PackagedProductScalarWhereInput[]
    id?: StringFilter<"PackagedProduct"> | string
    tanggal?: DateTimeFilter<"PackagedProduct"> | Date | string
    jenisProduk?: StringFilter<"PackagedProduct"> | string
    kemasan?: StringFilter<"PackagedProduct"> | string
    jumlah?: FloatFilter<"PackagedProduct"> | number
    status?: StringFilter<"PackagedProduct"> | string
    receivedAt?: DateTimeNullableFilter<"PackagedProduct"> | Date | string | null
    receivedByName?: StringNullableFilter<"PackagedProduct"> | string | null
    condition?: StringNullableFilter<"PackagedProduct"> | string | null
    notes?: StringNullableFilter<"PackagedProduct"> | string | null
    createdById?: StringNullableFilter<"PackagedProduct"> | string | null
    createdAt?: DateTimeFilter<"PackagedProduct"> | Date | string
    updatedAt?: DateTimeFilter<"PackagedProduct"> | Date | string
  }

  export type UserCreateWithoutLogsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutLogsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
  }

  export type UserUpsertWithoutLogsInput = {
    update: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
  }

  export type UserUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type MilkProductionCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutProductionsInput
  }

  export type MilkProductionUncheckedCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkProductionCreateOrConnectWithoutCategoryInput = {
    where: MilkProductionWhereUniqueInput
    create: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput>
  }

  export type MilkProductionCreateManyCategoryInputEnvelope = {
    data: MilkProductionCreateManyCategoryInput | MilkProductionCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type MilkPackagingCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutPackagingsInput
  }

  export type MilkPackagingUncheckedCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingCreateOrConnectWithoutCategoryInput = {
    where: MilkPackagingWhereUniqueInput
    create: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput>
  }

  export type MilkPackagingCreateManyCategoryInputEnvelope = {
    data: MilkPackagingCreateManyCategoryInput | MilkPackagingCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type MilkOutflowCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutOutflowsInput
  }

  export type MilkOutflowUncheckedCreateWithoutCategoryInput = {
    id?: string
    date?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowCreateOrConnectWithoutCategoryInput = {
    where: MilkOutflowWhereUniqueInput
    create: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput>
  }

  export type MilkOutflowCreateManyCategoryInputEnvelope = {
    data: MilkOutflowCreateManyCategoryInput | MilkOutflowCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type MilkProductionUpsertWithWhereUniqueWithoutCategoryInput = {
    where: MilkProductionWhereUniqueInput
    update: XOR<MilkProductionUpdateWithoutCategoryInput, MilkProductionUncheckedUpdateWithoutCategoryInput>
    create: XOR<MilkProductionCreateWithoutCategoryInput, MilkProductionUncheckedCreateWithoutCategoryInput>
  }

  export type MilkProductionUpdateWithWhereUniqueWithoutCategoryInput = {
    where: MilkProductionWhereUniqueInput
    data: XOR<MilkProductionUpdateWithoutCategoryInput, MilkProductionUncheckedUpdateWithoutCategoryInput>
  }

  export type MilkProductionUpdateManyWithWhereWithoutCategoryInput = {
    where: MilkProductionScalarWhereInput
    data: XOR<MilkProductionUpdateManyMutationInput, MilkProductionUncheckedUpdateManyWithoutCategoryInput>
  }

  export type MilkPackagingUpsertWithWhereUniqueWithoutCategoryInput = {
    where: MilkPackagingWhereUniqueInput
    update: XOR<MilkPackagingUpdateWithoutCategoryInput, MilkPackagingUncheckedUpdateWithoutCategoryInput>
    create: XOR<MilkPackagingCreateWithoutCategoryInput, MilkPackagingUncheckedCreateWithoutCategoryInput>
  }

  export type MilkPackagingUpdateWithWhereUniqueWithoutCategoryInput = {
    where: MilkPackagingWhereUniqueInput
    data: XOR<MilkPackagingUpdateWithoutCategoryInput, MilkPackagingUncheckedUpdateWithoutCategoryInput>
  }

  export type MilkPackagingUpdateManyWithWhereWithoutCategoryInput = {
    where: MilkPackagingScalarWhereInput
    data: XOR<MilkPackagingUpdateManyMutationInput, MilkPackagingUncheckedUpdateManyWithoutCategoryInput>
  }

  export type MilkOutflowUpsertWithWhereUniqueWithoutCategoryInput = {
    where: MilkOutflowWhereUniqueInput
    update: XOR<MilkOutflowUpdateWithoutCategoryInput, MilkOutflowUncheckedUpdateWithoutCategoryInput>
    create: XOR<MilkOutflowCreateWithoutCategoryInput, MilkOutflowUncheckedCreateWithoutCategoryInput>
  }

  export type MilkOutflowUpdateWithWhereUniqueWithoutCategoryInput = {
    where: MilkOutflowWhereUniqueInput
    data: XOR<MilkOutflowUpdateWithoutCategoryInput, MilkOutflowUncheckedUpdateWithoutCategoryInput>
  }

  export type MilkOutflowUpdateManyWithWhereWithoutCategoryInput = {
    where: MilkOutflowScalarWhereInput
    data: XOR<MilkOutflowUpdateManyMutationInput, MilkOutflowUncheckedUpdateManyWithoutCategoryInput>
  }

  export type MilkCategoryCreateWithoutProductionsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packagings?: MilkPackagingCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryUncheckedCreateWithoutProductionsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryCreateOrConnectWithoutProductionsInput = {
    where: MilkCategoryWhereUniqueInput
    create: XOR<MilkCategoryCreateWithoutProductionsInput, MilkCategoryUncheckedCreateWithoutProductionsInput>
  }

  export type UserCreateWithoutProductionsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutProductionsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutProductionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProductionsInput, UserUncheckedCreateWithoutProductionsInput>
  }

  export type MilkCategoryUpsertWithoutProductionsInput = {
    update: XOR<MilkCategoryUpdateWithoutProductionsInput, MilkCategoryUncheckedUpdateWithoutProductionsInput>
    create: XOR<MilkCategoryCreateWithoutProductionsInput, MilkCategoryUncheckedCreateWithoutProductionsInput>
    where?: MilkCategoryWhereInput
  }

  export type MilkCategoryUpdateToOneWithWhereWithoutProductionsInput = {
    where?: MilkCategoryWhereInput
    data: XOR<MilkCategoryUpdateWithoutProductionsInput, MilkCategoryUncheckedUpdateWithoutProductionsInput>
  }

  export type MilkCategoryUpdateWithoutProductionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packagings?: MilkPackagingUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCategoryNestedInput
  }

  export type MilkCategoryUncheckedUpdateWithoutProductionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type UserUpsertWithoutProductionsInput = {
    update: XOR<UserUpdateWithoutProductionsInput, UserUncheckedUpdateWithoutProductionsInput>
    create: XOR<UserCreateWithoutProductionsInput, UserUncheckedCreateWithoutProductionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProductionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProductionsInput, UserUncheckedUpdateWithoutProductionsInput>
  }

  export type UserUpdateWithoutProductionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutProductionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type UserCreateWithoutPackagedProductsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutPackagedProductsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutPackagedProductsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPackagedProductsInput, UserUncheckedCreateWithoutPackagedProductsInput>
  }

  export type UserUpsertWithoutPackagedProductsInput = {
    update: XOR<UserUpdateWithoutPackagedProductsInput, UserUncheckedUpdateWithoutPackagedProductsInput>
    create: XOR<UserCreateWithoutPackagedProductsInput, UserUncheckedCreateWithoutPackagedProductsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPackagedProductsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPackagedProductsInput, UserUncheckedUpdateWithoutPackagedProductsInput>
  }

  export type UserUpdateWithoutPackagedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutPackagedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type MilkCategoryCreateWithoutPackagingsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryUncheckedCreateWithoutPackagingsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCategoryInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryCreateOrConnectWithoutPackagingsInput = {
    where: MilkCategoryWhereUniqueInput
    create: XOR<MilkCategoryCreateWithoutPackagingsInput, MilkCategoryUncheckedCreateWithoutPackagingsInput>
  }

  export type UserCreateWithoutPackagingsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutPackagingsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutPackagingsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPackagingsInput, UserUncheckedCreateWithoutPackagingsInput>
  }

  export type MilkCategoryUpsertWithoutPackagingsInput = {
    update: XOR<MilkCategoryUpdateWithoutPackagingsInput, MilkCategoryUncheckedUpdateWithoutPackagingsInput>
    create: XOR<MilkCategoryCreateWithoutPackagingsInput, MilkCategoryUncheckedCreateWithoutPackagingsInput>
    where?: MilkCategoryWhereInput
  }

  export type MilkCategoryUpdateToOneWithWhereWithoutPackagingsInput = {
    where?: MilkCategoryWhereInput
    data: XOR<MilkCategoryUpdateWithoutPackagingsInput, MilkCategoryUncheckedUpdateWithoutPackagingsInput>
  }

  export type MilkCategoryUpdateWithoutPackagingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCategoryNestedInput
  }

  export type MilkCategoryUncheckedUpdateWithoutPackagingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUncheckedUpdateManyWithoutCategoryNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type UserUpsertWithoutPackagingsInput = {
    update: XOR<UserUpdateWithoutPackagingsInput, UserUncheckedUpdateWithoutPackagingsInput>
    create: XOR<UserCreateWithoutPackagingsInput, UserUncheckedCreateWithoutPackagingsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPackagingsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPackagingsInput, UserUncheckedUpdateWithoutPackagingsInput>
  }

  export type UserUpdateWithoutPackagingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutPackagingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type MilkCategoryCreateWithoutOutflowsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionCreateNestedManyWithoutCategoryInput
    packagings?: MilkPackagingCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryUncheckedCreateWithoutOutflowsInput = {
    id?: string
    name: string
    code: string
    productType?: string
    animalType?: string
    defaultPackaging?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCategoryInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type MilkCategoryCreateOrConnectWithoutOutflowsInput = {
    where: MilkCategoryWhereUniqueInput
    create: XOR<MilkCategoryCreateWithoutOutflowsInput, MilkCategoryUncheckedCreateWithoutOutflowsInput>
  }

  export type UserCreateWithoutOutflowsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutOutflowsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutOutflowsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOutflowsInput, UserUncheckedCreateWithoutOutflowsInput>
  }

  export type MilkCategoryUpsertWithoutOutflowsInput = {
    update: XOR<MilkCategoryUpdateWithoutOutflowsInput, MilkCategoryUncheckedUpdateWithoutOutflowsInput>
    create: XOR<MilkCategoryCreateWithoutOutflowsInput, MilkCategoryUncheckedCreateWithoutOutflowsInput>
    where?: MilkCategoryWhereInput
  }

  export type MilkCategoryUpdateToOneWithWhereWithoutOutflowsInput = {
    where?: MilkCategoryWhereInput
    data: XOR<MilkCategoryUpdateWithoutOutflowsInput, MilkCategoryUncheckedUpdateWithoutOutflowsInput>
  }

  export type MilkCategoryUpdateWithoutOutflowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUpdateManyWithoutCategoryNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCategoryNestedInput
  }

  export type MilkCategoryUncheckedUpdateWithoutOutflowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    defaultPackaging?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productions?: MilkProductionUncheckedUpdateManyWithoutCategoryNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type UserUpsertWithoutOutflowsInput = {
    update: XOR<UserUpdateWithoutOutflowsInput, UserUncheckedUpdateWithoutOutflowsInput>
    create: XOR<UserCreateWithoutOutflowsInput, UserUncheckedCreateWithoutOutflowsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOutflowsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOutflowsInput, UserUncheckedUpdateWithoutOutflowsInput>
  }

  export type UserUpdateWithoutOutflowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutOutflowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type UserCreateWithoutSalesInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutSalesInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    bastDocuments?: BastDocumentUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutSalesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
  }

  export type PiutangCreateWithoutMilkSaleInput = {
    id?: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
    pelunasan?: PelunasanPiutangCreateNestedManyWithoutPiutangInput
  }

  export type PiutangUncheckedCreateWithoutMilkSaleInput = {
    id?: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
    pelunasan?: PelunasanPiutangUncheckedCreateNestedManyWithoutPiutangInput
  }

  export type PiutangCreateOrConnectWithoutMilkSaleInput = {
    where: PiutangWhereUniqueInput
    create: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
  }

  export type UserUpsertWithoutSalesInput = {
    update: XOR<UserUpdateWithoutSalesInput, UserUncheckedUpdateWithoutSalesInput>
    create: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSalesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSalesInput, UserUncheckedUpdateWithoutSalesInput>
  }

  export type UserUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    bastDocuments?: BastDocumentUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type PiutangUpsertWithoutMilkSaleInput = {
    update: XOR<PiutangUpdateWithoutMilkSaleInput, PiutangUncheckedUpdateWithoutMilkSaleInput>
    create: XOR<PiutangCreateWithoutMilkSaleInput, PiutangUncheckedCreateWithoutMilkSaleInput>
    where?: PiutangWhereInput
  }

  export type PiutangUpdateToOneWithWhereWithoutMilkSaleInput = {
    where?: PiutangWhereInput
    data: XOR<PiutangUpdateWithoutMilkSaleInput, PiutangUncheckedUpdateWithoutMilkSaleInput>
  }

  export type PiutangUpdateWithoutMilkSaleInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pelunasan?: PelunasanPiutangUpdateManyWithoutPiutangNestedInput
  }

  export type PiutangUncheckedUpdateWithoutMilkSaleInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pelunasan?: PelunasanPiutangUncheckedUpdateManyWithoutPiutangNestedInput
  }

  export type MilkSaleCreateWithoutPiutangInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: UserCreateNestedOneWithoutSalesInput
  }

  export type MilkSaleUncheckedCreateWithoutPiutangInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkSaleCreateOrConnectWithoutPiutangInput = {
    where: MilkSaleWhereUniqueInput
    create: XOR<MilkSaleCreateWithoutPiutangInput, MilkSaleUncheckedCreateWithoutPiutangInput>
  }

  export type PelunasanPiutangCreateWithoutPiutangInput = {
    id?: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
  }

  export type PelunasanPiutangUncheckedCreateWithoutPiutangInput = {
    id?: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
  }

  export type PelunasanPiutangCreateOrConnectWithoutPiutangInput = {
    where: PelunasanPiutangWhereUniqueInput
    create: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput>
  }

  export type PelunasanPiutangCreateManyPiutangInputEnvelope = {
    data: PelunasanPiutangCreateManyPiutangInput | PelunasanPiutangCreateManyPiutangInput[]
    skipDuplicates?: boolean
  }

  export type MilkSaleUpsertWithoutPiutangInput = {
    update: XOR<MilkSaleUpdateWithoutPiutangInput, MilkSaleUncheckedUpdateWithoutPiutangInput>
    create: XOR<MilkSaleCreateWithoutPiutangInput, MilkSaleUncheckedCreateWithoutPiutangInput>
    where?: MilkSaleWhereInput
  }

  export type MilkSaleUpdateToOneWithWhereWithoutPiutangInput = {
    where?: MilkSaleWhereInput
    data: XOR<MilkSaleUpdateWithoutPiutangInput, MilkSaleUncheckedUpdateWithoutPiutangInput>
  }

  export type MilkSaleUpdateWithoutPiutangInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutSalesNestedInput
  }

  export type MilkSaleUncheckedUpdateWithoutPiutangInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PelunasanPiutangUpsertWithWhereUniqueWithoutPiutangInput = {
    where: PelunasanPiutangWhereUniqueInput
    update: XOR<PelunasanPiutangUpdateWithoutPiutangInput, PelunasanPiutangUncheckedUpdateWithoutPiutangInput>
    create: XOR<PelunasanPiutangCreateWithoutPiutangInput, PelunasanPiutangUncheckedCreateWithoutPiutangInput>
  }

  export type PelunasanPiutangUpdateWithWhereUniqueWithoutPiutangInput = {
    where: PelunasanPiutangWhereUniqueInput
    data: XOR<PelunasanPiutangUpdateWithoutPiutangInput, PelunasanPiutangUncheckedUpdateWithoutPiutangInput>
  }

  export type PelunasanPiutangUpdateManyWithWhereWithoutPiutangInput = {
    where: PelunasanPiutangScalarWhereInput
    data: XOR<PelunasanPiutangUpdateManyMutationInput, PelunasanPiutangUncheckedUpdateManyWithoutPiutangInput>
  }

  export type PelunasanPiutangScalarWhereInput = {
    AND?: PelunasanPiutangScalarWhereInput | PelunasanPiutangScalarWhereInput[]
    OR?: PelunasanPiutangScalarWhereInput[]
    NOT?: PelunasanPiutangScalarWhereInput | PelunasanPiutangScalarWhereInput[]
    id?: StringFilter<"PelunasanPiutang"> | string
    piutangId?: StringFilter<"PelunasanPiutang"> | string
    jumlah?: FloatFilter<"PelunasanPiutang"> | number
    tanggal?: DateTimeFilter<"PelunasanPiutang"> | Date | string
    catatan?: StringNullableFilter<"PelunasanPiutang"> | string | null
  }

  export type PiutangCreateWithoutPelunasanInput = {
    id?: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
    milkSale: MilkSaleCreateNestedOneWithoutPiutangInput
  }

  export type PiutangUncheckedCreateWithoutPelunasanInput = {
    id?: string
    milkSaleId: string
    jumlahAwal: number
    sisaPiutang: number
    lunas?: boolean
    createdAt?: Date | string
  }

  export type PiutangCreateOrConnectWithoutPelunasanInput = {
    where: PiutangWhereUniqueInput
    create: XOR<PiutangCreateWithoutPelunasanInput, PiutangUncheckedCreateWithoutPelunasanInput>
  }

  export type PiutangUpsertWithoutPelunasanInput = {
    update: XOR<PiutangUpdateWithoutPelunasanInput, PiutangUncheckedUpdateWithoutPelunasanInput>
    create: XOR<PiutangCreateWithoutPelunasanInput, PiutangUncheckedCreateWithoutPelunasanInput>
    where?: PiutangWhereInput
  }

  export type PiutangUpdateToOneWithWhereWithoutPelunasanInput = {
    where?: PiutangWhereInput
    data: XOR<PiutangUpdateWithoutPelunasanInput, PiutangUncheckedUpdateWithoutPelunasanInput>
  }

  export type PiutangUpdateWithoutPelunasanInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    milkSale?: MilkSaleUpdateOneRequiredWithoutPiutangNestedInput
  }

  export type PiutangUncheckedUpdateWithoutPelunasanInput = {
    id?: StringFieldUpdateOperationsInput | string
    milkSaleId?: StringFieldUpdateOperationsInput | string
    jumlahAwal?: FloatFieldUpdateOperationsInput | number
    sisaPiutang?: FloatFieldUpdateOperationsInput | number
    lunas?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutBastDocumentsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogCreateNestedManyWithoutUserInput
    productions?: MilkProductionCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutBastDocumentsInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: SystemLogUncheckedCreateNestedManyWithoutUserInput
    productions?: MilkProductionUncheckedCreateNestedManyWithoutCreatedByInput
    packagings?: MilkPackagingUncheckedCreateNestedManyWithoutCreatedByInput
    outflows?: MilkOutflowUncheckedCreateNestedManyWithoutCreatedByInput
    sales?: MilkSaleUncheckedCreateNestedManyWithoutCreatedByInput
    packagedProducts?: PackagedProductUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutBastDocumentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBastDocumentsInput, UserUncheckedCreateWithoutBastDocumentsInput>
  }

  export type UserUpsertWithoutBastDocumentsInput = {
    update: XOR<UserUpdateWithoutBastDocumentsInput, UserUncheckedUpdateWithoutBastDocumentsInput>
    create: XOR<UserCreateWithoutBastDocumentsInput, UserUncheckedCreateWithoutBastDocumentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBastDocumentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBastDocumentsInput, UserUncheckedUpdateWithoutBastDocumentsInput>
  }

  export type UserUpdateWithoutBastDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutBastDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: SystemLogUncheckedUpdateManyWithoutUserNestedInput
    productions?: MilkProductionUncheckedUpdateManyWithoutCreatedByNestedInput
    packagings?: MilkPackagingUncheckedUpdateManyWithoutCreatedByNestedInput
    outflows?: MilkOutflowUncheckedUpdateManyWithoutCreatedByNestedInput
    sales?: MilkSaleUncheckedUpdateManyWithoutCreatedByNestedInput
    packagedProducts?: PackagedProductUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type SystemLogCreateManyUserInput = {
    id?: string
    userEmail: string
    action: string
    level?: string
    details?: string | null
    createdAt?: Date | string
  }

  export type MilkProductionCreateManyCreatedByInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    categoryId?: string | null
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingCreateManyCreatedByInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    categoryId?: string | null
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowCreateManyCreatedByInput = {
    id?: string
    date?: Date | string
    categoryId: string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkSaleCreateManyCreatedByInput = {
    id?: string
    transactionId?: string | null
    date?: Date | string
    tanggal?: Date | string
    sumber?: string
    produkRefId?: string | null
    jumlah?: number
    pembeli?: string
    hargaJual?: number
    kategoriBayar?: string
    catatan?: string | null
    productCategory?: string
    productSubtype?: string | null
    variant?: string | null
    packagingType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    status?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BastDocumentCreateManyCreatedByInput = {
    id?: string
    nomorBast: string
    tanggal?: Date | string
    sumber?: string
    volumeLiters?: number
    jenisPermintaan?: string
    instansiPenerima?: string | null
    pengirimNama: string
    pengirimRole?: string
    penerimaNama?: string | null
    penerimaRole?: string | null
    status?: string
    catatan?: string | null
    confirmedAt?: Date | string | null
    productionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackagedProductCreateManyCreatedByInput = {
    id?: string
    tanggal?: Date | string
    jenisProduk: string
    kemasan: string
    jumlah?: number
    status?: string
    receivedAt?: Date | string | null
    receivedByName?: string | null
    condition?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SystemLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    userEmail?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneWithoutProductionsNestedInput
  }

  export type MilkProductionUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneWithoutPackagingsNestedInput
  }

  export type MilkPackagingUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: MilkCategoryUpdateOneRequiredWithoutOutflowsNestedInput
  }

  export type MilkOutflowUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    categoryId?: StringFieldUpdateOperationsInput | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkSaleUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    piutang?: PiutangUpdateOneWithoutMilkSaleNestedInput
  }

  export type MilkSaleUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    piutang?: PiutangUncheckedUpdateOneWithoutMilkSaleNestedInput
  }

  export type MilkSaleUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    produkRefId?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: FloatFieldUpdateOperationsInput | number
    pembeli?: StringFieldUpdateOperationsInput | string
    hargaJual?: FloatFieldUpdateOperationsInput | number
    kategoriBayar?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: FloatFieldUpdateOperationsInput | number
    totalPrice?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BastDocumentUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BastDocumentUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BastDocumentUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    nomorBast?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sumber?: StringFieldUpdateOperationsInput | string
    volumeLiters?: FloatFieldUpdateOperationsInput | number
    jenisPermintaan?: StringFieldUpdateOperationsInput | string
    instansiPenerima?: NullableStringFieldUpdateOperationsInput | string | null
    pengirimNama?: StringFieldUpdateOperationsInput | string
    pengirimRole?: StringFieldUpdateOperationsInput | string
    penerimaNama?: NullableStringFieldUpdateOperationsInput | string | null
    penerimaRole?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    productionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackagedProductUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jenisProduk?: StringFieldUpdateOperationsInput | string
    kemasan?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionCreateManyCategoryInput = {
    id?: string
    date?: Date | string
    tanggal?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    grossVolumeLiters?: number
    produksi?: number
    pedetVolumeLiters?: number
    setorPedet?: number
    afkirVolumeLiters?: number
    rusakAfkir?: number
    usageType?: string | null
    usageVolumeLiters?: number
    rawVolumeLiters?: number
    kirimKePI?: number
    processedLiters?: number
    packagedQty?: number
    status?: string
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkPackagingCreateManyCategoryInput = {
    id?: string
    date?: Date | string
    productCategory?: string
    productSubtype?: string | null
    origin?: string
    variant?: string | null
    animalType?: string
    processedAmount?: number
    processedUnit?: string
    processedLiters?: number
    packagingDetails?: string | null
    packagingType?: string | null
    packageSize?: string | null
    botolQty?: number
    cupQty?: number
    plastikBantalQty?: number
    totalPackagedQty?: number
    status?: string
    sentAt?: Date | string | null
    sentById?: string | null
    sentByName?: string | null
    receivedAt?: Date | string | null
    receivedById?: string | null
    receivedByName?: string | null
    quantitySent?: number
    quantityReceived?: number
    condition?: string | null
    receptionNotes?: string | null
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkOutflowCreateManyCategoryInput = {
    id?: string
    date?: Date | string
    productType?: string
    animalType?: string
    packagingType?: string
    quantity?: number
    notes?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MilkProductionUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutProductionsNestedInput
  }

  export type MilkProductionUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkProductionUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    grossVolumeLiters?: FloatFieldUpdateOperationsInput | number
    produksi?: FloatFieldUpdateOperationsInput | number
    pedetVolumeLiters?: FloatFieldUpdateOperationsInput | number
    setorPedet?: FloatFieldUpdateOperationsInput | number
    afkirVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rusakAfkir?: FloatFieldUpdateOperationsInput | number
    usageType?: NullableStringFieldUpdateOperationsInput | string | null
    usageVolumeLiters?: FloatFieldUpdateOperationsInput | number
    rawVolumeLiters?: FloatFieldUpdateOperationsInput | number
    kirimKePI?: FloatFieldUpdateOperationsInput | number
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutPackagingsNestedInput
  }

  export type MilkPackagingUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkPackagingUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productCategory?: StringFieldUpdateOperationsInput | string
    productSubtype?: NullableStringFieldUpdateOperationsInput | string | null
    origin?: StringFieldUpdateOperationsInput | string
    variant?: NullableStringFieldUpdateOperationsInput | string | null
    animalType?: StringFieldUpdateOperationsInput | string
    processedAmount?: FloatFieldUpdateOperationsInput | number
    processedUnit?: StringFieldUpdateOperationsInput | string
    processedLiters?: FloatFieldUpdateOperationsInput | number
    packagingDetails?: NullableStringFieldUpdateOperationsInput | string | null
    packagingType?: NullableStringFieldUpdateOperationsInput | string | null
    packageSize?: NullableStringFieldUpdateOperationsInput | string | null
    botolQty?: IntFieldUpdateOperationsInput | number
    cupQty?: IntFieldUpdateOperationsInput | number
    plastikBantalQty?: IntFieldUpdateOperationsInput | number
    totalPackagedQty?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentById?: NullableStringFieldUpdateOperationsInput | string | null
    sentByName?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedById?: NullableStringFieldUpdateOperationsInput | string | null
    receivedByName?: NullableStringFieldUpdateOperationsInput | string | null
    quantitySent?: IntFieldUpdateOperationsInput | number
    quantityReceived?: IntFieldUpdateOperationsInput | number
    condition?: NullableStringFieldUpdateOperationsInput | string | null
    receptionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneWithoutOutflowsNestedInput
  }

  export type MilkOutflowUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MilkOutflowUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    productType?: StringFieldUpdateOperationsInput | string
    animalType?: StringFieldUpdateOperationsInput | string
    packagingType?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PelunasanPiutangCreateManyPiutangInput = {
    id?: string
    jumlah: number
    tanggal?: Date | string
    catatan?: string | null
  }

  export type PelunasanPiutangUpdateWithoutPiutangInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PelunasanPiutangUncheckedUpdateWithoutPiutangInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PelunasanPiutangUncheckedUpdateManyWithoutPiutangInput = {
    id?: StringFieldUpdateOperationsInput | string
    jumlah?: FloatFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkCategoryCountOutputTypeDefaultArgs instead
     */
    export type MilkCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PiutangCountOutputTypeDefaultArgs instead
     */
    export type PiutangCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PiutangCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AdminDefaultArgs instead
     */
    export type AdminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AdminDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SystemLogDefaultArgs instead
     */
    export type SystemLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SystemLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkCategoryDefaultArgs instead
     */
    export type MilkCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkProductionDefaultArgs instead
     */
    export type MilkProductionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkProductionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackagedProductDefaultArgs instead
     */
    export type PackagedProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackagedProductDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkPackagingDefaultArgs instead
     */
    export type MilkPackagingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkPackagingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkOutflowDefaultArgs instead
     */
    export type MilkOutflowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkOutflowDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MilkSaleDefaultArgs instead
     */
    export type MilkSaleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MilkSaleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PiutangDefaultArgs instead
     */
    export type PiutangArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PiutangDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PelunasanPiutangDefaultArgs instead
     */
    export type PelunasanPiutangArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PelunasanPiutangDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BastDocumentDefaultArgs instead
     */
    export type BastDocumentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BastDocumentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NotificationDefaultArgs instead
     */
    export type NotificationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NotificationDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
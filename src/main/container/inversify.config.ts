import "reflect-metadata";

import {
  BcryptPasswordService,
  IPasswordService,
} from "../../application/services/password.service.js";
import {
  IIdGenerator,
  UuidGenerator,
} from "../../application/services/id.service.js";

import { AuthenticateUserUseCase } from "../../application/use-cases/user/authenticate-user.use-case.js";
import { CategoryController } from "../../presentation/controllers/category.controller.js";
import { Container } from "inversify";
import { CreateUserUseCase } from "../../application/use-cases/user/create-user.use-case.js";
import { GetUserProfileUseCase } from "../../application/use-cases/user/get-user-profile.use-case.js";
import { DI_TYPES } from "./ioc.types.js";
import { GetNewsByCategoryUseCase } from "../../application/use-cases/news/get-news-by-category.use-case.js";
import { ICategoryRepository } from "../../domain/repositories/category.repository.interface.js";
import { INewsRepository } from "../../domain/repositories/news.repository.interface.js";
import { ISavedNewsRepository } from "../../domain/repositories/saved-news.repository.interface.js";
import { ITokenService } from "../../application/services/token.service.js";
import { ITwitterAccountFollowRepository } from "../../domain/repositories/twitter-account-follow.repository.interface.js";
import { ITwitterAccountRepository } from "../../domain/repositories/twitter-account.repository.interface.js";
import { ITwitterRepository } from "../../domain/repositories/twitter.repository.interface.js";
import { IUserRepository } from "../../domain/repositories/user.repository.interface.js";
import { IUserSourceFollowRepository } from "../../domain/repositories/user-source-follow.repository.interface.js";
import { ISourceRepository } from "../../domain/repositories/source.repository.interface.js";
import { JwtTokenService } from "../../infrastructure/security/jwt-token.service.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { ListCategoriesWithNewsUseCase } from "../../application/use-cases/category/list-categories-with-news.use-case.js";
import { ListSourcesUseCase } from "../../application/use-cases/source/list-sources.use-case.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";
import { FollowSourceUseCase } from "../../application/use-cases/user-source-follow/follow-source.use-case.js";
import { UnfollowSourceUseCase } from "../../application/use-cases/user-source-follow/unfollow-source.use-case.js";
import { SyncFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/sync-followed-sources.use-case.js";
import { ListFollowedTwitterAccountsUseCase } from "../../application/use-cases/twitter-account/list-followed-twitter-accounts.use-case.js";
import { ListNewsUseCase } from "../../application/use-cases/news/list-news.use-case.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { ListTweetsUseCase } from "../../application/use-cases/twitter/list-tweets.use-case.js";
import { MongoCategoryRepository } from "../../infrastructure/repositories/category/category.mongoose.js";
import { MongoNewsRepository } from "../../infrastructure/repositories/news/news.mongoose.js";
import { MongoSavedNewsRepository } from "../../infrastructure/repositories/saved-news/saved-news.mongoose.js";
import { MongoTwitterAccountFollowRepository } from "../../infrastructure/repositories/twitter-account-follow/twitter-account-follow.mongoose.js";
import { MongoTwitterAccountRepository } from "../../infrastructure/repositories/twitter-account/twitter-account.mongoose.js";
import { MongoTwitterRepository } from "../../infrastructure/repositories/twitter/twitter.mongoose.js";
import { MongoUserRepository } from "../../infrastructure/repositories/user/user.mongoose.js";
import { MongoUserSourceFollowRepository } from "../../infrastructure/repositories/user-source-follow/user-source-follow.mongoose.js";
import { MongoSourceRepository } from "../../infrastructure/repositories/source/source.mongoose.js";
import { NewsController } from "../../presentation/controllers/news.controller.js";
import { RemoveSavedNewsUseCase } from "../../application/use-cases/saved-news/remove-saved-news.use-case.js";
import { SaveNewsUseCase } from "../../application/use-cases/saved-news/save-news.use-case.js";
import { SavedNewsController } from "../../presentation/controllers/saved-news.controller.js";
import { TwitterController } from "../../presentation/controllers/twitter.controller.js";
import { UserSourceFollowController } from "../../presentation/controllers/user-source-follow.controller.js";
import { UserController } from "../../presentation/controllers/user.controller.js";

export const container = new Container();

container
  .bind<IUserRepository>(DI_TYPES.UserRepository)
  .to(MongoUserRepository)
  .inSingletonScope();
container
  .bind<ICategoryRepository>(DI_TYPES.CategoryRepository)
  .to(MongoCategoryRepository)
  .inSingletonScope();
container
  .bind<INewsRepository>(DI_TYPES.NewsRepository)
  .to(MongoNewsRepository)
  .inSingletonScope();
container
  .bind<ITwitterAccountRepository>(DI_TYPES.TwitterAccountRepository)
  .to(MongoTwitterAccountRepository)
  .inSingletonScope();
container
  .bind<ITwitterAccountFollowRepository>(
    DI_TYPES.TwitterAccountFollowRepository
  )
  .to(MongoTwitterAccountFollowRepository)
  .inSingletonScope();

container
  .bind<ISavedNewsRepository>(DI_TYPES.SavedNewsRepository)
  .to(MongoSavedNewsRepository)
  .inSingletonScope();

container
  .bind<IUserSourceFollowRepository>(DI_TYPES.UserSourceFollowRepository)
  .to(MongoUserSourceFollowRepository)
  .inSingletonScope();

container
  .bind<ISourceRepository>(DI_TYPES.SourceRepository)
  .to(MongoSourceRepository)
  .inSingletonScope();

container
  .bind<ITwitterRepository>(DI_TYPES.TwitterRepository)
  .to(MongoTwitterRepository)
  .inSingletonScope();

container
  .bind<IPasswordService>(DI_TYPES.PasswordService)
  .to(BcryptPasswordService)
  .inSingletonScope();
container
  .bind<ITokenService>(DI_TYPES.TokenService)
  .to(JwtTokenService)
  .inSingletonScope();
container
  .bind<IIdGenerator>(DI_TYPES.IdGenerator)
  .to(UuidGenerator)
  .inSingletonScope();

container
  .bind<CreateUserUseCase>(DI_TYPES.CreateUserUseCase)
  .to(CreateUserUseCase);
container
  .bind<GetUserProfileUseCase>(DI_TYPES.GetUserProfileUseCase)
  .to(GetUserProfileUseCase);
container
  .bind<AuthenticateUserUseCase>(DI_TYPES.AuthenticateUserUseCase)
  .to(AuthenticateUserUseCase);
container.bind<ListNewsUseCase>(DI_TYPES.ListNewsUseCase).to(ListNewsUseCase);
container
  .bind<GetNewsByCategoryUseCase>(DI_TYPES.GetNewsByCategoryUseCase)
  .to(GetNewsByCategoryUseCase);
container
  .bind<ListCategoriesUseCase>(DI_TYPES.ListCategoriesUseCase)
  .to(ListCategoriesUseCase);
container
  .bind<ListCategoriesWithNewsUseCase>(DI_TYPES.ListCategoriesWithNewsUseCase)
  .to(ListCategoriesWithNewsUseCase);

container
  .bind<ListFollowedTwitterAccountsUseCase>(
    DI_TYPES.ListFollowedTwitterAccountsUseCase
  )
  .to(ListFollowedTwitterAccountsUseCase);
container
  .bind<ListTweetsUseCase>(DI_TYPES.ListTweetsUseCase)
  .to(ListTweetsUseCase);

container.bind<SaveNewsUseCase>(DI_TYPES.SaveNewsUseCase).to(SaveNewsUseCase);
container
  .bind<ListSavedNewsUseCase>(DI_TYPES.ListSavedNewsUseCase)
  .to(ListSavedNewsUseCase);
container
  .bind<RemoveSavedNewsUseCase>(DI_TYPES.RemoveSavedNewsUseCase)
  .to(RemoveSavedNewsUseCase);
container
  .bind<ListSourcesUseCase>(DI_TYPES.ListSourcesUseCase)
  .to(ListSourcesUseCase);
container
  .bind<ListFollowedSourcesUseCase>(DI_TYPES.ListFollowedSourcesUseCase)
  .to(ListFollowedSourcesUseCase);
container
  .bind<FollowSourceUseCase>(DI_TYPES.FollowSourceUseCase)
  .to(FollowSourceUseCase);
container
  .bind<UnfollowSourceUseCase>(DI_TYPES.UnfollowSourceUseCase)
  .to(UnfollowSourceUseCase);
container
  .bind<SyncFollowedSourcesUseCase>(DI_TYPES.SyncFollowedSourcesUseCase)
  .to(SyncFollowedSourcesUseCase);
container.bind(UserController).toSelf();
container.bind(NewsController).toSelf();
container.bind(SavedNewsController).toSelf();
container.bind(CategoryController).toSelf();
container.bind(TwitterController).toSelf();
container.bind(UserSourceFollowController).toSelf();

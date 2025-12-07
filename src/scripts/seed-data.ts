import "dotenv/config";

import { BcryptPasswordService } from "../application/services/password.service.js";
import { CategoryModel } from "../infrastructure/persistence/mongoose/models/category.model.js";
import { NewsModel } from "../infrastructure/persistence/mongoose/models/news.model.js";
import { SavedNewsModel } from "../infrastructure/persistence/mongoose/models/saved-news.model.js";
import { SourceCategoryModel } from "../infrastructure/persistence/mongoose/models/source-category.model.js";
import { SourceModel } from "../infrastructure/persistence/mongoose/models/source.model.js";
import { TweetModel } from "../infrastructure/persistence/mongoose/models/tweet.model.js";
import { TwitterAccountFollowModel } from "../infrastructure/persistence/mongoose/models/twitter-account-follow.model.js";
import { TwitterAccountModel } from "../infrastructure/persistence/mongoose/models/twitter-account.model.js";
import { UserModel } from "../infrastructure/persistence/mongoose/models/user.model.js";
import { UserSourceFollowModel } from "../infrastructure/persistence/mongoose/models/user-source-follow.model.js";
import { UuidGenerator } from "../application/services/id.service.js";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

const CATEGORY_COUNT = 10;
const NEWS_COUNT = 2000;
const SAVED_NEWS_PER_USER = 100;
const TWEET_COUNT = 120;
const TWITTER_ACCOUNT_COUNT = 40;
const USER_COUNT = 10;
const SOURCE_CATEGORY_COUNT = 3;
const SOURCE_COUNT = 30;

const idGenerator = new UuidGenerator();
const passwordService = new BcryptPasswordService();

async function clearCollections() {
  await Promise.all([
    CategoryModel.deleteMany({}),
    NewsModel.deleteMany({}),
    SavedNewsModel.deleteMany({}),
    SourceCategoryModel.deleteMany({}),
    SourceModel.deleteMany({}),
    TweetModel.deleteMany({}),
    UserModel.deleteMany({}),
    UserSourceFollowModel.deleteMany({}),
    TwitterAccountModel.deleteMany({}),
    TwitterAccountFollowModel.deleteMany({}),
  ]);
}

function buildCategories() {
  return Array.from({ length: CATEGORY_COUNT }, () => ({
    _id: idGenerator.generate(),
    name: faker.word.words({ count: { min: 1, max: 2 } }),
    description: faker.lorem.sentence(),
    colorCode: faker.color.rgb({ prefix: "#" }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
  }));
}

function buildNews(
  categories: { _id: string }[],
  sources: { _id: string; imageUrl: string; name: string }[]
) {
  return Array.from({ length: NEWS_COUNT }, () => {
    const category = faker.helpers.arrayElement(categories)!;
    const source = faker.helpers.arrayElement(sources)!;
    return {
      _id: idGenerator.generate(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs({ min: 2, max: 4 }),
      imageUrl: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
      categoryId: category._id,
      sourceId: source._id,
      sourceProfilePictureUrl: source.imageUrl,
      sourceTitle: source.name,
      publishedAt: faker.date.recent({ days: 90 }),
      isLatest: faker.datatype.boolean(),
      isPopular: faker.datatype.boolean(),
    };
  });
}

function buildTweets(
  accounts: { _id: string; displayName: string; imageUrl: string }[]
) {
  if (accounts.length === 0) {
    throw new Error("At least one Twitter account is required to seed tweets.");
  }

  return Array.from({ length: TWEET_COUNT }, () => {
    const account = faker.helpers.arrayElement(accounts)!;
    return {
      _id: idGenerator.generate(),
      accountId: account._id,
      accountName: account.displayName,
      accountImageUrl: account.imageUrl,
      content: faker.lorem.paragraphs({ min: 1, max: 3 }),
      createdAt: faker.date.recent({ days: 120 }),
      isPopular: faker.datatype.boolean(),
    };
  });
}

function buildTwitterAccounts() {
  return Array.from({ length: TWITTER_ACCOUNT_COUNT }, () => ({
    _id: idGenerator.generate(),
    handle: `@${faker.internet.username().toLowerCase()}`,
    displayName: faker.person.fullName(),
    imageUrl: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    createdAt: faker.date.past({ years: 3 }),
  }));
}

function buildTwitterFollows(
  users: { _id: string }[],
  accounts: { _id: string }[]
) {
  const follows: { _id: string; userId: string; accountId: string }[] = [];
  users.forEach((user) => {
    const selected = faker.helpers.arrayElements(accounts, {
      min: 1,
      max: Math.min(6, accounts.length),
    });
    selected.forEach((account) =>
      follows.push({
        _id: idGenerator.generate(),
        userId: user._id,
        accountId: account._id,
      })
    );
  });
  return follows;
}

async function buildUsers() {
  const users = [];
  for (let i = 0; i < USER_COUNT; i += 1) {
    const password = await passwordService.hash(`P@ssword${i + 1}!`);
    users.push({
      _id: idGenerator.generate(),
      name: faker.person.fullName(),
      imageUrl: faker.image.avatar(),
      email: faker.internet.email(),
      password,
    });
  }
  return users;
}

function buildSourceCategories() {
  return Array.from({ length: SOURCE_CATEGORY_COUNT }, () => ({
    _id: idGenerator.generate(),
    name: faker.word.words({ count: { min: 1, max: 2 } }),
    description: faker.lorem.sentence(),
  }));
}

function buildSources(sourceCategories: { _id: string }[]) {
  return Array.from({ length: SOURCE_COUNT }, () => {
    const category = faker.helpers.arrayElement(sourceCategories)!;
    return {
      _id: idGenerator.generate(),
      name: faker.company.name(),
      description: faker.lorem.sentences({ min: 1, max: 2 }),
      imageUrl: faker.image.urlPicsumPhotos({ width: 640, height: 640 }),
      sourceCategoryId: category._id,
    };
  });
}

function buildUserFollows(
  users: { _id: string }[],
  sources: { _id: string }[]
) {
  const follows: { _id: string; userId: string; sourceId: string }[] = [];
  users.forEach((user) => {
    const selected = faker.helpers.arrayElements(sources, {
      min: 1,
      max: Math.min(5, sources.length),
    });
    selected.forEach((source) =>
      follows.push({
        _id: idGenerator.generate(),
        userId: user._id,
        sourceId: source._id,
      })
    );
  });
  return follows;
}

type SavedNewsSeed = {
  _id: string;
  userId: string;
  newsId: string;
  savedAt: Date;
};

function buildSavedNews(
  users: { _id: string }[],
  newsItems: { _id: string }[]
) {
  const saved: SavedNewsSeed[] = [];
  users.forEach((user) => {
    const maxForUser = Math.min(SAVED_NEWS_PER_USER, newsItems.length);
    if (maxForUser === 0) {
      return;
    }

    const selected = faker.helpers.arrayElements(newsItems, {
      min: 1,
      max: faker.number.int({ min: 1, max: maxForUser }),
    });
    selected.forEach((news) => {
      saved.push({
        _id: idGenerator.generate(),
        userId: user._id,
        newsId: news._id,
        savedAt: faker.date.recent({ days: 30 }),
      });
    });
  });

  return saved;
}

async function main() {
  const uri =
    process.env.MONGO_URI ?? "mongodb://localhost:27017/news-backend-test";
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB at ${uri}`);

  await clearCollections();

  const categories = buildCategories();
  await CategoryModel.insertMany(categories);
  console.log(`Inserted ${categories.length} categories.`);

  const sourceCategories = buildSourceCategories();
  await SourceCategoryModel.insertMany(sourceCategories);
  console.log(`Inserted ${sourceCategories.length} source categories.`);

  const sources = buildSources(sourceCategories);
  await SourceModel.insertMany(sources);
  console.log(`Inserted ${sources.length} sources.`);

  const news = buildNews(categories, sources);
  await NewsModel.insertMany(news);
  console.log(`Inserted ${news.length} news items.`);

  const twitterAccounts = buildTwitterAccounts();
  await TwitterAccountModel.insertMany(twitterAccounts);
  console.log(`Inserted ${twitterAccounts.length} twitter accounts.`);

  const tweets = buildTweets(twitterAccounts);
  await TweetModel.insertMany(tweets);
  console.log(`Inserted ${tweets.length} tweets.`);

  const users = await buildUsers();
  await UserModel.insertMany(users);
  console.log(`Inserted ${users.length} users.`);

  const savedNews = buildSavedNews(users, news);
  await SavedNewsModel.insertMany(savedNews);
  console.log(`Inserted ${savedNews.length} saved news entries.`);

  const follows = buildUserFollows(users, sources);
  await UserSourceFollowModel.insertMany(follows);
  console.log(`Inserted ${follows.length} user-source follows.`);

  const twitterFollows = buildTwitterFollows(users, twitterAccounts);
  await TwitterAccountFollowModel.insertMany(twitterFollows);
  console.log(`Inserted ${twitterFollows.length} account follows.`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((error) => {
  console.error("Failed to seed data:", error);
  process.exit(1);
});

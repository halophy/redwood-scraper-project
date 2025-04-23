# README

Welcome to [RedwoodJS](https://redwoodjs.com)!

<img width="1440" alt="image" src="https://github.com/user-attachments/assets/634416af-13ee-4c52-a39a-12e945fbc7be" />

> **Prerequisites**

Start by installing dependencies:

```
yarn install
```

Then start the development server:

```
yarn redwood dev
```

Your browser should automatically open to [http://localhost:8910](http://localhost:8910) where you'll see the Welcome Page, which links out to many great resources.


## Prisma and the database

Redwood wouldn't be a full-stack framework without a database. It all starts with the schema. Open the [`schema.prisma`](api/db/schema.prisma) file in `api/db` and replace the `UserExample` model with the following `Post` model:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
```

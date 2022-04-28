## Introduction

- This is the most secure implementation for jwt based authorization
- is production ready

## How it works

- New refresh and access token are generated on every login or refresh
- A Single refresh token can only be used once

## Motivation

- The stateless nature of JWT has brought a major breakthrough. However, It is not without some fault. This very nature has made it less secure. For instance, There's no way to invalidate a stolen JWT until it expires.
- There are various ways how developers try to mitigate this issue
- A popular solution is to send both refresh token and access token
- The refresh token is long lived (1 year) wheres access token is short lived (1 hour)
- The refresh token is used to generate new access token without any connection to mongodb database
- This can also boost user experience as user do not have to fill login form after access token expires

## What has refresh token solved?

- Better user experience for client as no need to fill login form every hour
- Can generate access key without any connecting to our (expensive) database
- Highly secure and industry standard

## What if refresh token gets stolen?

- To solve this, We will make sure refresh token can only be used once
- For every login / refresh, new access token and refresh tokens are generated
- Old refresh token in redis is also replaced by new refresh token
- This again, can only be used once

## What if we want to use multiple users?

- We can allow storing multiple refresh tokens for the same id
- We can use Zset of redis
- Or just push token to array, `JSON.stringify()` it and store in redis
- `JSON.parse()` to convert back and do manipulation accordingly

## Roadmap

- Redis Zset will soon be used so, users from multiple devices can login simultaneously.

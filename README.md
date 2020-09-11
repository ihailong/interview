# Summary

The main purpose of this repository is for an interview that create a short URL generator service.

# Table of contents:

- [Summary](#summary)
- [Table of contents:](#table-of-contents)
- [Pre-reqs](#pre-reqs)
- [Getting started](#getting-started)
  - [Running the build](#running-the-build)
- [Testing](#testing)
  - [Running tests](#running-tests)
- [Design considerations](#design-considerations)
- [License](#license)

# Pre-reqs
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Install [VS Code](https://code.visualstudio.com/)

# Getting started
- Clone the repository
```
git clone https://github.com/ihailong/interview 
```
- Install dependencies
```
cd interview
npm install
```
- Configure your mongoDB server and make sure config the mongoDB url in environment file(./config/development.env)
```
# Get this from https://mlab.com/home after you've logged in and created a database
# MONGODB_URI=mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url>

# This is standard running mongodb locally
MONGODB_URI_LOCAL=mongodb://localhost:27017/interview

```

## Running the build
```
npm run serve
```


# Testing
Simply choose [Jest](https://facebook.github.io/jest/) as our test framework, since jest perfectly compatible with mocha syntax. Although Mocha is probably more popular, Jest gives a better test coverage report.

## Running tests
Simply run `npm run test`.
This will also generate a coverage report.

# Design considerations

  - ## Algorithm to create the short URL id
  id is the most important identifier for a short url, it could be anything as long as hold tens of thousands of urls, but it also limited that the identifier alphabet must some valid url alphabet, here I assume the best alphabet would be a-zA-Z0-9, which length is 52. Also, id itself can not hold as many as information of a url, we must use storage to persist the mapping, so the id here is actually a number, though it represent to user a short alphabet string. Base on the above analysis, I use base52 algorithm to save the id, how to create the baseN encode for a number is very simple, just use integer divide and mod, so I just a module call "base52" to generate the encoding.

  - ## How to save the id namespace to prevent it break the limit
  id is auto-increment, by 1 everytime a new url is generated, however, for a very large service, the number format of id also have its limitation, so, for this case, it's required that the length of the encode should not be longer than 8, that means, the max id number is Math.pow(52, 8)-1, for url id that larger than this, we should create some strategy to reuse the id namesapce, here I use mod(%), that means, overwrite the previous generated id since it might to be too old to use, it's obsolete.

  - ## How to prevent creating new id for the same url
  for the same url, we don't create a new id for it since it's no use, just a waste of id resource, so here I create a hash for the url, if we found the same hash in our db, we just return the pre-genereated id for this url.

  - ## Performance, search fast
  to gain the best performance for a web service, cache and index is a must, we should use a cache like redis somehow here. but for this case, I just use a hash index for the hashed value of a url and the final base52 encode to gain the best search performance.



# License
Copyright (c) by iHailong. All rights reserved.

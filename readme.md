# What is Muah.bio?

Muah.bio is a personal project I made to help makeup artists to monetize their instagram profile through affiliate marketing.

## Setup

After cloning, Create a file in the project root called `.env` that copies the text below and fill it in.

```
MONGODB_URI=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_SECRET_KEY=""
SUBSCRIPTION_PRICE_ID=""
# Rainforest.com for searching amazon products
RAINFOREST_KEY=""
```

Once you have this you can test using the netlify commandline tool `netlify dev`

# Things to know

## Instagram API

After getting everything set up to interact with the Instagram API, I realized that I couldn't apply for API access without a business entity (this was due to COVID, so it may not be that way anymore). To get around this, I wrote a hack that used their private API on the frontend.

See `/src/pages/instagramSetup.js` for how I did this.

## No Typescript

While Ionic is based on Typescript, I didn't feel like using it on a small project I was hacking together, so while there are `*.ts` files, everything is done in good ol' Javascript.

# en passant BOT

Serverless **en passant** discord chess bot made with ❤️ by Cristian.

🦕 Environment built with `deno`, with the
[Discord API V10](https://discord.com/developers/docs/intro).\
🌱 Hosting is provided by [Deno Deploy](https://deno.com/deploy/).\
🗄 Database is provided by [Deno KV](https://deno.com/kv).

### Register Slash Commands:

```sh
deno run --env-file -A register.ts
```

### Regenerate PGN Parser:

```sh
npm install -g peggy
peggy -c peggy.config.mjs
```

### APIs and Services

- Public [lichess.org API](https://lichess.org/api).
- Public [chess.com API](https://www.chess.com/news/view/published-data-api).
- Chess Board [chess.js](https://github.com/jhlywa/chess.js) by `Jeff Hlywa`.

The rights of the `Alpha Chess` Set belong to **Eric Bentzen** and have been
legally purchased. Do not use the chess set if you do not own the rights.

### API Differences

- `InteractionCallbackData` has been renamed to `InteractionResponse`.
- `InteractionResponse` has not been implemented because it's unnecessary.
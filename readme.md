
# en passant BOT

Serverless **en passant** discord chess bot made with ❤️ by Cristian.

🦕 Environment built with `deno`, with the
[Discord API V10](https://discord.com/developers/docs/intro).
🌱 Hosting is provided by [Deno Deploy](https://deno.com/deploy/).\
🗄 Database is provided by [Deno KV](https://deno.com/kv).

### Register Slash Commands:

```
deno run --env-file -A register.ts
```

### APIs and Services

- Public [lichess.org API](https://lichess.org/api).
- Public [chess.com API](https://www.chess.com/news/view/published-data-api).
- Chess Board [beta_chess](https://github.com/cristian-5/beta_chess) based on
[chess.js](https://github.com/jhlywa/chess.js) by `Jeff Hlywa`,
`Cristian Antonuccio` refactor and bug fixes.

The rights of the `Alpha Chess` Set belong to **Eric Bentzen** and have been
legally purchased. Do not use the chess set if you do not own the rights.

### API Differences

- `InteractionCallbackData` has been renamed to `InteractionResponse`.
- `InteractionResponse` has not been implemented because it's unnecessary.
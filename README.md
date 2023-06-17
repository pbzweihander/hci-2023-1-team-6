# HCI Team 6 Project

## Usage

### Build manually

```
cd backend
OPENAI_API_KEY=<openai api key> cargo run
cd ../frontend
yarn dev
```

Open http://localhost:5173/ with browser.

### Docker

```
docker bulid . -t hci-team-6
docker run --rm -e OPENAI_API_KEY=<openai api key> -p 3000:3000 hci-team-6
```

Open http://localhost:3000/ with browser.

## License

This project is licensed under the terms of MIT Licsense.
Check [LICENSE file](./LICENSE) for details.

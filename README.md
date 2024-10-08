# Wanted-Aletheia

알레테이아를 위한 금 거래 서비스

# Quick Start

## ENV 설정

- 각 application 폴더에 `.env.sample` 파일을 참고하여 `.env` 파일을 생성합니다.

  - `apps/auth/.env`
  - `apps/order/.env`

- (선택) root 폴더에 `.env.sample` 파일을 참고하여 `.env` 파일을 생성합니다. (docker-compose 설정)

## 실행

### DB container 실행

- 연결할 DB가 없을 경우, 다음 명령어로 DB container를 실행합니다.
- Docker, docker compose 가 설치되어 있어야 합니다.
- root 폴더에서 다음 명령어를 실행합니다.

```bash
pnpm run db:up
```

### 패키지 설치 및 실행

- pnpm이 설치되어 있어야 합니다.
- nest cli가 설치되어 있어야 합니다.

```bash

pnpm install && pnpm run build && pnpm run start:all

```

각 서버를 따로 실행하고 싶다면

```bash
pnpm run start:auth # auth 서버 실행
pnpm run start:order # order 서버 실행
```

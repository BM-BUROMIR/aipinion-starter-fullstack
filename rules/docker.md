# Docker / RU-зеркала

Базовые образы и пакетные менеджеры идут через RU-зеркала, иначе деплой ломается (Fastly edge `199.232.174.132` режется провайдером).

- `FROM mirror.gcr.io/library/<image>` — pull через Google proxy
- Debian: `sed -i 's|deb.debian.org|mirror.yandex.ru|g' /etc/apt/sources.list.d/debian.sources` перед `apt-get update`
- Alpine: `sed -i 's|https\?://dl-cdn.alpinelinux.org|https://mirror.yandex.ru/mirrors|g' /etc/apk/repositories` перед `apk add`
- Python pip: `ENV PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/`

Полный rule с обоснованием и шаблонами: `~/unite/rules/docker-mirrors.md`.
Issue: [`BM-BUROMIR/YaD_Agent#10`](https://github.com/BM-BUROMIR/YaD_Agent/issues/10).
